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

class PrinterUI(s: VonSimState) extends MainboardItemUI (
      s,
			"print",
      "printer",
      s.uil.printerTitle
    ) {
	
	var mode = 0 // 0 -> PIO, 1 -> HANDSHAKE
	/*
	 * PIO:
	 *	BUSY: PA -> Bit 0 (entrada)
	 *	STROBE: PA -> Bit 1 (salida)
	 * 	DATA1...DATA8: PB -> PB0...PB7 (salida)
	 * 
	 * HANDSHAKE:
	 *	BUSY: ESTADO -> Bit 0 (entrada)
	 *	STROBE: ESTADO -> Bit 1 (salida)
	 * 	DATA1...DATA8: DATOS -> PB0...PB7 (salida)
	 */
	var strobePreviousValue = 0
	var strobeActualValue = 0
	var strobePulse = false
	var busy = false
	
	var text = "".render
	val monitorArea =
		div(
			id := "",
			cls := "",
			textarea(
				readonly,
				cols := "20",
				rows := "5",
				style := "font-family: 'Lucida Console', Monaco, monospace;",
				text
			)
		).render
	
	contentDiv.appendChild(monitorArea)
	
  def simulatorEvent() {
  	var PA = s.s.ioMemory.readIO(48)
  	var PB = s.s.ioMemory.readIO(49)
  	var CA = s.s.ioMemory.readIO(50)
  	var CB = s.s.ioMemory.readIO(51)
  	
  	strobeActualValue = PA.bit(1)

		if((CA.bit(1) == 0) && (CA.bit(0) == 1) && (CB.toInt == 0)) { // CA = XXXXXX01 && CB = 0000000
//			println()
//			println("strobePreviousValue: " + strobePreviousValue)
//			println("strobeActualValue: " + strobeActualValue)
//			println()
			if((strobePreviousValue == 0) && (strobeActualValue == 1))
				strobePulse = true
			strobePreviousValue = strobeActualValue
			if(strobePulse && !busy) {
				busy = true
				text.textContent += PB.toInt.toChar
				// Alguna clase de delay???
				busy = false
				strobePulse = false
			}
		}
  }
	
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  	text.textContent = ""
  }
  
  //def compilationEvent() {}

}
