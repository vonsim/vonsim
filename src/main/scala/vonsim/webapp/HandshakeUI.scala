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

class HandRegistersUI(s: VonSimState, baseId: String = "") extends VonSimUI(s) {

	def DATA = s.s.devController.readIO(64)
	def STATE = s.s.devController.readIO(65)
	
  def getIdFor(part: String) = if (baseId == "") "" else baseId + part

  val dataRow = tr(th(s.uil.handDataTitle)).render
  val stateRow = tr(th(s.uil.handStateTitle)).render
  
  val dataBitRows = Array(
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render
  )
  
  val stateBitRows = Array(
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
  stateBitRows.foreach(b => stateRow.appendChild(b.render))
  
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody",
    dataRow,
    stateRow
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
        h3(s.uil.handPortTitle)
      ),
      registerTable,
      data("toggle"):="tooltip",
      data("placement"):="bottom",
      title:= getDescription()
    ).render

  def getDescription() = "Dato: " + formatWord(DATA) + "h" +
                       "\n\tLos datos son los caracteres a imprimir" +
                       "\nEstado: " + formatWord(STATE) + "h" +
                       "\n\t- Bit 0: Línea BUSY " + (if (STATE.bit(0)==1) "activada." else "desactivada.") +
                       "\n\t- Bit 1: Línea STROBE " + (if (STATE.bit(1)==1) "activada." else "desactivada.") +
                       "\n\t- Bit 7: Línea INT " + (if (STATE.bit(7)==1) "activada." else "desactivada.")

  def simulatorEvent() {
  	var dataByteString = ""
  	var stateByteString = ""
  	root.title = getDescription
		dataByteString = DATA.bitString.reverse
		stateByteString = STATE.bitString.reverse
  	
  	for(i <- 0 to 7) {
  		dataBitRows(i).textContent = dataByteString.charAt(i).toString()
  		stateBitRows(i).textContent = stateByteString.charAt(i).toString() 
  	}
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}

}

class HandshakeUI (s: VonSimState)
    extends MainboardItemUI(
      s,
			"exchange-alt",
      "hand",
      s.uil.handTitle
    ) {
	
  val port = new HandRegistersUI(
    s,
    "hand"
  )

  contentDiv.appendChild(port.root)

  def simulatorEvent() {
    port.simulatorEvent()
  }
  def simulatorEvent(i: InstructionInfo) {
    port.simulatorEvent(i)
  }

  def show() {
  	root.classList.remove("hidden")
  }
  def hide() {
  	root.classList.add("hidden")
  }

}
