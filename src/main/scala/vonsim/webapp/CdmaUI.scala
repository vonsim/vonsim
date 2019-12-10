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

class CdmaRegistersUI(
	s: VonSimState,
  title: String,
  baseId: String = ""
) extends VonSimUI(s) {
	def getIdFor(part: String) = if (baseId == "") "" else baseId + part

	val rows = Array(
		tr(th("RFL")).render,
		tr(th("RFH")).render,
		tr(th("CONTL")).render,
		tr(th("CONTH")).render,
		tr(th("RDL")).render,
		tr(th("RDH")).render,
		tr(th("CTRL")).render,
		tr(th("ARRANQUE")).render
	)
	val bitRows = new Array[Array[TableCell]](8)
	for(i <- 0 to 7) {
		bitRows(i) = Array.fill(8)(td("0").render)
		bitRows(i).foreach(b => rows(i).appendChild(b))
	}
  
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody"
  ).render
	for(i <- 0 to 7) {
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
  	var intByteStrings = new Array[String](8)
  	var memoryAdress : IOMemoryAddress = 0
  	for(i <- 0 to 7) {
  		memoryAdress = (80 + i).asInstanceOf[Byte]
  		intByteStrings(i) = s.s.devController.readIO(memoryAdress).bitString.reverse
  	}
  	
  	for(i <- 7 to 0 by -1) {
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

class CdmaUI (s: VonSimState)
    extends MainboardItemUI(
      s,
			"exchange-alt",
      "cdma",
      s.uil.cdmaTitle
    ) {
	
  val registers = new CdmaRegistersUI(
    s,
    s.uil.cdmaRegisters,
    "cdma"
  )

  contentDiv.appendChild(registers.root)

  def simulatorEvent() {
    registers.simulatorEvent()
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }

  def show() {
  	root.classList.remove("hidden")
  }
  def hide() {
  	root.classList.add("hidden")
  }

}
