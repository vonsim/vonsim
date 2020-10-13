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
import vonsim.simulator.SimulatorWaitingKeyPress
import vonsim.simulator.Debug
import vonsim.simulator.EventTimer
import vonsim.simulator.SimulatorExecutionLoop
import org.scalajs.dom


abstract class HTMLUI {
  def root: HTMLElement
  
  def getStorageKey(k:String) = s"${this.getClass().getName()}_$k"
  
  def setConfigValue(k:String,v:String){
    dom.window.localStorage.setItem(getStorageKey(k), v)
  }
  
  def setConfigValue(k:String,v:Int){
   setConfigValue(k, v.toString())
  }
  def setConfigValue(k:String,v:Boolean){
    setConfigValue(k, v.toString())
  }
    
  def getConfigValue(k:String) = {
    val v = dom.window.localStorage.getItem(getStorageKey(k))
//    println(s"$k -> $v (VonSimUi)")
    Option(v)
  }
  
  def getConfigValueInt(k:String)= this.getConfigValue(k).map(_.toInt)
  
  def getConfigValueBool(k:String)= this.getConfigValue(k).map(_.toBoolean)
  
  
  def bindkey(element: HTMLElement, key: String, f: Function0[Boolean]) {

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

class VonSimState(
  var s: Simulator,
  var c: CompilationResult,
  var uil: UILanguage //move to HTMLUI
) {
   
  val defaultCPUSpeed = 125
  val systemEventTimer = new EventTimer(defaultCPUSpeed)

  def simulatorStopped() = {
    s.state == SimulatorExecutionFinished || s.state == SimulatorExecutionStopped || 
    s.state.isInstanceOf[SimulatorExecutionError] || s.state == SimulatorExecutionLoop
  }
  def canLoadOrQuickRun() = {
    simulatorStopped() && this.c.isRight
  }
  def isSimulatorExecuting() = {
    !simulatorStopped()
  }
  
  def isWaitingKeyPress() = {
  	s.state == SimulatorWaitingKeyPress
  }
  
  def isDebugging() = {
  	s.runState == Debug
  }

}

abstract class VonSimUI(val s: VonSimState) extends HTMLUI {

  def simulatorEvent() // update changes made to the simulator
  def simulatorEvent(i: InstructionInfo) // update UI after execution of instruction
  def compilationEvent()
  
  def disable() {
    root.classList.add("disabledElement")
  }
  def enable() {
    root.classList.remove("disabledElement")
  }
  def setDisabled(disabled: Boolean) {
    if (disabled) {
      disable
    } else {
      enable
    }
  }

  def formatIOAddress(a: Int) = {
    s.uil.formatIOAddress(a)
    "%02X".format(a)
  }
  def formatAddress(a: Int) = {
    "%04X".format(a)
  }
  def formatWord(a: Word) = {
    "%02X".format(a.toUnsignedInt)
  }
  def formatDWord(a: DWord) = {
    "%04X".format(a.toUnsignedInt)
  }
}
