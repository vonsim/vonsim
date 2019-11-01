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

//class Printer(s: VonSimState) {
class Printer() {

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
//	var mode = 0 // 0 -> PIO, 1 -> HANDSHAKE
	
//	var strobePreviousValue = 0
//	var strobeActualValue = 0
	var strobePulse = false
	var busy = false
	
	var data = Word(0)
	var charToPrint = '\0'
	
	var readyLater = for {
	  delayed <- delay(20)
	} yield {
	  checkPrint()
	}

  def delay(milliseconds: Int): Future[Unit] = {
  	val p = Promise[Unit]()
  	js.timers.setTimeout(milliseconds) {
	    p.success(())
	  }	
	  p.future
	}

	def checkPrint() {
//  	var CA = s.s.ioMemory.readIO(50)
//  	var CB = s.s.ioMemory.readIO(51)
//  	
//  	strobeActualValue = PA.bit(1)

//		if((CA.bit(1) == 0) && (CA.bit(0) == 1) && (CB.toInt == 0)) { // CA = XXXXXX01 && CB = 0000000
//			if((strobePreviousValue == 0) && (strobeActualValue == 1))
//				strobePulse = true
//			strobePreviousValue = strobeActualValue
			if(strobePulse && !busy) {
				busy = true
				charToPrint = data.toInt.toChar
				strobePulse = false
			}
//		}
	}
	
	def isIdle() = {
		!busy
	}
	
	def isBusy() = {
		busy
	}
	
	def sendData(d: Word) = {
		data = d
	}
	
	def sendStrobe() = {
//		if(strobePreviousValue == 0)
			strobePulse = true
//		strobePreviousValue = 1
	}
	
	def getCharToPrint() = {
		busy = false
		if(charToPrint != '\0')
			charToPrint
		else ""
	}
}

class PrinterUI(s: VonSimState) extends MainboardItemUI (
      s,
			"print",
      "printer",
      s.uil.printerTitle
    ) {
	
	var printer = new Printer() 
	
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
		if(printer.isBusy())
			text.textContent += printer.getCharToPrint()
  }
	
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  	text.textContent = ""
  }
  
  //def compilationEvent() {}

}
