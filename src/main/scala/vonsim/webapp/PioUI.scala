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


class PIORegistersUI(
	s: VonSimState,
  val portx: Byte,
  val controlx: Byte,
  title: String,
  baseId: String = "",
  portLetter: String
) extends VonSimUI(s) {

  def getIdFor(part: String) = if (baseId == "") "" else baseId + part

  val dataRow = tr(th("P"+portLetter)).render
  val controlRow = tr(th("C"+portLetter)).render
  
  val dataByteString = portx.toString()
  val controlByteString = controlx.toString()
  
  val dataBitRows = Array(
		td(dataByteString.charAt(0)).render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render
  )
  
  val controlBitRows = Array(
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render,
		td("0").render
  )

  dataBitRows.foreach(b => dataRow.appendChild(b.render))
  controlBitRows.foreach(b => controlRow.appendChild(b.render))
  
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody",
    dataRow,
    controlRow
  ).render

  val registerTable = table(
    cls := "registerTable",
//    thead(th("Register"), th(colspan := 2, "Value")),
//    thead(th(""), th("H"), th("L")),
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
  	var dataByteString = ""
  	var controlByteString = ""
  	if(portLetter == "A") {
  		dataByteString = s.s.memory.getByte(48).bitString.reverse
  		controlByteString = s.s.memory.getByte(50).bitString.reverse
//	  	println("Puerto " + portLetter + ": " + s.s.memory.getByte(30).toString())
//	  	println("Control " + portLetter + ": " + s.s.memory.getByte(32).toString())
  	}
  	else if (portLetter == "B") {
  		dataByteString = s.s.memory.getByte(49).bitString.reverse
  		controlByteString = s.s.memory.getByte(51).bitString.reverse
//	  	println("Puerto " + portLetter + ": " + s.s.memory.getByte(31).toString())
//	  	println("Control " + portLetter + ": " + s.s.memory.getByte(33).toString())
  	}
  	
//  	println("Puerto " + portLetter + ": " + dataByteString)
//  	println("Control " + portLetter + ": " + controlByteString)
  	
  	for(i <- 0 to 7) {
  		dataBitRows(i).textContent = dataByteString.charAt(i).toString()
  		controlBitRows(i).textContent = controlByteString.charAt(i).toString() 
  	}
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}

}

class PioUI (s: VonSimState)
    extends MainboardItemUI(
      s,
			"exchange-alt",
      "pio",
      s.uil.pioTitle
    ) {
	
  val portA = new PIORegistersUI(
    s,
    s.s.memory.getByte(48),
    s.s.memory.getByte(50),
    s.uil.pioAPort,
    "pio",
    "A"
  )

  val portB = new PIORegistersUI(
    s,
    s.s.memory.getByte(49),
    s.s.memory.getByte(51),
    s.uil.pioBPort,
    "pio",
    "B"
  )

  contentDiv.appendChild(portA.root)
  contentDiv.appendChild(portB.root)

  def simulatorEvent() {
    portA.simulatorEvent()
    portB.simulatorEvent()
  }
  def simulatorEvent(i: InstructionInfo) {
    portA.simulatorEvent(i)
    portB.simulatorEvent(i)
  }

}
