package vonsim.simulator

import scala.util.Random
import scala.collection.mutable
import vonsim.assembly.Compiler.MemoryAddress

import scala.scalajs.js
import js.JSConverters._

import scala.concurrent.Promise
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class DevicesController(memory: Memory) {
	
	// Memorio de los dispositivos
  val ioMemory = new IOMemory()
  
  // Dispositivos internos
  val pic = new PIC(ioMemory)
  val timer = new Timer(ioMemory, pic)
  val pio = new PIO(ioMemory)
  val hand = new Handshake(ioMemory, pic)
  val cdma = new CDMA(ioMemory, pic)
  
  // Dispositivos externos
  val printer = new Printer()
  val f10 = new F10Button(pic)
  val keys = new Keys(ioMemory)
  val leds = new Leds(ioMemory)
  val monitor = new Monitor()
  
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
  
  var enabledInterruptions = false
  
  def picInterruption(intX: Int) {
  	if(enabledInterruptions == false) {
	  	val adress = pic.picInterruption(intX)
  		if(adress != 0) {
		  	val interruptionAdress = memory.getBytes(adress)
//		  	println("Se leyó la interrupción INT" + intX + ", y se va a saltar a la dirección " + ("%04X".format(interruptionAdress.toUnsignedInt)) + "h.")
  		}
  		else
	  		println("Se rechazó la interrupción INT" + intX + ".")
		}
		else
  		println("Se rechazó la interrupción INT" + intX + ".")
  }
  

  
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }
  
  def reset() {
    ioMemory.reset()
  }
  
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
  	ioMemory.writeIO(v, regValue)
//  	if(v == 64) {
//  		ioMemory.writeIO(65, Word(ioMemory.readIO(65) | 2)) 
//  	}
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
  	return ioMemory.readIO(v)
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
	
	var strobePulse = false
	var busy = false
	
	var data = Word(0)
	var charToPrint = '\0'
	
	var readyLater = for {
	  delayed <- delay(20)
	} yield {
	  checkPrint()
	}

  def delay(milliseconds: Int): Future[Unit] = {
  	val p = Promise[Unit]()
  	js.timers.setTimeout(milliseconds) {
	    p.success(())
	  }	
	  p.future
	}

	def checkPrint() {
			if(strobePulse && !busy) {
				busy = true
				charToPrint = data.toInt.toChar
				strobePulse = false
			}
	}
	
	def isIdle() = {
		!busy
	}
	
	def isBusy() = {
		busy
	}
	
	def sendData(d: Word) = {
		data = d
	}
	
	def sendStrobe() = {
//		if(strobePreviousValue == 0)
			strobePulse = true
//		strobePreviousValue = 1
	}
	
	def getCharToPrint() = {
		busy = false
		if(charToPrint != '\0')
			charToPrint
		else ""
	}
  
  def simulatorEvent(actualTime: Long) {
  	
  }
  
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }
  
  def reset() {
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

class Keys(ioMemory: IOMemory) {
  
  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  }

}

class Leds(ioMemory: IOMemory) {
  
  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
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

class Timer(ioMemory: IOMemory, pic: PIC) {
  def delay(milliseconds: Int): Future[Unit] = {
  	val p = Promise[Unit]()
  	js.timers.setTimeout(milliseconds) {
	    p.success(())
	  }	
	  p.future
	}
	
	val timeDelay = 5000
	check()
	
	def check() {
		/*var readyLater = for {
		  delayed <- delay(timeDelay)
		} yield {
			if(s.isSimulatorExecuting() && !s.isDebugging())
			  checkTime()
			else {
		  	check()
			}
		}*/
	}
	
	def checkTime() {
		var cont = ioMemory.readIO(16).toInt
		val comp = ioMemory.readIO(17).toInt
		
		cont += 1
		if(cont == 256)
			cont = 0
		if(cont == comp)
//			s.s.picInterruption(1)
		ioMemory.writeIO(16, Word(cont))
		
		var readyLater = for {
		  delayed <- delay(timeDelay)
		} yield {
			  checkTime()
		}
	}
  
