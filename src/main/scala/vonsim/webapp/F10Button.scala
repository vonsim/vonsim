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

class F10Button(s: VonSimState) extends MainboardItemUI (
      s,
			"exchange-alt",
      "F10",
      s.uil.f10Title
    ) {
	
	val boton = button(
		cls := "btn btn-primary",
    "F10",
    title := "Interrupción F10"
	).render

	val monitorArea =
		div(
			id := "",
			cls := "",
			boton
		).render
	
	contentDiv.appendChild(monitorArea)
	
	boton.onclick = (e: Any) => {
		s.s.devController.strategie.f10Pressed()
  }
	
  def simulatorEvent() {}
	
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
}