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

class MonitorUI(s: VonSimState) extends MainboardItemUI (
      s,
			"desktop",
      "monitor",
      s.uil.monitorTitle
    ) {
	var text = "".render
	val monitorArea =
		div(
			id := "",
			cls := "",
			textarea(
				readonly,
				cols := "50",
				rows := "4",
				style := "white-space: pre",
				text
			)
		).render

	contentDiv.appendChild(monitorArea)

  def simulatorEvent() {
	  text.textContent += s.s.devController.strategie.getMonitorText()
  }

  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }

  def reset() {
  	text.textContent = ""
  }
}
