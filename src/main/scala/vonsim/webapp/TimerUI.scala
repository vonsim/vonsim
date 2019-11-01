package vonsim.webapp

import org.scalajs.dom.html._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom

import scala.collection.mutable
import scala.util.Random
import scala.scalajs.js
import scalatags.JsDom.all._

import scala.concurrent.Promise
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

import js.JSConverters._

import vonsim.utils.CollectionUtils._

import vonsim.simulator
import vonsim.simulator.InstructionInfo
import vonsim.simulator.Simulator
import vonsim.simulator.Flag
import vonsim.simulator.Flags
import vonsim.simulator.DWord
import vonsim.simulator.Word
import vonsim.simulator.FullRegister
import vonsim.simulator.SimulatorProgramExecuting
import vonsim.simulator.SimulatorExecutionStopped
import vonsim.simulator.SimulatorExecutionError
import vonsim.simulator.SimulatorExecutionFinished
import vonsim.assembly.Compiler.CompilationResult
import vonsim.simulator.Simulator.IOMemoryAddress

class Timer(s: VonSimState) {
	
  def delay(milliseconds: Int): Future[Unit] = {
  	val p = Promise[Unit]()
  	js.timers.setTimeout(milliseconds) {
	    p.success(())
	  }	
	  p.future
	}
	
	val timeDelay = 5000
	check()
	
	def check() {
		var readyLater = for {
		  delayed <- delay(timeDelay)
		} yield {
			if(s.isSimulatorExecuting() && !s.isDebugging())
			  checkTime()
			else {
		  	check()
			}
		}
	}
	
	def checkTime() {
		var cont = s.s.ioMemory.readIO(16).toInt
		val comp = s.s.ioMemory.readIO(17).toInt
		
		cont += 1
		println("Se incremento cont")
		if(cont == comp) {
			cont = 0
			s.s.picInterruption(1)
		}
		s.s.ioMemory.writeIO(16, Word(cont))
		
		var readyLater = for {
		  delayed <- delay(timeDelay)
		} yield {
			  checkTime()
		}
	}
}

class TimerRegistersUI(
	s: VonSimState,
  title: String,
  baseId: String = ""
) extends VonSimUI(s) {
	def getIdFor(part: String) = if (baseId == "") "" else baseId + part

	val rows = Array(
		tr(th("CONT")).render,
		tr(th("COMP")).render
	)
	val bitRows = new Array[Array[TableCell]](8)
	for(i <- 0 to 1) {
		bitRows(i) = Array.fill(8)(td("0").render)
		bitRows(i).foreach(b => rows(i).appendChild(b))
	}
  
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody"
  ).render
	for(i <- 0 to 1) {
		body.appendChild(rows(i))
	}

  val registerTable = table(
    cls := "registerTable",
    body
  ).render

  val root =
    div(
      id := getIdFor("RegistersTable"),
      cls := "cpuElement",
      style := "max-width: 100% !important",
      div(
        cls := "cpuElementHeader",
        i(cls := "icon-file-binary", " "),
        h3(title)
      ),
      registerTable
    ).render

  def simulatorEvent() {
  	var intByteStrings = new Array[String](2)
		intByteStrings(0) = s.s.ioMemory.readIO(16).bitString.reverse
		intByteStrings(1) = s.s.ioMemory.readIO(17).bitString.reverse
  	
  	for(i <- 1 to 0 by -1) {
  		for(j <- 0 to 7) {
  			bitRows(i)(j).textContent = intByteStrings(i).charAt(j).toString()
  		}
  	}
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}
}

class InternalTimerUI (s: VonSimState)
    extends MainboardItemUI(
      s,
			"stopwatch",
      "timer",
      s.uil.timerTitle
    ) {
	
  val registers = new TimerRegistersUI(
    s,
    s.uil.timerRegisters,
    "time"
  )
  
  var timer = new Timer(s)
  
  contentDiv.appendChild(registers.root)

  def simulatorEvent() {
    registers.simulatorEvent()
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }

}

class ExternalTimerUI(s: VonSimState) extends MainboardItemUI (
      s,
			"stopwatch",
      "timer",
      s.uil.timerTitle
    ) {
	
	var minutes = 0
	var seconds = 0
	var text = "".render
	val monitorArea =
		div(
			id := "",
			cls := "",
			h2(text)
		).render
	
	contentDiv.appendChild(monitorArea)
	
  def delay(milliseconds: Int): Future[Unit] = {
  	val p = Promise[Unit]()
  	js.timers.setTimeout(milliseconds) {
	    p.success(())
	  }	
	  p.future
	}
	
	val timeDelay = 1000
	check()
	
	def check() {
		var readyLater = for {
		  delayed <- delay(timeDelay)
		} yield {
			if(s.isSimulatorExecuting() && !s.isDebugging())
			  checkTime()
			else
		  	check()
		}
	}
	
	def checkTime() {
		if(s.s.ioMemory.readIO(16).toInt == s.s.ioMemory.readIO(17).toInt) {
			seconds = seconds + 1
			println("Segundos: " + seconds)
			if(seconds == 60) {
				seconds = 0
				minutes = minutes + 1
				println("Minutos: " + minutes)
				if(minutes == 60)
					minutes = 0
			}
		}
		
	println("s.state: " + s.s.state)
//		if(s.isSimulatorExecuting()) {
			var readyLater = for {
			  delayed <- delay(timeDelay)
			} yield {
				  check()
			}
//		}
	}

	def simulatorEvent() {
		var textString = ""

		if(minutes < 10)
			textString += "0"
		textString += minutes.toString() + ":"
		
		if(seconds < 10)
			textString += "0"
		textString += seconds.toString()
		
		text.textContent = textString
  }
	
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  	seconds = 0
  	minutes = 0
  	text.textContent = "00:00"
  }
  
  //def compilationEvent() {}

}
