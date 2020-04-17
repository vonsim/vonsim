package vonsim.simulator

import scala.util.Random
import scala.collection.mutable
import vonsim.assembly.Compiler.MemoryAddress

import scala.scalajs.js
import js.JSConverters._

import scala.concurrent.Promise
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import scala.collection.mutable.Queue
import scala.collection.mutable.ListBuffer

class Printer() {
	/*
	 * PIO:
	 *	BUSY: PA -> Bit 0 (entrada)
	 *	STROBE: PA -> Bit 1 (salida)
	 * 	DATA1...DATA8: PB -> PB0...PB7 (salida)
	 * 
	 * HANDSHAKE:
	 *	BUSY: ESTADO -> Bit 0 (entrada)
	 *	STROBE: ESTADO -> Bit 1 (salida)
	 * 	DATA1...DATA8: DATOS -> PB0...PB7 (salida)
	 */
	
	var data = Word(0)
	var strobePulse = false
	def busy = (buffer.length == 5)
//	def printing = (buffer.length > 0)
	var printing = false
	
	val buffer = Queue.empty[Word]
	var printedText = ""
	
  val eventTimer = new EventTimer(8000, Array(8000, 4000, 2000, 1000))

	def print() {
		if(buffer.size > 0)
      printedText = printedText + buffer.dequeue().toInt.toChar
	}
	
	def isIdle() = !busy
	def isBusy() = busy
	def isPrinting() = printing
	
	def sendData(d: Word) {
	  data = d
	}
	
	def sendStrobe() {
		strobePulse = true
		if(buffer.size < 5) {
		  buffer += data
		  if(!printing) {
		    eventTimer.start()
		    printing = true
		  }
		}
	}
	
	def getPrintedText() = printedText
  
  def simulatorEvent(actualTime: Long) {
	  if((eventTimer.update(actualTime)) && printing) {
	    print()
	    printing = false
	  }
	}
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }
  
  def reset() {
    buffer.clear()
    printing = false
    printedText = ""
    eventTimer.reset()
  }
}

class PrinterConnection(printer: Printer) {
	def isIdle() = printer.isIdle()
	def isBusy() = printer.isBusy()
	def isPrinting() = printer.isPrinting()
	
	def sendData(d: Word) = printer.sendData(d)
	def sendStrobe() = printer.sendStrobe()
}

class F10Button(pic: PIC) {
  
  var buttonPressed = false
  
  def pressed() {
    buttonPressed = true
  }
  
  def simulatorEvent() {
  	if (buttonPressed) {
  	  pic.picInterruption(0)
  	  buttonPressed = false
  	}
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
    buttonPressed = false
  }
}

class Keys(seed: Long, pio: PIO) {
	
	def PA = pio.readIO(48)
	def CA = pio.readIO(50)
	var value = Word(new Random(seed).nextInt(255))
  pio.writeIO(48, Word(value & CA));
	
	def toggleBit(i: Int) {
  	if(value.bit(i) == 0)
  		value = Word(value | (1 << i));
  	else
  		value = Word(value & ~(1 << i));
  	
  	if(CA.bit(i) == 1) {
	  	if(value.bit(i) == 1)
	  		pio.writeIO(48, Word(PA | (1 << i)));
	  	else
	  		pio.writeIO(48, Word(PA & ~(1 << i)));
  	}
	}
	
  def simulatorEvent() {
    value = Word(PA.toInt & CA.toInt)
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
		value = Word(new Random(seed).nextInt(255))
		pio.writeIO(48, Word(value & CA));
  }
}

class Leds(pio: PIO) {
  
	def PB = pio.readIO(49)
	def CB = pio.readIO(51)
	var value = Word(PB.toInt & ~(CB.toInt))
	
  def simulatorEvent() {
  	value = Word(PB.toInt & ~(CB.toInt))
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  	value = Word(PB.toInt & ~(CB.toInt))
  }
}

class Monitor() {
  
  var text = ""
  
  def addText(textToAdd: String) {
    text += textToAdd
  }
  def getText() = text
  
  def simulatorEvent() {}
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
    text = ""
  }
}

class Timer(seed: Long, pic: PIC) {

  val values: Array[Word] = randomBytes(2).map(Word(_))
  val eventTimer = new EventTimer(800, Array(800))

	def checkTime() {
		var cont = readIO(16).toInt
		val comp = readIO(17).toInt
		
		cont += 1
		if(cont == 256)
			cont = 0
		writeIO(16, Word(cont))
		if(cont == comp)
			pic.picInterruption(1)
	}
  
