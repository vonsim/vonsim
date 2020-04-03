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
import scala.collection.mutable.Queue

class PicGeneralRegistersUI(
	s: VonSimState,
  generalRegsTitle: String,
  baseId: String = ""
) extends VonSimUI(s) {
	def getIdFor(part: String) = if (baseId == "") "" else baseId + part

	def values = {
	  var i = -1
	  new Array[Word](4).map(v => {
	    i = i + 1
	    s.s.devController.readIO((32 + i).asInstanceOf[Byte])
	  })
	}
	
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody"
  ).render

  val bytesValues = values
	val rowNames = Array("EOI","IMR","IRR","ISR")
	val rows = rowNames.map(name => {
	  tr(
	    th(name),
      data("toggle"):="tooltip",
      data("placement"):="bottom",
      title:= name
	  ).render 
	})
	val bitRows = new Array[Array[TableCell]](4)
	val bitStrings = bytesValues.map(v => v.bitString.reverse)
	for(i <- 0 to 3) {
		bitRows(i) = bitStrings(i).map(bit => (td(bit.toString()).render)).toArray
		bitRows(i).foreach(b => rows(i).appendChild(b))
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
        h3(generalRegsTitle)
      ),
      registerTable
    ).render

  def getBits(value: Word, bitValue: Integer) = {
    var i = -1
    var res = ""
    val bits = Queue.empty[String]
    value.bitString.foreach(bit => {
      i = i + 1
      if(bit.toString() == bitValue.toString())
        bits += i.toString()
    })
    val length = bits.length - 1
    for(i <- 0 to length) {
      if(i == 0)
        res = bits.dequeue()
      else if(i < length)
        res = res + ", " + bits.dequeue()
      else
        res = res + " y " + bits.dequeue()
    }
    res
  }
  
  setDescriptions(values)
  def setDescriptions(values: Array[Word]) {
    rows(0).title = "EOI: " + formatWord(values(0)) + "h"
    rows(1).title = if(bytesValues(1) != Word(0)) "IMR: Interrupciones " + getBits(bytesValues(1), 0) + " habilitadas"
                    else "No hay interrupciones habilitadas" + "\n"
    rows(2).title = if(bytesValues(2) != Word(0)) "IRR: Interrupciones " + getBits(bytesValues(2), 1) + " pedidas"
                    else "No hay interrupciones pedidas" + "\n"
    rows(3).title = if(bytesValues(3) != Word(0)) "ISR: Interrupciones " + getBits(bytesValues(3), 1) + " ejecutándose"
                    else "No hay interrupciones ejecutándose" + "\n"
  }
    
  def simulatorEvent() {
    val bytesValues = values
  	val intByteStrings = bytesValues.map(v => v.bitString.reverse)
  	for(i <- 3 to 0 by -1)
  		for(j <- 0 to 7)
  			bitRows(i)(j).textContent = intByteStrings(i).charAt(j).toString()
    setDescriptions(bytesValues)
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}
}

class PicInterruptionsRegistersUI(
	s: VonSimState,
  intRegsTitle: String,
  baseId: String = ""
) extends VonSimUI(s) {
	def getIdFor(part: String) = if (baseId == "") "" else baseId + part

	def values = {
	  var i = -1
	  new Array[Word](8).map(v => {
	    i = i + 1
	    s.s.devController.readIO((36 + i).asInstanceOf[Byte])
	  })
	}
	
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody"
  ).render

  val bytesValues = values
	val rowNames = Array("INT0", "INT1", "INT2", "INT3", "INT4", "INT5", "INT6", "INT7")
	val rows = rowNames.map(name => {
	  tr(
	    th(name),
      data("toggle"):="tooltip",
      data("placement"):="bottom",
      title:= name
	  ).render 
	})
	val bitRows = new Array[Array[TableCell]](8)
	val bitStrings = bytesValues.map(v => v.bitString.reverse)
	for(i <- 0 to 7) {
		bitRows(i) = bitStrings(i).map(bit => (td(bit.toString()).render)).toArray
		bitRows(i).foreach(b => rows(i).appendChild(b))
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
        h3(intRegsTitle)
      ),
      registerTable
    ).render

  setDescriptions(values)
  def setDescriptions(values: Array[Word]) {
    var i = -1
    var value = values(0)
    var intAddress = 0
    var intAddressValue = ""
    var res = ""
    rowNames.map(name => {
      i += 1
      intAddress = values(i).toUnsignedInt * 4
      intAddressValue = formatWord(s.s.memory.getByte(intAddress + 1)) + formatWord(s.s.memory.getByte(intAddress))
      rows(i).title = "El índice del vector de interrupciones para línea de entrada " + name + " es " + intAddress + "h.\n" +
                      "El vector de interrupciones en esa dirección vale " + intAddressValue + "h."
    })
  }

  def simulatorEvent() {
  	val bytesValues = values
  	val intByteStrings = bytesValues.map(v => v.bitString.reverse)
  	for(i <- 7 to 0 by -1) {
  		for(j <- 0 to 7) {
  			bitRows(i)(j).textContent = intByteStrings(i).charAt(j).toString()
  		}
  	}
  	setDescriptions(bytesValues)
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
