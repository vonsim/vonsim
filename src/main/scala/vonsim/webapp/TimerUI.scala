package vonsim.webapp

import org.scalajs.dom.html._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom

import scala.collection.mutable
import scala.util.Random
import scala.scalajs.js
import scalatags.JsDom.all._

import scala.concurrent.Promise
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

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
import vonsim.simulator.Simulator.IOMemoryAddress

class TimerRegistersUI(
	s: VonSimState,
  timerTitle: String,
  baseId: String = ""
) extends VonSimUI(s) {
	def getIdFor(part: String) = if (baseId == "") "" else baseId + part

	val rows = Array(
		tr(th("CONT")).render,
		tr(th("COMP")).render
	)
	def CONT = s.s.devController.readIO(16)
	def COMP = s.s.devController.readIO(17)

	val bitRows = new Array[Array[TableCell]](8)
	for(i <- 0 to 1) {
		bitRows(i) = Array.fill(8)(td("0").render)
		bitRows(i).foreach(b => rows(i).appendChild(b))
	}
  
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody"
  ).render
	for(i <- 0 to 1) {
		body.appendChild(rows(i))
	}

  val registerTable = table(
    cls := "registerTable",
    body
  ).render

  val tooltipTitle = "Sdsf"
  val root =
    div(
      id := getIdFor("RegistersTable"),
      cls := "cpuElement",
      style := "max-width: 100% !important",
      div(
        cls := "cpuElementHeader",
        i(cls := "icon-file-binary", " "),
        h3(timerTitle)
      ),
      registerTable,
      data("toggle") := "tooltip",
      data("placement") := "bottom",
      title := getDescription()
    ).render

  def getDescription() = "CONT: " + formatWord(CONT) + "h\nCOMP: " + formatWord(COMP) +
  "h\nDisparará una interrupción cada " + COMP.toUnsignedInt + " segundos si es que se resetea cada vez."
  
  def simulatorEvent() {
  	var intByteStrings = new Array[String](2)
  	root.title = getDescription()
		intByteStrings(0) = CONT.bitString.reverse
		intByteStrings(1) = COMP.bitString.reverse
  	
  	for(i <- 1 to 0 by -1) {
  		for(j <- 0 to 7) {
  			bitRows(i)(j).textContent = intByteStrings(i).charAt(j).toString()
  		}
  	}
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}
}

class InternalTimerUI (s: VonSimState)
    extends MainboardItemUI(
      s,
			"stopwatch",
      "timer",
      s.uil.timerTitle
    ) {
	
  val registers = new TimerRegistersUI(
    s,
    s.uil.timerRegisters,
    "time"
  )
  
  contentDiv.appendChild(registers.root)

  def simulatorEvent() {
    registers.simulatorEvent()
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }

}