  def simulatorEvent(actualTime: Long) {
    if(eventTimer.update(actualTime))
      checkTime()
  }
  
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }
  
  def validAddress(address: Int) = ((address >= 16) && (address <= 17))
  def checkAddress(address: Int) {
    if (!validAddress(address))
      throw new InvalidMemoryAddress(address)
  }
  
  def reset() {
    val bytes = randomBytes(values.size)
    bytes.indices.foreach(i => values(i) = Word(bytes(i)))
    eventTimer.reset()
  }
  
  def randomBytes(size: Int) = {
    val values = Array.ofDim[Byte](size)
    new Random(seed).nextBytes(values)
    values
  }
	
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    checkAddress(v.toInt)
  	v match {
      case 16 => values(0) = regValue // CONT
      case 17 => values(1) = regValue // COMP
  	}
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
    checkAddress(v.toInt)
  	v match {
      case 16 => values(0) // CONT | 10h
      case 17 => values(1) // COMP | 11h
  	}
  }
}

class PIO(config: Int, seed: Long, printerConnection: PrinterConnection) {
  
  val values: Array[Word] = randomBytes(4).map(Word(_))

  def simulatorEvent() {}
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def validAddress(address: Int) = ((address >= 48) && (address <= 51))
  def checkAddress(address: Int) {
    if (!validAddress(address))
      throw new InvalidMemoryAddress(address)
  }
  
  def reset() {
    val bytes = randomBytes(values.size)
    bytes.indices.foreach(i => values(i) = Word(bytes(i)))
  }
  
  def randomBytes(size: Int) = {
    val values = Array.ofDim[Byte](size)
    new Random(seed).nextBytes(values)
    values
  }
	
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    checkAddress(v.toInt)
  	v match {
  	  case 48 => { // PA
  	  	if((config == 1) && (values(0).bit(1) == 0) && (values(2).bit(1) == 0) && (regValue.bit(1) == 1))
  	  			printerConnection.sendStrobe()
  	  	values(0) = regValue
  	  }
  	  case 49 => { // PB
  	  	if((config == 1) && (values(3) == Word(0)))
	  			printerConnection.sendData(regValue)
  	  	values(1) = regValue
  	  }
      case 50 => values(2) = regValue // CA
      case 51 => values(3) = regValue // CB
  	}
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
    checkAddress(v.toInt)
  	v match {
  	  case 48 => { // PA | 30h
  	  	if(config == 1) {
  	  		if(printerConnection.isBusy())
						writeIO(48, Word(values(0) | 1)) // PA:0 = 1
  	  		else
						writeIO(48, Word(values(0) & ~1)) // PA:0 = 0
  	  	}
  	  	values(0)
  	  }
  	  case 49 => values(1) // PB | 31h
      case 50 => values(2) // CA | 32h
      case 51 => values(3) // CB | 33h
  	}
  }
}

class PIC(seed: Long) {
	
  def IMR = readIO(33) // 1 -> Ignorar; 0 -> Atender
  def IRR = readIO(34) // 1 -> Pendiente; 0 -> No pendiente
  def ISR = readIO(35) // 1 -> Atendida; 0 -> No se atendió
  
  var acceptInterruptions = false

  val values: Array[Word] = randomBytes(12).map(Word(_))
	var interruptionAdress: Int = 0
	
	writeIO(32, Word(0))
	writeIO(33, Word(0))
	writeIO(34, Word(0))
	writeIO(35, Word(0))
  
  def picInterruption(intX: Int) {
  	writeIO(34, Word(readIO(34) | (1 << intX))) // IRR:X = 1
  }
	
	def isPendingInterruption() = (interruptionAdress != 0)
	def getInterruptionAdress(): Int = {
		var res = interruptionAdress
		interruptionAdress = 0
		res
	}
	
	def interruptionFinished() {
	  writeIO(35, Word(0)) // ISR = 0
	}
	
  def simulatorEvent() {
  	if((IRR != Word(0)) && acceptInterruptions) { // Si hay un llamado de interrupción
  		
  		var intX = -1
  		var i = 0
  		while((i < 8) && (intX == -1)) {
				if(IRR.bit(i) == 1)
					intX = i
				i += 1
			}
  		
			if((IMR.bit(intX) == 0) && (ISR == Word(0))) {
				writeIO(34, Word(readIO(34) & ~(1 << intX))) // IRR:X = 0
				writeIO(35, Word(ISR | (1 << intX))) // ISR:X = 1
				interruptionAdress = (readIO((36+intX).toByte)).toInt * 4
			}
  	}
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def validAddress(address: Int) = ((address >= 32) && (address <= 43))
  def checkAddress(address: Int) {
    if (!validAddress(address))
      throw new InvalidMemoryAddress(address)
  }
  
  def reset() {
		writeIO(32, Word(0))
		writeIO(33, Word(0))
		writeIO(34, Word(0))
		writeIO(35, Word(0))
  }
  
  def randomBytes(size: Int) = {
    val values = Array.ofDim[Byte](size)
    new Random(seed).nextBytes(values)
    values
  }

  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    checkAddress(v.toInt)
    if((v == 32) && (regValue == Word(32)))
      interruptionFinished()
    values(v-32) = regValue
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
    checkAddress(v.toInt)
    values(v-32)
  }
}