  def simulatorEvent(actualTime: Long) {
  	
  }
  
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }
  
  def reset() {
  }
}

class PIO(ioMemory: IOMemory) {
  
  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  	ioMemory.writeIO(50, Word(255))
  	ioMemory.writeIO(51, Word(255))
  }

}

class PIC(ioMemory: IOMemory) {
	
	var interruptionAdress = 0
  
  def picInterruption(intX: Int): Int = {
		val IMR = ioMemory.readIO(33) // 1 -> Ignorado; 0 -> Atendido
		if(IMR.bit(intX) == 0) {
			ioMemory.writeIO(34, Word(ioMemory.readIO(34) | (1 << intX))) // 1 -> Se llamó; 0 -> No se llamó
			val ISR = ioMemory.readIO(35) // 1 -> Atendida; 0 -> No se atendió
			
			if(ISR == Word(0)) {
				ioMemory.writeIO(34, Word(ioMemory.readIO(34) & ~(1 << intX)))
				ioMemory.writeIO(35, Word(ISR | (1 << intX)))
				interruptionAdress = (ioMemory.readIO((36+intX).toByte)).toInt * 4
			}
		}
		return interruptionAdress
  }
	
	def isPendingInterruption() = {
		ioMemory.readIO(35) != Word(0)
	}
	
	def interruptionFinished() {
		ioMemory.writeIO(35, Word(0))
	}
  
  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  	
  }

}

class Handshake(ioMemory: IOMemory, pic: PIC) {
  
  def simulatorEvent() {
  	val state = ioMemory.readIO(65)
  	if((state & 131) == 130) { // Estado AND 10000011 = X00000XX / 130 = 10000010
//  	if((state.bit(7) == 1) && (state.bit(0) == 0) && (state.bit(1) == 1)) {
  		pic.picInterruption(2)
  		ioMemory.writeIO(65, Word(state & 253)) // Estado AND 11111101 = XXXXXX0X
  	}
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  }

}

class CDMA(ioMemory: IOMemory, pic: PIC) {
  
  def simulatorEvent() {
  	
  }
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  }

}


class IOMemory {
  val seed = new Random().nextLong()
  var values: Array[Word] = randomBytes(28).map(Word(_))
  /**	PIO:
	  *		PA: 0
	  *		PB: 1
	  * 	CA: 2
	  * 	CB: 3
	  * 
	  * PIC:
	  * 	EOI: 4
	  * 	IMR: 5
	  * 	IRR: 6
	  * 	ISR: 7
	  * 	INT0: 8
	  * 	INT1: 9
	  * 	INT2: 10
	  * 	INT3: 11
	  * 	INT4: 12
	  * 	INT5: 13
	  * 	INT6: 14
	  * 	INT7: 15
	  * 
	  * HANDSHAKE:
	  * 	DATO: 16
	  * 	ESTADO: 17
	  * 
	  * TIMER:
	  * 	CONT: 18
	  * 	COMP: 19
	  * 
	  * CDMA:
	  * 	RFL: 20
	  * 	RFH: 21
	  * 	CONTL: 22
	  * 	CONTH: 23
	  * 	RDL: 24
	  * 	RDH: 25
	  * 	CTRL: 26
	  * 	ARRANQUE: 27
	  * 
   	* */
  
  def randomBytes(size: Int) = {
    val values = Array.ofDim[Byte](size)
    new Random(seed).nextBytes(values)
    values
  }
	
  def validAddress(address: Int) = address >= 0 && address < values.length
  def checkAddress(address: Int) {
    if (!validAddress(address)) {
      throw new InvalidMemoryAddress(address)
    }
  }
  
