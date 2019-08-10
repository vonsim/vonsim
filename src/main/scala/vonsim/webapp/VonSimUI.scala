package vonsim.webapp
import org.scalajs.dom.raw.HTMLElement

import vonsim.simulator.Simulator
import vonsim.simulator.InstructionInfo
import vonsim.simulator.DWord
import vonsim.simulator.Word
import vonsim.assembly.Compiler.CompilationResult

import org.scalajs.dom
import vonsim.simulator.SimulatorStoppedState
import vonsim.simulator.SimulatorExecutionFinished
import vonsim.simulator.SimulatorExecutionStopped
import vonsim.simulator.SimulatorExecutionError
import vonsim.webapp.i18n.UILanguage
import vonsim.webapp.i18n.English
import vonsim.webapp.i18n.UILanguage

abstract class HTMLUI {
  def root: HTMLElement
  
  def bindkey(element:HTMLElement,key:String,f:Function0[Boolean]){
      
      Mousetrap.bindGlobal(key, f, "keydown")
    
//    element.onkeydown = (e: dom.KeyboardEvent) => {
//      //println("Pressed " + e.keyCode + " " + e.ctrlKey)
//      e.key
//      //    var keyCode = e.keyCode;
//      //    if ((e.ctrlKey || e.metaKey) && e.keyCode == 83) {
//      if (!(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)) {
//        if (e.key == key) {
//          e.stopPropagation()
//          e.preventDefault()
//          f.apply()
//        }
//      }
//
//    }
   
  }
  
}

class VonSimState(var s:Simulator, var c:CompilationResult,var uil:UILanguage){
  
  
  def simulatorStopped()={
    s.state==SimulatorExecutionFinished || s.state==SimulatorExecutionStopped || s.state.isInstanceOf[SimulatorExecutionError]
  }
  def canLoadOrQuickRun()={
    simulatorStopped() && this.c.isRight
  }
  def isSimulatorExecuting()={
    !simulatorStopped()
  }
  
}

abstract class VonSimUI(val s: VonSimState) extends HTMLUI{

  def simulatorEvent() // update changes made to the simulator
  def simulatorEvent(i:InstructionInfo) // update UI after execution of instruction
  def compilationEvent()
  
  def disable(){
    root.classList.add("disabledElement")
  }
  def enable(){
    
    root.classList.remove("disabledElement")
  }
  def setDisabled(disabled:Boolean){
    if (disabled){
      disable
    }else{
      enable
    }
  }

  
  
  def formatIOAddress(a:Int)={
    s.uil.formatIOAddress(a)
    "%02X".format(a)
  }
  def formatAddress(a:Int)={
    "%04X".format(a)
  }
  def formatWord(a:Word)={
    "%02X".format(a.toUnsignedInt)
  }
  def formatDWord(a:DWord)={
    "%04X".format(a.toUnsignedInt)
  }
}






