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

class PrinterUI(s: VonSimState) extends MainboardItemUI (
      s,
			"print",
      "printer",
      s.uil.printerTitle
    ) {
  
  def buffer = s.s.devController.getPrinterBuffer()
	
  val bufferRow = tr(th("Buffer")).render
  val charsToPrint = Array.fill(5)(
    td(
      "",
      cls:="tooltipHover",
      data("toggle"):="tooltip",
      data("placement"):="bottom",
      title:= ""
    ).render
  )
  charsToPrint.foreach(b => {
    bufferRow.appendChild(b.render)
    setDescription(b, "No hay caracter para imprimir")
  })
  
  var text = "".render
	val monitorArea =
		div(
			id := "",
			cls := "",
			textarea(
				readonly,
				cols := "20",
				rows := "5",
				style := "font-family: 'Lucida Console', Monaco, monospace; white-space: pre;",
				text
			),
			table(
        cls := "registerTable",
        tbody(
          cls := "registersTableBody",
          bufferRow
        )
      )
		).render
	
  val speedValues = Array(1000,500,250,125,62,31)
  val printerSpeedKey="printerSpeed"
  getConfigValueInt(printerSpeedKey).foreach( 
      speed => s.s.devController.setPrinterTickTime(speed) )
  
  val tickTime=s.s.devController.getPrinterTickTime()
  println(tickTime)
  val speedButton = a(
    cls := "btn btn-primary",
    (1000.0 / tickTime) + " Hz",
    data("toggle"):="tooltip",
    data("placement"):="bottom",
    title:= "Período: " + tickTime + " ms"
  ).render
  

      
  speedUpButton.appendChild(speedButton.render)
  speedButton.onclick = (e: Any) => {
    
  	val tickTime = s.s.devController.getPrinterTickTime()
    val newTickTime = speedValues((speedValues.indexOf(tickTime) + 1) % speedValues.length)
    s.s.devController.setPrinterTickTime(newTickTime)
    setConfigValue(printerSpeedKey, newTickTime)
  	speedButton.textContent = (1000 / newTickTime ) + " Hz"
  	speedButton.title = "Período: " + newTickTime  + " ms"
	}
  
	contentDiv.appendChild(monitorArea)
	
	def setDescription(cell: TableCell, tooltip: String) {
	  cell.title = tooltip
	}
	
  def simulatorEvent() {
    var i = -1
    val bufferArray = Array.fill(5)(Word(0))
    buffer.copyToArray(bufferArray)
    bufferArray.foreach(word => {
      i += 1
      if(word != Word(0)) {
        charsToPrint(i).textContent = word.toInt.toChar.toString()
        setDescription(charsToPrint(i), i + "° caracter a imprimir: '" + charsToPrint(i).textContent + "'.")
      }
      else {
        charsToPrint(i).textContent = ""
        setDescription(charsToPrint(i), "No hay un caracter para imprimir.")
      }
    })
	  text.textContent = s.s.devController.config.getPrintedText()
    if (s.isSimulatorExecuting()) speedButton.classList.add("disabled")
    else speedButton.classList.remove("disabled")
  }
	
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  	text.textContent = ""
  }

  def show() {
  	root.classList.remove("hidden")
  }
  def hide() {
  	root.classList.add("hidden")
  }

}
