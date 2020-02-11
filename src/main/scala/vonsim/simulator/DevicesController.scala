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

class DevicesController(memory: Memory) {
	
  val seed = new Random().nextLong()
  
  // Dispositivos internos
  val printer = new Printer()
  val pic = new PIC(seed)
  val timer = new Timer(seed, pic)
  val pio = new PIO(seed, printer)
  val hand = new Handshake(seed, pic, printer)
  val cdma = new CDMA(seed, pic)
  
  // Dispositivos externos
  val f10 = new F10Button(pic)
  val keys = new Keys(pio)
  val leds = new Leds(pio)
  val monitor = new Monitor()
  
  var config = 0
  
  def simulatorEvent(actualTime: Long) {
  	printer.simulatorEvent(actualTime)
		f10.simulatorEvent()
		keys.simulatorEvent()
		leds.simulatorEvent()
		monitor.simulatorEvent()

		timer.simulatorEvent(actualTime)
		pio.simulatorEvent()
		pic.simulatorEvent()
		hand.simulatorEvent()
		cdma.simulatorEvent()
  }
  
  def isPendingInterruption() = {
    pic.isPendingInterruption()
  }
  
	def getInterruptionAdress(): Int = {
		pic.getInterruptionAdress()
	}
  
//  def interruptionAttended() {
//  	pic.interruptionFinished()
//  }
  
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }
  
  def setConfig(newConfig: Int) {
  	config = newConfig
  	pio.setConfig(newConfig)
  }
  
  def reset() {
    printer.reset()
    f10.reset()
    keys.reset()
    leds.reset()
    monitor.reset()

    timer.reset()
    pio.reset()
    pic.reset()
    hand.reset()
    cdma.reset()
  }
  
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    var adress = v.toInt
    if((adress >= 16) && (adress <= 17))
      timer.writeIO(v, regValue)
    if((adress >= 32) && (adress <= 43))
      pic.writeIO(v, regValue)
    if((adress >= 48) && (adress <= 51))
      pio.writeIO(v, regValue)
    if((adress >= 64) && (adress <= 65))
      hand.writeIO(v, regValue)
    if((adress >= 80) && (adress <= 87))
      cdma.writeIO(v, regValue)
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
    var adress = v.toInt
    if((adress >= 16) && (adress <= 17))
      return timer.readIO(v)
    if((adress >= 32) && (adress <= 43))
      return pic.readIO(v)
    if((adress >= 48) && (adress <= 51))
      return pio.readIO(v)
    if((adress >= 64) && (adress <= 65))
      return hand.readIO(v)
    if((adress >= 80) && (adress <= 87))
      return cdma.readIO(v)
    return null
  }
}

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
	def printing = (buffer.length > 0)
	
	val buffer = Queue.empty[Word]
	var charToPrint = '\0'
	
//	var readyLater = for {
//	  delayed <- delay(20)
//	} yield {
//	  checkPrint()
//	}

  def delay(milliseconds: Int): Future[Unit] = {
  	val p = Promise[Unit]()
  	js.timers.setTimeout(milliseconds) {
	    p.success(())
	  }	
	  p.future
	}

	def checkPrint() {
			if(strobePulse && !busy && (buffer.size < 5)) {
//				charToPrint = buffer.dequeue().toInt.toChar
				strobePulse = false
			}
	}
	
	def isIdle() = !busy
	
	def isBusy() = busy
	
	def isPrinting() = printing
	
	def sendData(d: Word) = {
		data = d
	}
	
	def sendStrobe() = {
			strobePulse = true
			if(buffer.size < 5)
			  buffer += data
	}
	
	def getCharToPrint() = {
		if(printing) {
			charToPrint = buffer.dequeue().toInt.toChar
			if(charToPrint != '\0')
				charToPrint
			else ""
		}
		else
			""
	}
  
  def simulatorEvent(actualTime: Long) {
  	var readyLater = for {
		  delayed <- delay(20)
		} yield {
		  checkPrint()
		}
  }
  
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }
  
  def reset() {
  	buffer.clear()
  }
}

class F10Button(pic: PIC) {
  
  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  }
}

class Keys(pio: PIO) {
	
	def PA = pio.readIO(48)
	def CA = pio.readIO(50)
	var value = Word(PA.toInt & CA.toInt)
  
