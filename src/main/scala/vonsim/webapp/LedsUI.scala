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

class LedsUI (s: VonSimState)
    extends MainboardItemUI(
      s,
			"toggle-on",
      "leds",
      s.uil.ledsTitle
    ) {
	
	var leds = Word(0)
	val ledRows = Array(
		i(cls:="far fa-lightbulb fa-2x").render,
		i(cls:="far fa-lightbulb fa-2x").render,
		i(cls:="far fa-lightbulb fa-2x").render,
		i(cls:="far fa-lightbulb fa-2x").render,
		i(cls:="far fa-lightbulb fa-2x").render,
		i(cls:="far fa-lightbulb fa-2x").render,
		i(cls:="far fa-lightbulb fa-2x").render,
		i(cls:="far fa-lightbulb fa-2x").render
	)
	val tableCells = Array(
		td(ledRows(0), cls:="keyElement", data("toggle"):="tooltip", data("placement"):="bottom", title:= "").render,
		td(ledRows(1), cls:="keyElement", data("toggle"):="tooltip", data("placement"):="bottom", title:= "").render,
		td(ledRows(2), cls:="keyElement", data("toggle"):="tooltip", data("placement"):="bottom", title:= "").render,
		td(ledRows(3), cls:="keyElement", data("toggle"):="tooltip", data("placement"):="bottom", title:= "").render,
		td(ledRows(4), cls:="keyElement", data("toggle"):="tooltip", data("placement"):="bottom", title:= "").render,
		td(ledRows(5), cls:="keyElement", data("toggle"):="tooltip", data("placement"):="bottom", title:= "").render,
		td(ledRows(6), cls:="keyElement", data("toggle"):="tooltip", data("placement"):="bottom", title:= "").render,
		td(ledRows(7), cls:="keyElement", data("toggle"):="tooltip", data("placement"):="bottom", title:= "").render
	)
	
	val body = tbody(
	  tr(
	  	tableCells
	  )
	).render
	
	val registerTable = table(
	  cls := "registerTable",
	  body
	).render
	
	val ledsUI =
	  div(
	    registerTable
	  ).render
	
	contentDiv.appendChild(ledsUI)

	def updateDescriptions(index: Int, control: Int) {
		var title = "Bit " + index + " del registro de luces, con valor: " + leds.bit(index)
		title = title + "\nEste bit está conectado al bit " + index + " del registro PB del PIO"
		if(control == 1)
			title = title + "\nAdvertencia: El bit está configurado como entrada, en vez de salida"
		tableCells(7-index).title = title
	}
	
	def simulatorEvent() {
		val CB = s.s.ioMemory.readIO(51)
		leds = Word(s.s.ioMemory.readIO(49).toInt & ~(s.s.ioMemory.readIO(51).toInt))
		for(i <- 0 to 7) {
			if(leds.bit(7-i) == 1) { // Encendido => Verde
				ledRows(i).classList.remove("far")
				ledRows(i).classList.add("fas")
				ledRows(i).classList.add("green-light")
			}
			else { // Apagado => Sin color
				ledRows(i).classList.remove("fas")
				ledRows(i).classList.remove("green-light")
				ledRows(i).classList.add("far")
			}
			updateDescriptions(i, CB.bit(i))
		}
	}
	
	def simulatorEvent(i: InstructionInfo) {
	  simulatorEvent()
	}
	
	def reset() {
		leds = Word(s.s.ioMemory.readIO(49).toInt & ~(s.s.ioMemory.readIO(51).toInt))
	}
}