package vonsim.webapp

import org.scalajs.dom.html._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom

import scala.collection.mutable
import scala.util.Random
import scala.scalajs.js
import scalatags.JsDom.all._

import js.JSConverters._

import vonsim.utils.CollectionUtils._

import vonsim.simulator
import vonsim.simulator.InstructionInfo
import vonsim.simulator.Simulator
import vonsim.simulator.Flag
import vonsim.simulator.Flags
import vonsim.simulator.DWord
import vonsim.simulator.Word
import vonsim.simulator.FullRegister
import vonsim.simulator.SimulatorProgramExecuting
import vonsim.simulator.SimulatorExecutionStopped
import vonsim.simulator.SimulatorExecutionError
import vonsim.simulator.SimulatorExecutionFinished
import vonsim.assembly.Compiler.CompilationResult
import scala.collection.mutable.Queue
import vonsim.simulator.PrinterPIO
import vonsim.simulator.PrinterHandshake
import vonsim.simulator.LedsAndSwitches
import vonsim.simulator.DeviceConfiguration

class PIORegistersUI(
	s: VonSimState,
  pioTitle: String,
  baseId: String = "",
  portLetter: String
) extends VonSimUI(s) {

  def getIdFor(part: String) = if (baseId == "") "" else baseId + part

  val dataRow = tr(
    th("P"+portLetter),
    cls:="tooltipHover",
    data("toggle"):="tooltip",
    data("placement"):="bottom",
    title:= ""
  ).render
  val controlRow = tr(
    th("C"+portLetter),
    cls:="tooltipHover",
    data("toggle"):="tooltip",
    data("placement"):="bottom",
    title:= ""
  ).render
  
  def dataByte = s.s.devController.readIO(if(portLetter=="A") 48 else 49)
  def controlByte = s.s.devController.readIO(if(portLetter=="A") 50 else 51)

  val dataByteString = dataByte.toString()
  val controlByteString = controlByte.toString()
  
  val dataBitRows = Array(
		td(dataByteString.charAt(0)).render,
		td(dataByteString.charAt(1)).render,
		td(dataByteString.charAt(2)).render,
		td(dataByteString.charAt(3)).render,
		td(dataByteString.charAt(4)).render,
		td(dataByteString.charAt(5)).render,
		td(dataByteString.charAt(6)).render,
		td(dataByteString.charAt(7)).render
  )
  
  val controlBitRows = Array(
		td(controlByteString.charAt(0)).render,
		td(controlByteString.charAt(1)).render,
		td(controlByteString.charAt(2)).render,
		td(controlByteString.charAt(3)).render,
		td(controlByteString.charAt(4)).render,
		td(controlByteString.charAt(5)).render,
		td(controlByteString.charAt(6)).render,
		td(controlByteString.charAt(7)).render
  )

  dataBitRows.foreach(b => dataRow.appendChild(b.render))
  controlBitRows.foreach(b => controlRow.appendChild(b.render))
  
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody",
    dataRow,
    controlRow
  ).render

  val registerTable = table(
    cls := "registerTable",
    body
  ).render
  
  val root =
    div(
      id := getIdFor("RegistersTable"),
      cls := "cpuElement",
      style := "max-width: 100% !important",
      div(
        cls := "cpuElementHeader",
        i(cls := "icon-file-binary", " "),
        h3(pioTitle)
      ),
      registerTable
    ).render

  def getBits(control: Word, data: Word, bitValue: Integer) = {
    var i = -1
    var controlBitsNumber = ""
    var dataBits = ""
    val bitsNumber = Queue.empty[Integer]
    control.bitString.foreach(bit => {
      i = i + 1
      if(bit.toString() == bitValue.toString()) {
        if(controlBitsNumber == "") {
          controlBitsNumber += i
          dataBits += data.bit(i)
        }
        else {
          controlBitsNumber += ", " + i
          dataBits += ", " + data.bit(i)
        }
      }
    })
    (controlBitsNumber, dataBits)
  }
  
  setDescriptions()
  def setDescriptions() {
    val (controlIn, dataIn) = getBits(controlByte, dataByte, 1)
    val (controlOut, dataOut) = getBits(controlByte, dataByte, 0)
    if(controlIn == "") {
      controlRow.title = "C" + portLetter + ": Todos los bits están configurados como salida."
      dataRow.title = "P" + portLetter + ": Enviando los valores (" + dataOut + ") por los bits (" + controlOut + ")."
    }
    else if(controlOut == "") {
      controlRow.title = "C" + portLetter + ": Todos los bits están configurados como entrada."
      dataRow.title = "P" + portLetter + ": Recibiendo los valores (" + dataIn+ ") por los bits (" + controlIn + ")."
    }
    else {
      controlRow.title = "C" + portLetter + ": Bits " + controlIn + " de entrada / Bits " + controlOut + " de salida."
      dataRow.title = "P" + portLetter + ": Enviando los valores (" + dataOut + ") por los bits (" + controlOut + ") y\n" +
                      "recibiendo los valores (" + dataIn+ ") por los bits (" + controlIn + ")."
    }
  }

  def simulatorEvent() {
  	var dataByteString = dataByte.bitString.reverse
  	var controlByteString = controlByte.bitString.reverse
  	for(i <- 0 to 7) {
  		dataBitRows(i).textContent = dataByteString.charAt(i).toString()
  		controlBitRows(i).textContent = controlByteString.charAt(i).toString() 
  	}
  	setDescriptions()
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}

}

class PioUI (s: VonSimState)
    extends MainboardItemUI(
      s,
			"exchange-alt",
      "pio",
      s.uil.pioTitle
    ) {
	
  val portA = new PIORegistersUI(s, s.uil.pioAPort, "pio", "A")
  val portB = new PIORegistersUI(s, s.uil.pioBPort, "pio", "B")

  contentDiv.appendChild(portA.root)
  contentDiv.appendChild(portB.root)
  
  
  def setConfig(newConfig: DeviceConfiguration) {
    val title =  s.s.devController.config match {
      case a:LedsAndSwitches => "los interruptores en el puerto A y los leds en el puerto B."
      case b:PrinterPIO => "la impresora, con control en el puerto A y datos en el puerto B."
      case _ => ""
    }
    
    header.title = "PIO conectado a " + title
  }

  def simulatorEvent() {
    portA.simulatorEvent()
    portB.simulatorEvent()
    
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def show() {
  	root.classList.remove("hidden")
  }
  def hide() {
  	root.classList.add("hidden")
  }
}
