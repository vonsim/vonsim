package vonsim.simulator

import scala.collection.mutable.Queue
import scala.util.Random



class DevicesController {
	
  
  
  val configs = List(
      new LedsAndSwitches(),
      new PrinterPIO(),
      new PrinterHandshake())
      
  var config: DeviceConfiguration = configs(0)
  
  def setConfig(c:DeviceConfiguration){
    config = c  
  }
  
  def setConfig(index:Int){
      config=configs(index)
  }
  
  def configIndex = configs.indexOf(config)
  
  
  def simulatorEvent(actualTime: Long) = config.simulatorEvent(actualTime)
  def simulatorEvent(i: InstructionInfo, actualTime: Long) {
    simulatorEvent(actualTime)
  }

  def isPendingInterruption() = config.isPendingInterruption()

  
  def reset() = config.reset()
  
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) = config.writeIO(v, regValue)
  def readIO(v: Simulator.IOMemoryAddress): Word = config.readIO(v)
  
  def getPrinterTickTime() = config.getPrinterTickTime()
  def setPrinterTickTime(tickTime:Int) = config.printerSetTickTime(tickTime)
  
  def getStrobePulse() = config.getStrobePulse()
  def isPrinting() = config.isPrinting()
  def getPrintedText() = config.getPrintedText()
  def getPrinterBuffer() = config.getPrinterBuffer()
}

abstract class DeviceConfiguration() {
  val seed = new Random().nextLong()
  
  val pic = new PIC(seed)
  val timer = new Timer(seed, pic)
  val f10 = new F10Button(pic)
  val monitor = new Monitor()
  
  var lastTime: Long = 0
  var acumulatedTime: Long = 0
  
  def simulatorEvent(actualTime: Long) {
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
  }
  
  def isPendingInterruption() = pic.isPendingInterruption
  
	def safeWriteIO(d:InternalDevice,v: Simulator.IOMemoryAddress, regValue: Word){
    val address = v.toInt
    if (d.validAddress(address)){
      d.writeIO(v, regValue)
    }
  }
  def safeReadIO(d:InternalDevice,v: Simulator.IOMemoryAddress)={
    val address = v.toInt
    if (d.validAddress(address)){
      Some(d.readIO(v))
    }else{
      None
    }
  }
  
  def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    safeWriteIO(timer,v,regValue)
    safeWriteIO(pic,v,regValue)
  }
  
  def readIO(v: Simulator.IOMemoryAddress): Word = {
    val picOrRandom = safeReadIO(pic, v).getOrElse(Word(new Random(seed).nextInt()))
    safeReadIO(timer, v).getOrElse(picOrRandom)
    
  }
  
  def getMonitorText() = monitor.getText()
  
  def getLedsValue() = Word(0)
  
  def getKeysValue() = Word(0)
  
  def toggleKeyBit(i: Int) {}
  
  def f10Pressed() = f10.pressed()
  
  def addMonitorText(text: String) = monitor.addText(text)
  
  def getPrinterTickTime() = 8000
  def printerSetTickTime(tickTime:Int) {}
  
  def getStrobePulse() = false
  def isPrinting() = false
  def getPrintedText() = ""
  def getPrinterBuffer() = Queue.empty[Word]
}

class LedsAndSwitches() extends DeviceConfiguration() {
  val pio = new PIO(0, seed, null)
  val keys = new Keys(seed, pio)
  val leds = new Leds(pio)
  
  override def simulatorEvent(actualTime: Long) {
    super.simulatorEvent(actualTime)
		keys.simulatorEvent()
		leds.simulatorEvent()
		pio.simulatorEvent()
  }
  
  override def reset() {
    super.reset()
    pio.reset()
    keys.reset()
    leds.reset()
  }
  
  override def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    safeWriteIO(pio, v, regValue)
    super.writeIO(v, regValue)
  }
  
  override def readIO(v: Simulator.IOMemoryAddress): Word = {
    safeReadIO(pio,v).getOrElse(super.readIO(v))
  }

  override def getLedsValue() = leds.value
  
  override def getKeysValue() = keys.value
  
  override def toggleKeyBit(i: Int) = keys.toggleBit(i)
}

class PrinterDeviceConfiguration extends DeviceConfiguration(){
  val printer = new Printer()
  
    override def getPrinterTickTime() = printer.eventTimer.getTickTime()
  override def printerSetTickTime(tickTime:Int) = printer.eventTimer.setTickTime(tickTime)

  override def getStrobePulse() = printer.strobePulse
  override def isPrinting() = printer.isPrinting()
  override def getPrintedText() = printer.getPrintedText()
  override def getPrinterBuffer() = printer.buffer
  
  override def reset(){
    super.reset()
    printer.reset()
  }
  
  override def simulatorEvent(actualTime: Long) {
    super.simulatorEvent(actualTime)
  	printer.simulatorEvent(actualTime)
		
  }
  
}
class PrinterPIO() extends PrinterDeviceConfiguration() {
   
  val printerConnection = new PrinterConnection(printer)
  val pio = new PIO(1, seed, printerConnection)
  
  override def simulatorEvent(actualTime: Long) {
    super.simulatorEvent(actualTime)
		pio.simulatorEvent()
  }

  override def reset() {
    super.reset()
    pio.reset()
  }
  
  
  override def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    super.writeIO(v, regValue)
    safeWriteIO(pio,v, regValue)
    
  }
  
  override def readIO(v: Simulator.IOMemoryAddress): Word = {
    safeReadIO(pio,v).getOrElse(super.readIO(v))
  }
  

}

class PrinterHandshake() extends PrinterDeviceConfiguration() {
  val printerConnection = new PrinterConnection(printer)
  val hand = new Handshake(seed, pic, printerConnection)
  
  override def simulatorEvent(actualTime: Long) {
    super.simulatorEvent(actualTime)
		hand.simulatorEvent()
  }

  override def reset() {
    super.reset()
    hand.reset()
  }
  
  override def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    safeWriteIO(hand, v, regValue)
    super.writeIO(v, regValue)
  }
  
  override def readIO(v: Simulator.IOMemoryAddress): Word = {
    safeReadIO(hand,v).getOrElse(super.readIO(v))
  }
  
}

class PrinterCDMA() extends PrinterDeviceConfiguration() {
    val printerConnection = new PrinterConnection(printer)
  val hand = new Handshake(seed, pic, printerConnection)
  val cdma = new CDMA(seed, pic)
  
  override def simulatorEvent(actualTime: Long) {
    super.simulatorEvent(actualTime)
  	printer.simulatorEvent(actualTime)
		hand.simulatorEvent()
		cdma.simulatorEvent()
  }
  
  override def reset() {
    super.reset()
    hand.reset()
    cdma.reset()
  }
  
  
  override def writeIO(v: Simulator.IOMemoryAddress, regValue: Word) {
    super.writeIO(v, regValue)
    safeWriteIO(hand,v, regValue)
    safeWriteIO(cdma,v, regValue)
    
  }
  
  override def readIO(v: Simulator.IOMemoryAddress): Word = {
    val cmdaOrSuper= safeReadIO(cdma,v).getOrElse(super.readIO(v))
    safeReadIO(hand,v).getOrElse(cmdaOrSuper)
  }

}
