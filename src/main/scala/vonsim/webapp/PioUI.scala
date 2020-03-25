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

class PIORegistersUI(
	s: VonSimState,
  pioTitle: String,
  baseId: String = "",
  portLetter: String
) extends VonSimUI(s) {

  def getIdFor(part: String) = if (baseId == "") "" else baseId + part

  val dataRow = tr(th("P"+portLetter)).render
  val controlRow = tr(th("C"+portLetter)).render
  
  def dataByte = s.s.devController.readIO(if(portLetter=="B") 48 else 50)
  def controlByte = s.s.devController.readIO(if(portLetter=="B") 49 else 51)

  val dataByteString = dataByte.toString()
  val controlByteString = controlByte.toString()
  
  val dataBitRows = Array(
		td(dataByteString.charAt(0)).render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render
  )
  
  val controlBitRows = Array(
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render
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
      registerTable,
      data("toggle"):="tooltip",
      data("placement"):="bottom",
      title:= getDescription()
    ).render

  def getDescription() = "P"+portLetter+": " + formatWord(dataByte) + "h\nC"+portLetter+": " + formatWord(controlByte) + "h"
	
  def simulatorEvent() {
  	var dataByteString = dataByte.bitString.reverse
  	var controlByteString = controlByte.bitString.reverse
  	
  	for(i <- 0 to 7) {
  		dataBitRows(i).textContent = dataByteString.charAt(i).toString()
  		controlBitRows(i).textContent = controlByteString.charAt(i).toString() 
  	}
  	root.title = getDescription()
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
