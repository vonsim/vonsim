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

class KeyboardUI(s: VonSimState) extends MainboardItemUI (
      s,
			"keyboard",
      "keyboard",
      s.uil.keyboardTitle
    ) {
	val text = "".render
	val keyboardArea = 
		textarea(
//			disabled,
//			onkeypress:= "keyPressed",
			cols := "50",
			rows := "4",
			id := "keyboardArea",
			style := "white-space: pre",
			text
		).render
	val keyboard =
		div(
			keyboardArea
		).render
	
//	disableTextArea()
	
	contentDiv.appendChild(keyboard)
	
	def configKeyboardEvent(){
		keyboardArea.onkeypress = (event: KeyboardEvent) => { keyPressed(event.keyCode) }
	}
	
  def simulatorEvent() {
		if(s.isWaitingKeyPress())
			enableTextArea()
  }
	
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  
  def reset() {
  	text.textContent = ""
  	disableTextArea()
  }
  
  def disableTextArea() {
    if(keyboardArea.disabled == false){
	    keyboardArea.disabled = true
	    keyboardArea.classList.remove("alerts-border")
//    	println("Se ha deshabilitado el teclado")
    }
  }
  def enableTextArea() {
    if(keyboardArea.disabled == true){
	    keyboardArea.disabled = false
	    keyboardArea.classList.add("alerts-border")
//	    dom.window.alert("Presione una tecla en el teclado para continuar con la ejecución.")
//	    println("Se ha habilitado el teclado")
    }
  }
  
  def keyPressed(key: Int){
  	disableTextArea()
  	text.textContent += key.toChar
  	s.s.resumeExecution(key)
  }
  
  //def compilationEvent() {}

}
