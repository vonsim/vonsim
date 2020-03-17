package vonsim.webapp

import vonsim.simulator.InstructionInfo
import vonsim.utils.CollectionUtils._
import scalatags.JsDom.all._
import org.scalajs.dom.html._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom.raw._
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

class KeysUI (s: VonSimState)
    extends MainboardItemUI(
      s,
			"toggle-on",
      "keys",
      s.uil.keysTitle
    ) {
	
	def value = s.s.devController.strategie.getKeysValue
	
	val inputArray = Array(
		input(cls:= "slider-box", `type`:= "checkbox").render,
		input(cls:= "slider-box", `type`:= "checkbox").render,
		input(cls:= "slider-box", `type`:= "checkbox").render,
		input(cls:= "slider-box", `type`:= "checkbox").render,
		input(cls:= "slider-box", `type`:= "checkbox").render,
		input(cls:= "slider-box", `type`:= "checkbox").render,
		input(cls:= "slider-box", `type`:= "checkbox").render,
		input(cls:= "slider-box", `type`:= "checkbox").render
	)
	
	val spanArray = Array(
		span(cls:= "slider").render,
		span(cls:= "slider").render,
		span(cls:= "slider").render,
		span(cls:= "slider").render,
		span(cls:= "slider").render,
		span(cls:= "slider").render,
		span(cls:= "slider").render,
		span(cls:= "slider").render
	)
	
	val switches = Array(
		tableSwitch(0),
		tableSwitch(1),
		tableSwitch(2),
		tableSwitch(3),
		tableSwitch(4),
		tableSwitch(5),
		tableSwitch(6),
		tableSwitch(7)
	)
	val body = tbody(
	  tr(
			switches(0),
			switches(1),
			switches(2),
			switches(3),
			switches(4),
			switches(5),
			switches(6),
			switches(7)
	  )
	).render
	
	val registerTable = table(
	  cls := "registerTable",
	  body
	).render
	
	val keysUI =
	  div(
	    registerTable
	  ).render
	
	contentDiv.appendChild(keysUI)
	
	for(i <- 0 to 7) {
		inputArray(i).onclick = (e: Any) => {
			toggleBit(i)
		}
  }

	def tableSwitch(index: Int) = {
  	td(
	  	label(
	  		cls:= "switch",
	  		inputArray(7-index),
	  		spanArray(index)
	  	),
	  	cls:="keyElement",
	  	data("toggle"):="tooltip",
	  	data("placement"):="bottom",
	  	title:= ""
  	).render
  }
	
	def updateDescriptions(index: Int, entrada: Int) {
		var title = "Bit " + (7-index) + " del registro de interruptores, con valor: " + value.bit(7-index)
		title = title + "\nEste bit está conectado al bit " + (7-index) + " del registro PA del PIO"
		if(entrada == 0)
			title = title + "\nAdvertencia: El bit está configurado como salida, en vez de entrada"
		switches(index).title = title
	}
	
	def simulatorEvent() {
  	var CA = s.s.devController.readIO(50)
		for(i <- 0 to 7) {
//			println("value.bit(" + i + ") = " + value.bit(i))
			// println("inputArray(" + i + ") = " + inputArray(i).checked)
			inputArray(i).checked = (value.bit(i) == 1)
			updateDescriptions(i, CA.bit(7-i))
		}
	}
	
	def simulatorEvent(i: InstructionInfo) {
	  simulatorEvent()
	}
	
	def reset() {
	  
	}
	
	def toggleBit(i: Int) {
  	s.s.devController.strategie.toggleKeyBit(i)
  	simulatorEvent()
	}

  def show() {
  	root.classList.remove("hidden")
  }
  def hide() {
  	root.classList.add("hidden")
  }

}