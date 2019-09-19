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
		span(cls:= "slider", attr("bit"):="0").render,
		span(cls:= "slider", attr("bit"):="0").render,
		span(cls:= "slider", attr("bit"):="0").render,
		span(cls:= "slider", attr("bit"):="0").render,
		span(cls:= "slider", attr("bit"):="0").render,
		span(cls:= "slider", attr("bit"):="0").render,
		span(cls:= "slider", attr("bit"):="0").render,
		span(cls:= "slider", attr("bit"):="0").render
	)
	
	val bitArray = Array(
		td(7).render,
  	td(6).render,
  	td(5).render,
  	td(4).render,
  	td(3).render,
  	td(2).render,
  	td(1).render,
  	td(0).render
	)
	
	val body = tbody(
	  tr(
			tableSwitch(0),
			tableSwitch(1),
			tableSwitch(2),
			tableSwitch(3),
			tableSwitch(4),
			tableSwitch(5),
			tableSwitch(6),
			tableSwitch(7)
	  ),
	  tr(
	  	bitArray(0),
	  	bitArray(1),
	  	bitArray(2),
	  	bitArray(3),
	  	bitArray(4),
	  	bitArray(5),
	  	bitArray(6),
	  	bitArray(7)
	  )
	).render
	
	val registerTable = table(
	  cls := "registerTable",
	  body
	).render
	
	val keysUI =
	  div(
	    registerTable,
		  div(style:="padding-top: 10px", "Verde -> Entrada  |  Rojo -> Salida")
	  ).render
	
	contentDiv.appendChild(keysUI)
	
	def tableSwitch(index: Int) = {
  	td(
	  	label(
	  		cls:= "switch",
	  		inputArray(index),
	  		spanArray(index)
	  	)
  	).render
  }
	
	var previousPA = Word(0)
	var previousCA = Word(0)
	
	def simulatorEvent() {
  	var PA = s.s.ioMemory.readIO(48)
  	var CA = s.s.ioMemory.readIO(50)
  	
  	if((previousPA != PA) || (previousCA != CA)){
  		previousPA = PA
  		previousCA = CA
  		
	  	var PAString = PA.bitString.reverse
	  	var CAString = CA.bitString.reverse
	  	
			for(i <- 0 to 7) {
				
				if(CAString.charAt(i) == '1') { // Entrada => Verde
					bitArray(i).classList.add("green")
					bitArray(i).classList.remove("red")
					inputArray(i).disabled = false
				}
				else if(CAString.charAt(i) == '0') { // Salida => Rojo
					bitArray(i).classList.add("red")
					bitArray(i).classList.remove("green")
					inputArray(i).disabled = true
				}
				
				if(PAString.charAt(i) == '1')
					inputArray(i).checked = true
				else if(PAString.charAt(i) == '0')
					inputArray(i).checked = false
				spanArray(i).setAttribute("bit", PAString.charAt(i).toString())
  		}
		}
	}
	
	def simulatorEvent(i: InstructionInfo) {
	  simulatorEvent()
	}
	
	def toggleBit(i: Int) {
  	var PA = s.s.ioMemory.readIO(48)
  	
  	if(PA.bit(i) == 0)
  		PA = (Word) (PA | (1 << i));
  	else if(PA.bit(i) == 1)
  		PA = (Word) (PA & ~(1 << i));
		
  	s.s.ioMemory.writeIO(48, PA)
  	
  	simulatorEvent()
	}
}