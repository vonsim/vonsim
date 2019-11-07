package vonsim.webapp

import org.scalajs.dom.html._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom

import scala.collection.mutable
import scala.util.Random
import scala.scalajs.js
import scalatags.JsDom.all._

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

class PicGeneralRegistersUI(
	s: VonSimState,
  title: String,
  baseId: String = ""
) extends VonSimUI(s) {
	def getIdFor(part: String) = if (baseId == "") "" else baseId + part

  val eoiRow = tr(th("EOI")).render
  val imrRow = tr(th("IMR")).render
  val irrRow = tr(th("IRR")).render
  val isrRow = tr(th("ISR")).render
  
  val eoiBitRows = Array.fill(8)(td("0").render)
  val imrBitRows = Array.fill(8)(td("0").render)
  val irrBitRows = Array.fill(8)(td("0").render)
  val isrBitRows = Array.fill(8)(td("0").render)
  
  eoiBitRows.foreach(b => eoiRow.appendChild(b))
  imrBitRows.foreach(b => imrRow.appendChild(b))
  irrBitRows.foreach(b => irrRow.appendChild(b))
  isrBitRows.foreach(b => isrRow.appendChild(b))
  
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody",
    eoiRow,
    imrRow,
    irrRow,
    isrRow
  ).render

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
		var eoiByteString = s.s.devController.readIO(32).bitString.reverse
		var imrByteString = s.s.devController.readIO(33).bitString.reverse
		var irrByteString = s.s.devController.readIO(34).bitString.reverse
		var isrByteString = s.s.devController.readIO(35).bitString.reverse
  	
  	for(i <- 0 to 7) {
      eoiBitRows(i).textContent = eoiByteString.charAt(i).toString()
      imrBitRows(i).textContent = imrByteString.charAt(i).toString()
      irrBitRows(i).textContent = irrByteString.charAt(i).toString()
      isrBitRows(i).textContent = isrByteString.charAt(i).toString()
  	}
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}
}

class PicInterruptionsRegistersUI(
	s: VonSimState,
  title: String,
  baseId: String = ""
) extends VonSimUI(s) {
	def getIdFor(part: String) = if (baseId == "") "" else baseId + part

	val intRows = new Array[TableRow](8)
	val intBitRows = new Array[Array[TableCell]](8)
	for(i <- 0 to 7) {
		intRows(i) = tr(th("INT"+i)).render
		intBitRows(i) = Array.fill(8)(td("0").render)
		intBitRows(i).foreach(b => intRows(i).appendChild(b))
	}
  
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody"
  ).render
	for(i <- 0 to 7) {
		body.appendChild(intRows(i))
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
  	var intByteStrings = new Array[String](8)
  	var memoryAdress : IOMemoryAddress = 0
  	for(i <- 0 to 7) {
  		memoryAdress = (36 + i).asInstanceOf[Byte]
  		intByteStrings(i) = s.s.devController.readIO(memoryAdress).bitString.reverse
  	}
  	
  	for(i <- 7 to 0 by -1) {
  		for(j <- 0 to 7) {
  			intBitRows(i)(j).textContent = intByteStrings(i).charAt(j).toString()
  		}
  	}
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}
}

class PicUI (s: VonSimState)
    extends MainboardItemUI(
      s,
			"exchange-alt",
      "pic",
      s.uil.picTitle
    ) {
	
  val generals = new PicGeneralRegistersUI(
    s,
    s.uil.picGeneralRegisters,
    "pic"
  )

  val interruptions = new PicInterruptionsRegistersUI(
    s,
    s.uil.picInterruptionsRegisters,
    "pic"
  )

  contentDiv.appendChild(generals.root)
  contentDiv.appendChild(interruptions.root)

  def simulatorEvent() {
    generals.simulatorEvent()
    interruptions.simulatorEvent()
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }

}
