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

class DevicesController(memory: Memory) {
	
  var strategie: Strategie = new StrategieZero()
  var config = 0
  
  def setConfig(newConfig: Int) {
    config = newConfig
    newConfig match {
      case 0 => strategie = new StrategieZero()
      case 1 => strategie = new StrategieOne()
      case 2 => strategie = new StrategieTwo()
      case 3 => strategie = new StrategieThree()
    } 
  }
  
  def getConfig() = config
  
  def simulatorEvent(actualTime: Long) = strategie.simulatorEvent(actualTime)
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }

  def isPendingInterruption() = strategie.isPendingInterruption()
	def getInterruptionAdress() = strategie.getInterruptionAdress()
  
  def reset() = strategie.reset()
  
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) = strategie.writeIO(v, regValue)
  def readIO(v: Simulator.IOMemoryAddress): Word = strategie.readIO(v)
  
  def startTimers() = strategie.startTimers()
  def stopTimers() = strategie.stopTimers()
  def updateTimers(actualTime: Long) = strategie.updateTimers(actualTime)
  
  def getPrinterTickTime() = strategie.getPrinterTickTime()
  def printerSpeedUp() = strategie.printerSpeedUp()
}

abstract class Strategie() {
  val seed = new Random().nextLong()
  
  val pic = new PIC(seed)
  val timer = new Timer(seed, pic)
  val f10 = new F10Button(pic)
  val monitor = new Monitor()
  
  var lastTime: Long = 0
  var acumulatedTime: Long = 0
  
  def simulatorEvent(actualTime: Long) {
    updateTimers(actualTime)
		f10.simulatorEvent()
		monitor.simulatorEvent()

		timer.simulatorEvent(actualTime)
		pic.simulatorEvent()
  }
  
  def reset() {
    f10.reset()
    monitor.reset()
    timer.reset()
    pic.reset()
    stopTimers()
  }
  
  def isPendingInterruption() = pic.isPendingInterruption()
	def getInterruptionAdress() = pic.getInterruptionAdress()
  
  def startTimers() = timer.eventTimer.startTimer()
  def stopTimers() = timer.eventTimer.stopTimer()
  def updateTimers(actualTime: Long) = timer.eventTimer.update(actualTime)
  
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    val adress = v.toInt
    if((adress >= 16) && (adress <= 17))
      timer.writeIO(v, regValue)
    if((adress >= 32) && (adress <= 43))
      pic.writeIO(v, regValue)
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
    val adress = v.toInt
    if((adress >= 16) && (adress <= 17))
      return timer.readIO(v)
    if((adress >= 32) && (adress <= 43))
      return pic.readIO(v)
    return null
  }
  
  def getPrintedText() = ""
  
  def getMonitorText() = monitor.getText()
  
  def getLedsValue() = Word(0)
  
  def getKeysValue() = Word(0)
  
  def toggleKeyBit(i: Int) {}
  
  def f10Pressed() = f10.pressed()
  
  def addMonitorText(text: String) = monitor.addText(text)
  
  def getPrinterTickTime() = 1
  def printerSpeedUp() {}
}

class StrategieZero() extends Strategie() {
  val pio = new PIO(0, seed, null)
  val keys = new Keys(pio)
  val leds = new Leds(pio)
  
  override def simulatorEvent(actualTime: Long) {
    super.simulatorEvent(actualTime)
		keys.simulatorEvent()
		leds.simulatorEvent()
		pio.simulatorEvent()
  }
  
  override def reset() {
    super.reset()
    keys.reset()
    leds.reset()
    pio.reset()
  }
  
  override def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    super.writeIO(v, regValue)
    val adress = v.toInt
    if((adress >= 48) && (adress <= 51))
      pio.writeIO(v, regValue)
  }
  
  override def readIO(v: Simulator.IOMemoryAddress): Word = {
    var superIO = super.readIO(v)
    if(superIO != null)
      return superIO
    val adress = v.toInt
    if((adress >= 48) && (adress <= 51))
      return pio.readIO(v)
    return Word(new Random(seed).nextInt())
  }

  override def getLedsValue() = leds.value
  
  override def getKeysValue() = keys.value
  
  override def toggleKeyBit(i: Int) = keys.toggleBit(i)
}

class StrategieOne() extends Strategie() {
  val printer = new Printer()
  val printerConnection = new PrinterConnection(printer)
  val pio = new PIO(1, seed, printerConnection)
  
  override def startTimers() {
    super.startTimers()
    printer.eventTimer.startTimer()
  }
  