	def toggleBit(i: Int) {
  	if(value.bit(i) == 0)
  		value = Word(value | (1 << i));
  	else
  		value = Word(value & ~(1 << i));
  	
  	if(CA.bit(i) == 1) {
	  	if(PA.bit(i) == 0)
	  		pio.writeIO(48, Word(PA | (1 << i)));
	  	else
	  		pio.writeIO(48, Word(PA & ~(1 << i)));
  	}
  	
  	pio.simulatorEvent()
	}
	
  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
		value = Word(pio.readIO(48).toInt & pio.readIO(50).toInt)
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
  
  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  }
}

class Timer(seed: Long, pic: PIC) {

  val values: Array[Word] = randomBytes(2).map(Word(_))
  var lastTime: Long = 0

	def check() {
		/*if(s.isSimulatorExecuting() && !s.isDebugging())
			  checkTime()
			else {
		  	check()
			}*/
	}
	
	def checkTime() {
		var cont = readIO(16).toInt
		val comp = readIO(17).toInt
		
		cont += 1
		if(cont == 256)
			cont = 0
		if(cont == comp)
			pic.picInterruption(1)
		writeIO(16, Word(cont))
	}
  
  def simulatorEvent(actualTime: Long) {
  	checkTime()
  }
  
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }
  
  def validAddress(address: Int) = ((address >= 16) && (address <= 17))
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

class PIO(seed: Long, printer: Printer) {
  
  val values: Array[Word] = randomBytes(4).map(Word(_))
  var config = 0

  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def setConfig(newConfig: Int) {
  	config = newConfig
  }
  
  def validAddress(address: Int) = ((address >= 48) && (address <= 51))
  def checkAddress(address: Int) {
    if (!validAddress(address)) {
      throw new InvalidMemoryAddress(address)
    }
  }
  
  def reset() {
  	writeIO(50, Word(255))
  	writeIO(51, Word(0))
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
  	  	if((config == 1) && (values(0).bit(1) == 0) && (regValue.bit(1) == 1))
  	  			printer.sendStrobe()
  	  	values(0) = regValue
  	  }
  	  case 49 => { // PB
  	  	if(config == 1)
	  			printer.sendData(regValue)
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
  	  		if(printer.isBusy())
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
  def IRR = readIO(34)
  def ISR = readIO(35) // 1 -> Atendida; 0 -> No se atendió

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
	
	def interruptionFinished() = writeIO(35, Word(0)) // ISR = 0
	
  def simulatorEvent() {
  	if(IRR != Word(0)) { // Si hay un llamado de interrupción
  		
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
    if (!validAddress(address)) {
      throw new InvalidMemoryAddress(address)
    }
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
  	v match {
      case 32 => { // EOI
      	if(regValue == Word(32))
      		interruptionFinished()
      	values(0) = regValue
      }
      case 33 => values(1) = regValue // IMR
      case 34 => values(2) = regValue // IRR
      case 35 => values(3) = regValue // ISR
      case 36 => values(4) = regValue // INT0
      case 37 => values(5) = regValue // INT1
      case 38 => values(6) = regValue // INT2
      case 39 => values(7) = regValue // INT3
      case 40 => values(8) = regValue // INT4
      case 41 => values(9) = regValue // INT5
      case 42 => values(10) = regValue // INT6
      case 43 => values(11) = regValue // INT7
  	}
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
    checkAddress(v.toInt)
  	v match {
      case 32 => values(0) // EOI | 20h
      case 33 => values(1) // IMR | 21h
      case 34 => values(2) // IRR | 22h
      case 35 => values(3) // ISR | 23h
      case 36 => values(4) // INT0 | 24h
      case 37 => values(5) // INT1 | 25h
      case 38 => values(6) // INT2 | 26h
      case 39 => values(7) // INT3 | 27h
      case 40 => values(8) // INT4 | 28h
      case 41 => values(9) // INT5 | 29h
      case 42 => values(10) // INT6 | 2Ah
      case 43 => values(11) // INT7 | 2Bh
  	}
  }
}

class Handshake(seed: Long, pic: PIC, printer: Printer) {
  
  val values: Array[Word] = randomBytes(2).map(Word(_))
  def state = readIO(65)
  
	writeIO(64, Word(0))
	writeIO(65, Word(0))

  def simulatorEvent() {
  	if((state & 129) == 128) // Estado AND 10000001 = X000000X / 129 = 10000001 / 128 = 10000000 
  		pic.picInterruption(2)
  	if(state.bit(1) == 1) {
  	  printer.sendStrobe()
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
        printer.sendData(regValue)
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
	  		if(printer.isBusy())
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
