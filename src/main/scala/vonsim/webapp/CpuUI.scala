package vonsim.webapp

import vonsim.utils.CollectionUtils._
import vonsim.simulator.InstructionInfo
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

import vonsim.simulator.CPU
import vonsim.simulator.SimulatorProgramExecuting
import vonsim.simulator.SimulatorExecutionStopped
import vonsim.simulator.SimulatorExecutionError
import vonsim.simulator.SimulatorExecutionFinished
import vonsim.assembly.Compiler.CompilationResult


class RegistersUI(
  s: VonSimState,
  val registers: List[FullRegister],
  title: String,
  baseId: String = ""
) extends VonSimUI(s) {

  def getIdFor(part: String) = if (baseId == "") "" else baseId + part

  var registerToValueL = mutable.Map[FullRegister, TableCell]()
  var registerToValueH = mutable.Map[FullRegister, TableCell]()

  val names = registers.map(r => td(r.toString))
  val namesRow = thead(th("")).render
  val lowRow = tr(th("L")).render
  val highRow = tr(th("H")).render
  registers.foreach(r => {
    val valueElementH = td("00h").render
    val valueElementL = td("00h").render
    registerToValueL(r) = valueElementL
    registerToValueH(r) = valueElementH
    namesRow.appendChild(th(r.toString).render)
    lowRow.appendChild(valueElementL.render)
    highRow.appendChild(valueElementH.render)
  })
  val body = tbody(
    id := getIdFor("TableBody"),
    cls := "registersTableBody",
    lowRow,
    highRow
  ).render

  val registerTable = table(
    cls := "registerTable",
    namesRow,
    body
  ).render

  val root =
    div(
      id := getIdFor("RegistersTable"),
      cls := "cpuElement",
      div(
        cls := "cpuElementHeader",
        i(cls := "icon-file-binary", " "),
        h3(title)
      ),
      registerTable
    ).render

  def simulatorEvent() {
    registers.foreach(r => {
      val value = s.s.cpu.get(r)
      registerToValueL(r).textContent = formatWord(value.l) + "h"
      registerToValueH(r).textContent = formatWord(value.h) + "h"
    })
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}
}

class WordUI(s: VonSimState) extends HTMLUI {
  val wordElement = td("00000000 00000000").render
  val root = table(cls := "bitTable", tr(wordElement)).render

  def update(v: DWord) {
    val l = Word(v.l).bitString.reverse
    val h = Word(v.h).bitString.reverse
    wordElement.textContent = h + " " + l
  }

}

class CPUStateUI(s: VonSimState) extends VonSimUI(s) {
  
  
  val state = p("asd").render
  val root =
    div(
      cls := "cpuElement",
      div(
        cls := "cpuElementHeader",
        i(cls := "icon-file-binary", " "),
        h3("Estado CPU")
      ),
      state.render
    ).render
    
  
  def update(c:CPU){
    val state= if (c.acceptInterruptions) "Habilitadas" else "Deshabilitadas"
    root.innerHTML=s"Interrupciones: ${state}"
  }
  def simulatorEvent() {
    update(s.s.cpu)
  }
  def compilationEvent() {}
  
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
}

class FlagsUI(s: VonSimState) extends VonSimUI(s) {

  val flagValue = Flag.all.map(f => (f, span("0").render)).toMap
  val flagHeader = Flag.all.map(f => (f, span(f.toString()).render)).toMap

  val headerRow = thead().render
  val valueRow = tr().render
  flagValue.foreach(f => {
    valueRow.appendChild(td(f._2).render)
  })
  flagHeader.foreach(f => {
    headerRow.appendChild(td(f._2).render)
  })
  val root = table(cls := "flagsTable", headerRow, tbody(valueRow)).render

  def flagAsString(flag: Boolean) = if (flag) "1" else "0"
  def update(flags: Flags) {
    Flag.all.foreach(f => {
      val value = flagValue(f)
      val header = flagHeader(f)
      val v = flagAsString(flags.get(f))
      value.textContent = v
      val description = s.uil.cpuFlagDescription(f, v)
      value.title = description
      header.title = description
    })
  }
  def simulatorEvent() {
    update(s.s.cpu.alu.flags)
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}
}

