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
	
  val leds = Word

	val tableRow = tr().render
	val ledsByteString = leds.toString()
	val ledBitRows = Array(
		td(ledsByteString.charAt(0)).render,
		td(ledsByteString.charAt(1)).render,
		td(ledsByteString.charAt(2)).render,
		td(ledsByteString.charAt(3)).render,
		td(ledsByteString.charAt(4)).render,
		td(ledsByteString.charAt(5)).render,
		td(ledsByteString.charAt(6)).render,
		td(ledsByteString.charAt(7)).render
	)
	ledBitRows.foreach(b => tableRow.appendChild(b.render))
	
	val body = tbody(
	  tableRow,
	  tr(
			td(7).render,
	  	td(6).render,
	  	td(5).render,
	  	td(4).render,
	  	td(3).render,
	  	td(2).render,
	  	td(1).render,
	  	td(0).render
	  )
	).render
	
	val registerTable = table(
	  cls := "registerTable",
	  body
	).render
	
	val ledsUI =
	  div(
	    registerTable,
		  div(style:="padding-top: 10px", "Verde -> Encendido")
	  ).render
	
	contentDiv.appendChild(ledsUI)

	var previousPB = Word(0).bitString.reverse

	def simulatorEvent() {
  	var PB = s.s.ioMemory.readIO(49).bitString.reverse
  	println("previousPB: " + previousPB)
  	println("PB: " + PB)
  	
  	if(previousPB != PB){
  		previousPB = PB
	  	
			for(i <- 0 to 7) {
				
				if(PB.charAt(i) == '1') // Encendido => Verde
					ledBitRows(i).classList.add("green")
				else if(PB.charAt(i) == '0') // Apagado => Sin color
					ledBitRows(i).classList.remove("green")
				
				ledBitRows(i).textContent = PB.charAt(i).toString() 
  		}
		}
	}
	
	def simulatorEvent(i: InstructionInfo) {
	  simulatorEvent()
	}
}