  override def stopTimers() {
    super.stopTimers()
    printer.eventTimer.stopTimer()
  }
  
  override def updateTimers(actualTime: Long) {
    super.updateTimers(actualTime)
    printer.eventTimer.update(actualTime)
  }

  override def simulatorEvent(actualTime: Long) {
    super.simulatorEvent(actualTime)
  	printer.simulatorEvent(actualTime)
		pio.simulatorEvent()
  }

  override def reset() {
    super.reset()
    printer.reset()
    pio.reset()
  }
  
  override def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    super.writeIO(v, regValue)
    val adress = v.toInt
    if((adress >= 48) && (adress <= 51))
      pio.writeIO(v, regValue)
  }
  
  override def readIO(v: Simulator.IOMemoryAddress): Word = {
    var superIO = super.readIO(v)
    if(superIO != null)
      return superIO
    val adress = v.toInt
    if((adress >= 48) && (adress <= 51))
      return pio.readIO(v)
    return Word(new Random(seed).nextInt())
  }
  
  override def getPrintedText() = printer.getPrintedText()
  
  override def getPrinterTickTime() = printer.eventTimer.getTickTime()
  override def printerSpeedUp() = printer.eventTimer.speedUp()
}

class StrategieTwo() extends Strategie() {
  val printer = new Printer()
  val printerConnection = new PrinterConnection(printer)
  val hand = new Handshake(seed, pic, printerConnection)
  
  override def startTimers() {
    super.startTimers()
    printer.eventTimer.startTimer()
  }
  
  override def stopTimers() {
    super.stopTimers()
    printer.eventTimer.stopTimer()
  }
  
  override def updateTimers(actualTime: Long) {
    super.updateTimers(actualTime)
    printer.eventTimer.update(actualTime)
  }
  
  override def simulatorEvent(actualTime: Long) {
    super.simulatorEvent(actualTime)
  	printer.simulatorEvent(actualTime)
		hand.simulatorEvent()
  }

  override def reset() {
    super.reset()
    printer.reset()
    hand.reset()
  }
  
  override def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    super.writeIO(v, regValue)
    val adress = v.toInt
    if((adress >= 64) && (adress <= 65))
      hand.writeIO(v, regValue)
  }
  
  override def readIO(v: Simulator.IOMemoryAddress): Word = {
    var superIO = super.readIO(v)
    if(superIO != null)
      return superIO
    val adress = v.toInt
    if((adress >= 64) && (adress <= 65))
      return hand.readIO(v)
    return Word(new Random(seed).nextInt())
  }
  
  override def getPrintedText() = printer.getPrintedText()
  
  override def getPrinterTickTime() = printer.eventTimer.getTickTime()
  override def printerSpeedUp() = printer.eventTimer.speedUp()
}

class StrategieThree() extends Strategie() {
  val printer = new Printer()
  val printerConnection = new PrinterConnection(printer)
  val hand = new Handshake(seed, pic, printerConnection)
  val cdma = new CDMA(seed, pic)
  
  
  override def startTimers() {
    super.startTimers()
    printer.eventTimer.startTimer()
  }
  
  override def stopTimers() {
    super.stopTimers()
    printer.eventTimer.stopTimer()
  }
  
  override def updateTimers(actualTime: Long) {
    super.updateTimers(actualTime)
    printer.eventTimer.update(actualTime)
  }
  
  override def simulatorEvent(actualTime: Long) {
    super.simulatorEvent(actualTime)
  	printer.simulatorEvent(actualTime)
		hand.simulatorEvent()
		cdma.simulatorEvent()
  }
  
  override def reset() {
    super.reset()
    printer.reset()
    hand.reset()
    cdma.reset()
  }
  
  override def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    super.writeIO(v, regValue)
    val adress = v.toInt
    if((adress >= 64) && (adress <= 65))
      hand.writeIO(v, regValue)
    if((adress >= 80) && (adress <= 87))
      cdma.writeIO(v, regValue)
  }
  
  override def readIO(v: Simulator.IOMemoryAddress): Word = {
    var superIO = super.readIO(v)
    if(superIO != null)
      return superIO
    val adress = v.toInt
    if((adress >= 64) && (adress <= 65))
      return hand.readIO(v)
    if((adress >= 80) && (adress <= 87))
      return cdma.readIO(v)
    return Word(new Random(seed).nextInt())
  }
  
  override def getPrintedText() = printer.getPrintedText()
  
  override def getPrinterTickTime() = printer.eventTimer.getTickTime()
  override def printerSpeedUp() = printer.eventTimer.speedUp()
}
