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
	
  val keys = s.s.memory.getByte(51)

	val tableRow = tr().render
	val keysByteString = keys.toString()
	val keyBitRows = Array(
		td(keysByteString.charAt(0)).render,
		td(keysByteString.charAt(1)).render,
		td(keysByteString.charAt(2)).render,
		td(keysByteString.charAt(3)).render,
		td(keysByteString.charAt(4)).render,
		td(keysByteString.charAt(5)).render,
		td(keysByteString.charAt(6)).render,
		td(keysByteString.charAt(7)).render
	)
	keyBitRows.foreach(b => tableRow.appendChild(b.render))
	
	val body = tbody(
	  tableRow
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

	def simulatorEvent() {
		var keysByteString = s.s.memory.getByte(48).bitString.reverse
		
	//  	println("Puerto " + portLetter + ": " + s.s.memory.getByte(30).toString())
	//  	println("Control " + portLetter + ": " + s.s.memory.getByte(32).toString())
		
	//  	println("Puerto " + portLetter + ": " + dataByteString)
	//  	println("Control " + portLetter + ": " + controlByteString)
		
		for(i <- 0 to 7) {
			keyBitRows(i).textContent = keysByteString.charAt(i).toString() 
		}
	}
	
	def simulatorEvent(i: InstructionInfo) {
	  simulatorEvent()
	}
}