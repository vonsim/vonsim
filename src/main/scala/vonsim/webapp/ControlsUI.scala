package vonsim.webapp

import vonsim.simulator.Simulator

import scalajs.js
import org.scalajs.dom.html._
import scalatags.JsDom.all._
import vonsim.simulator._
import vonsim.assembly.Compiler.CompilationResult
import vonsim.assembly.Compiler.FailedCompilation




class SimulatorStateUI(s: VonSimState) extends VonSimUI(s) {
  def stateToIcon(state:SimulatorState)= state match{
    case SimulatorExecutionError(msg) => "exclamation-circle"
    case SimulatorExecutionFinished => "check-circle"
    case SimulatorExecutionStopped => "circle"
    case SimulatorProgramExecuting => "pause-circle"      
  }
  def stateToButtonClass(state:SimulatorState)= state match{
    case SimulatorExecutionError(msg) => "btn-danger"
    case SimulatorExecutionFinished => "btn-success"
    case SimulatorExecutionStopped => "btn-danger"
    case SimulatorProgramExecuting => "btn-warning"      
  }
  
  
  val stateIcon=i(cls:="").render
  val stateTitle=span().render
  val root=a(cls:=""
//      ,href:="#"
//      ,rel:="tooltip"
//      ,data("html"):="true"
//      ,data("toggle"):="tooltip"
//      ,title:="<div> <h1> HOLAHOLA </h1> <p> Chau </p> </div>"
      ,stateIcon
      ,stateTitle
      ).render
      
      
  simulatorEvent()
  
  
  def simulatorEvent() {
    val color=stateToButtonClass(s.s.state)
    root.className="btn "+color+" simulatorState"
    root.title=s.uil.stateToTooltip(s.s.state)
    stateTitle.textContent=s.uil.stateToMessage(s.s.state)
    stateIcon.className="fa fa-"+stateToIcon(s.s.state)
    
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
    
  }
  def compilationEvent(){
    
    
  }
      
      
}
class ControlsUI(s: VonSimState) extends VonSimUI(s) {
    //http://fontawesome.io/icons/
    class LoadOrStopButton(s:VonSimState) extends VonSimUI(s){
      val hiddenClass="hidden"
      val loadButton = buttonFactory(s.uil.controlsDebugButton,s.uil.controlsDebugTooltip,"fa-bug")
      val stopButton = buttonFactory(s.uil.controlsStopButton,s.uil.controlsStopTooltip, "fa-stop")
      stateLoad()
      val root=span(
          loadButton,
          stopButton  
          ).render
          
      def stateLoad(){
        stopButton.classList.add(hiddenClass)
        loadButton.classList.remove(hiddenClass)
      }
      def stateStop(){
        loadButton.classList.add(hiddenClass)
        stopButton.classList.remove(hiddenClass)  
      }
      def disableControls(){
        loadButton.classList.add("disabled")
        stopButton.classList.add("disabled")
      }
      def enableControls(){
        loadButton.classList.remove("disabled")
        stopButton.classList.remove("disabled")
      }

      def simulatorEvent(){
        updateUI()
      }
      def simulatorEvent(i:InstructionInfo){
         simulatorEvent() 
      }
      
      def compilationEvent(){
        updateUI()
      }
      
      
      
      
      
    }
  
    def buttonFactory(s:String,t:String,iconClass:String)={
         a(cls:="controlButton btn btn-primary"
//        ,img(cls:="",src := imageUrl, alt := s)
        ,i(cls:=s"fa $iconClass")     
        ,s
        ,title := t
        ).render
    }

  val quickButton = buttonFactory(s.uil.controlsQuickButton,s.uil.controlsQuickTooltip,"fa-play-circle")
  val loadOrStopButton= new LoadOrStopButton(s)
  val stepButton   = buttonFactory(s.uil.controlsStepButton,s.uil.controlsStepTooltip, "fa-step-forward")
  val finishButton  = buttonFactory(s.uil.controlsFinishButton,s.uil.controlsFinishTooltip, "fa-play")
  val simulatorStateUI= new SimulatorStateUI(s)
          
 


  val root = span(id := "controls"
      ,span(cls := "controlSectionStart")
      ,span(cls := "controlSection", quickButton)
      ,span(cls := "controlSectionSeparator")
      ,span(cls := "controlSection", loadOrStopButton.root)
      ,span(cls := "controlSection",finishButton)
     ,span(cls := "controlSection",stepButton)
     ,span(cls := "controlSection",simulatorStateUI.root)
      ).render

  def disableButton(bootstrapButton:Anchor){
    bootstrapButton.classList.add("disabled")
  }
  def enableButton(bootstrapButton:Anchor){
    bootstrapButton.classList.remove("disabled")
  }
  def setEnabled(bootstrapButton:Anchor,state:Boolean){
    if (state){
      enableButton(bootstrapButton)
    }else{
      disableButton(bootstrapButton)
    }
      
  }
  def disableControls(){
    setEnabled(quickButton,false)
    setEnabled(finishButton,false)
    setEnabled(stepButton,false)
    loadOrStopButton.disableControls()
  }
  
  def updateUI(){  
    
    setEnabled(quickButton,s.canLoadOrQuickRun())
    setEnabled(finishButton,s.isSimulatorExecuting())
    setEnabled(stepButton,s.isSimulatorExecuting())
    
    
    if (s.canLoadOrQuickRun()){
      loadOrStopButton.stateLoad()
      loadOrStopButton.enableControls()
    }else if (s.isSimulatorExecuting() ){
      loadOrStopButton.stateStop()
      loadOrStopButton.enableControls()
    }else{
      loadOrStopButton.stateLoad()
      loadOrStopButton.disableControls()
    }
    
    
  }
  
  
  def simulatorEvent() {
    updateUI()
    simulatorStateUI.simulatorEvent()
  }
  def simulatorEvent(i:InstructionInfo) {
    simulatorEvent()
    simulatorStateUI.simulatorEvent(i)
  }
  def compilationEvent(){
    updateUI()
    simulatorStateUI.compilationEvent()
  }
}