class Handshake(seed: Long, pic: PIC, printerConnection: PrinterConnection) {
  
  val values: Array[Word] = randomBytes(2).map(Word(_))
  def state = readIO(65)
  
	writeIO(64, Word(0))
	writeIO(65, Word(0))

  def simulatorEvent() {
  	if((state & 129) == 128) // Estado AND 10000001 = X000000X / 129 = 10000001 / 128 = 10000000 
  		pic.picInterruption(2)
  	if(state.bit(1) == 1) {
  	  printerConnection.sendStrobe()
      writeIO(65, Word(state & 253)) // Estado AND 11111101 = XXXXXX0X
  	}
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def validAddress(address: Int) = ((address >= 64) && (address <= 65))
  def checkAddress(address: Int) {
    if (!validAddress(address)) {
      throw new InvalidMemoryAddress(address)
    }
  }
  
  def reset() {
    writeIO(64, Word(0))
    writeIO(65, Word(0))
  }
  
  def randomBytes(size: Int) = {
    val values = Array.ofDim[Byte](size)
    new Random(seed).nextBytes(values)
    values
  }
	
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    checkAddress(v.toInt)
  	v match {
      case 64 => { // DATO
        printerConnection.sendData(regValue)
        values(0) = regValue
        writeIO(65, Word(state | 2)) // Estado OR 00000010 = XXXXXX1X
      }
      case 65 => values(1) = regValue // ESTADO
  	}
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
    checkAddress(v.toInt)
  	v match {
      case 64 => values(0) // DATO | 40h
      case 65 => { // ESTADO | 41h
	  		if(printerConnection.isBusy())
					writeIO(65, Word(values(1) | 1)) // ESTADO:0 = 1
	  		else
					writeIO(65, Word(values(1) & ~1)) // ESTADO:0 = 0
        values(1)
        
      }
  	}
  }
}

class CDMA(seed: Long, pic: PIC) {
  
  val values: Array[Word] = randomBytes(8).map(Word(_))
  
  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def validAddress(address: Int) = ((address >= 80) && (address <= 87))
  def checkAddress(address: Int) {
    if (!validAddress(address)) {
      throw new InvalidMemoryAddress(address)
    }
  }
  
  def reset() {
    val bytes = randomBytes(values.size)
    bytes.indices.foreach(i => values(i) = Word(bytes(i)))
  }
  
  def randomBytes(size: Int) = {
    val values = Array.ofDim[Byte](size)
    new Random(seed).nextBytes(values)
    values
  }

  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    checkAddress(v.toInt)
  	v match {
      case 80 => values(0) = regValue // RFL
      case 81 => values(1) = regValue // RFH
      case 82 => values(2) = regValue // CONTL
      case 83 => values(3) = regValue // CONTH
      case 84 => values(4) = regValue // RDL
      case 85 => values(5) = regValue // RDH
      case 86 => values(6) = regValue // CTRL
      case 87 => values(7) = regValue // ARRANQUE
  	}
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
    checkAddress(v.toInt)
  	v match {
      case 80 => values(0) // RFL | 50h
      case 81 => values(1) // RFH | 51h
      case 82 => values(2) // CONTL | 52h
      case 83 => values(3) // CONTH | 53h
      case 84 => values(4) // RDL | 54h
      case 85 => values(5) // RDH | 55h
      case 86 => values(6) // CTRL | 56h
      case 87 => values(7) // ARRANQUE | 57h
  	}
  }
}

class EventTimer(var tickTime: Int, val speedValues: Array[Int]) {
  
  var lastTick: Long = 0
  var actualTime: Long = 0
  
  def getTickTime() = tickTime
  def speedUp() {
    tickTime = speedValues((speedValues.indexOf(tickTime) + 1) % speedValues.length)
  }
  
  def start() {
    println("EventTimer started")
    lastTick = actualTime
  }

  def update(newActualTime: Long): Boolean = {
    actualTime = newActualTime
//    if(tickTime == 8000)
//      println("actualTime - lastTick = " + (actualTime - lastTick))
    if((actualTime - lastTick) >= tickTime) {
      lastTick = actualTime
      return true
    }
    return false
  }
  
  def reset() {
    lastTick = 0
  }
}
