package vonsim.webapp

import vonsim.simulator.InstructionInfo
import vonsim.utils.CollectionUtils._
import scalatags.JsDom.all._
import org.scalajs.dom.html._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom
import scala.scalajs.js
import js.JSConverters._
import scala.collection.mutable
import vonsim.simulator.Simulator
import scala.util.Random
import vonsim.simulator
import vonsim.simulator.Flags
import vonsim.simulator.DWord
import vonsim.simulator.Word
import vonsim.simulator.FullRegister
import scalatags.JsDom.all._
import vonsim.simulator.Flag
import vonsim.simulator.BX
import vonsim.simulator.AL

import vonsim.simulator.SimulatorProgramExecuting
import vonsim.simulator.SimulatorExecutionStopped
import vonsim.simulator.SimulatorExecutionError
import vonsim.simulator.SimulatorExecutionFinished
import vonsim.assembly.Compiler.CompilationResult

import scala.concurrent.Promise
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class PrinterUI(s: VonSimState) extends MainboardItemUI (
      s,
			"print",
      "printer",
      s.uil.printerTitle
    ) {
	
	var text = "".render
	val monitorArea =
		div(
			id := "",
			cls := "",
			textarea(
				readonly,
				cols := "20",
				rows := "5",
				style := "font-family: 'Lucida Console', Monaco, monospace; white-space: pre;",
				text
			)
		).render
	
  val speedButton = a(
    cls := "btn btn-primary",
    (1000.0 / s.s.devController.getPrinterTickTime()) + " Hz",
    data("toggle"):="tooltip",
    data("placement"):="bottom",
    title:= "Período del clock: " + s.s.devController.getPrinterTickTime() + " ms"
  ).render
  
  speedUpButton.appendChild(speedButton.render)
  speedButton.onclick = (e: Any) => {
  	s.s.devController.printerSpeedUp()
  	speedButton.textContent = (1000.0 / s.s.devController.getPrinterTickTime()) + " Hz"
  	speedButton.title = "Período del clock: " + s.s.devController.getPrinterTickTime() + " ms"
	}
  
	contentDiv.appendChild(monitorArea)
	
  def simulatorEvent() {
	  text.textContent = s.s.devController.strategie.getPrintedText()
    if (s.isSimulatorExecuting()) speedButton.classList.add("disabled")
    else speedButton.classList.remove("disabled")
  }
	
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  	text.textContent = ""
  }

  def show() {
  	root.classList.remove("hidden")
  }
  def hide() {
  	root.classList.add("hidden")
  }

}