  def update(valuesMap: Map[MemoryAddress, Int]) {
    valuesMap.foreach { case (a, v) => values(a) = Word(v) }
  }
  def reset() {
    val bytes = randomBytes(values.size)
    bytes.indices.foreach(i => values(i) = Word(bytes(i)))
  }
  
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
  	v match {
  		// PIO
  	  case 48 => values(0) = regValue // PA
  	  case 49 => values(1) = regValue // PB
      case 50 => values(2) = regValue // CA
      case 51 => values(3) = regValue // CB

      // PIC
      case 32 => values(4) = regValue // EOI
      case 33 => values(5) = regValue // IMR
      case 34 => values(6) = regValue // IRR
      case 35 => values(7) = regValue // ISR
      case 36 => values(8) = regValue // INT0
      case 37 => values(9) = regValue // INT1
      case 38 => values(10) = regValue // INT2
      case 39 => values(11) = regValue // INT3
      case 40 => values(12) = regValue // INT4
      case 41 => values(13) = regValue // INT5
      case 42 => values(14) = regValue // INT6
      case 43 => values(15) = regValue // INT7

      // HANDSHAKE
      case 64 => { // DATO
      	values(16) = regValue
      	values(17) = Word(values(17) | 2) // Strobe en 1
      }
      case 65 => values(17) = regValue // ESTADO

      // TIMER
      case 16 => values(18) = regValue // CONT
      case 17 => values(19) = regValue // COMP

      // CDMA
      case 80 => values(20) = regValue // RFL
      case 81 => values(21) = regValue // RFH
      case 82 => values(22) = regValue // CONTL
      case 83 => values(23) = regValue // CONTH
      case 84 => values(24) = regValue // RDL
      case 85 => values(25) = regValue // RDH
      case 86 => values(26) = regValue // CTRL
      case 87 => values(27) = regValue // ARRANQUE
  	}
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
  	v.toInt match {
  		// PIO
  	  case 48 => values(0) // PA | 30h
  	  case 49 => values(1) // PB | 31h
      case 50 => values(2) // CA | 32h
      case 51 => values(3) // CB | 33h

      // PIC
      case 32 => values(4) // EOI | 20h
      case 33 => values(5) // IMR | 21h
      case 34 => values(6) // IRR | 22h
      case 35 => values(7) // ISR | 23h
      case 36 => values(8) // INT0 | 24h
      case 37 => values(9) // INT1 | 25h
      case 38 => values(10) // INT2 | 26h
      case 39 => values(11) // INT3 | 27h
      case 40 => values(12) // INT4 | 28h
      case 41 => values(13) // INT5 | 29h
      case 42 => values(14) // INT6 | 2Ah
      case 43 => values(15) // INT7 | 2Bh

      // HANDSHAKE
      case 64 => values(16) // DATO | 40h
      case 65 => values(17) // ESTADO | 41h

      // TIMER
      case 16 => values(18) // CONT | 10h
      case 17 => values(19) // COMP | 11h

      // CDMA
      case 80 => values(20) // RFL | 50h
      case 81 => values(21) // RFH | 51h
      case 82 => values(22) // CONTL | 52h
      case 83 => values(23) // CONTH | 53h
      case 84 => values(24) // RDL | 54h
      case 85 => values(25) // RDH | 55h
      case 86 => values(26) // CTRL | 56h
      case 87 => values(27) // ARRANQUE | 57h
  	}
  }
  
//  /*---- PIO ----*/
//  def writePortA()
//  def writePortB()
//  
//  def readPortA()
//  def readPortB()
//  
//  def configurePortA()
//  def configurePortB()
//  
//  /*---- Leds ----*/
//  
//  /*---- Llaves ----*/
//  
//  /*---- Impresora ----*/
//  
//  /*---- Handshake ----*/
//  def writeData()
//  def writeState()
//
//	def readData()
//  def readState()
//
//  /*---- CDMA ----*/
//  
//  
//  /*---- Timer ----*/
//  def writeComp()
//  
//  def readComp()
//  def readCont()
//  
//  /*---- PIC ----*/
//  
//  
//  /*---- F10 ----*/
}