class AluUI(s: VonSimState) extends VonSimUI(s) {

  val bitTableA = new WordUI(s)
  val bitTableB = new WordUI(s)
  val resultBitTable = new WordUI(s)
  val flagsUI = new FlagsUI(s)
  val operation = span(cls := "operation", "--").render
  val root = div(
    id := "alu",
    cls := "cpuElement",
    div(
      cls := "cpuElementHeader",
      i(cls := "icon-calculator"),
      h3(s.uil.aluTitle)
    ),
    div(
      cls := "cpuElementContent",
      div(
        cls := "aluComputation",
        div(cls := "aluOperation", operation),
        div(
          cls := "aluOperands",
          div(cls := "aluOperandA", bitTableA.root),
          div(cls := "aluOperandB", bitTableB.root),
          div(cls := "aluResult", resultBitTable.root)
        )
      ),
      div(
        cls := "aluFlags",
        i(cls := "fa fa-flag", title := s.uil.flags),
        flagsUI.root
      )
    )
  ).render

  def simulatorEvent() {
    operation.textContent = s.s.cpu.alu.op.toString()
    bitTableA.update(s.s.cpu.alu.o1)
    bitTableB.update(s.s.cpu.alu.o2)
    resultBitTable.update(s.s.cpu.alu.res)
    flagsUI.simulatorEvent()
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def compilationEvent() {}
}

class CpuUI(s: VonSimState)
    extends MainboardItemUI(
      s,
			"microchip",
      "cpu",
      s.uil.cpuTitle
    ) {

  val cpuState=new CPUStateUI(s)
  val generalPurposeRegistersTable = new RegistersUI(
    s,
    List(simulator.AX, simulator.BX, simulator.CX, simulator.DX),
    s.uil.cpuGeneralPurposeRegisters,
    "generalPurpose"
  )
  val specialRegistersTable = new RegistersUI(
    s,
    List(
      simulator.IP,
      simulator.SP,
      simulator.IR,
      simulator.MAR,
      simulator.MBR
    ),
    s.uil.cpuSpecialRegisters,
    "special"
  )
  val alu = new AluUI(s)
  val cpuSpeedKey="cpuSpeed"
  getConfigValueInt(cpuSpeedKey).foreach( 
      speed => s.systemEventTimer.setTickTime(speed) )
      
  val speedValues = Array(1000,500,250,125,62,31)
  val speedButton = a(
    cls := "btn btn-primary",
    (1000 / s.systemEventTimer.getTickTime()) + " Hz",
    data("toggle"):="tooltip",
    data("placement"):="bottom",
    title:= "Período del clock: " + s.systemEventTimer.getTickTime() + " ms"
  ).render
  
//  println(s"${getConfigValueInt(cpuSpeedKey)} (CpuUI)")

  
  
  speedUpButton.appendChild(speedButton)
  speedButton.onclick = (e: Any) => {
    val tickTime = s.systemEventTimer.tickTime
    val newTickTime = speedValues((speedValues.indexOf(tickTime) + 1) % speedValues.length)
    s.systemEventTimer.setTickTime(newTickTime)
    setConfigValue(cpuSpeedKey, newTickTime)
  	speedButton.textContent = (1000 / newTickTime ) + " Hz"
  	speedButton.title = "Período del clock: " + newTickTime  + " ms"
	}
  
  contentDiv.appendChild(cpuState.root)
  contentDiv.appendChild(generalPurposeRegistersTable.root)
  contentDiv.appendChild(specialRegistersTable.root)
  contentDiv.appendChild(alu.root)
  
  def simulatorEvent() {
    generalPurposeRegistersTable.simulatorEvent()
    specialRegistersTable.simulatorEvent()
    alu.simulatorEvent()
    cpuState.simulatorEvent()
    
    if (s.isSimulatorExecuting()) speedButton.classList.add("disabled")
    else speedButton.classList.remove("disabled")
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }

}
