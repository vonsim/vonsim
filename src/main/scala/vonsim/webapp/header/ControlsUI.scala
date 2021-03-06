package vonsim.webapp.header

import scalajs.js
import org.scalajs.dom.html._
import scalatags.JsDom.all._
import vonsim.simulator._
import scala.scalajs.js.annotation.JSGlobal
import vonsim.webapp.VonSimState
import vonsim.webapp.VonSimUI

class SimulatorStateUI(s: VonSimState) extends VonSimUI(s) {
  def stateToIcon(state: SimulatorState) = state match {
    case SimulatorExecutionError(msg) => "exclamation-circle"
    case SimulatorExecutionFinished   => "check-circle"
    case SimulatorExecutionStopped    => "circle"
    case SimulatorProgramExecuting    => "pause-circle"
    case SimulatorWaitingKeyPress     => "pause-circle"
    case SimulatorExecutionLoop       => "exclamation-circle"
  }
  def stateToButtonClass(state: SimulatorState) = state match {
    case SimulatorExecutionError(msg) => "btn-danger"
    case SimulatorExecutionFinished   => "btn-success"
    case SimulatorExecutionStopped    => "btn-danger"
    case SimulatorProgramExecuting    => "btn-warning"
    case SimulatorWaitingKeyPress     => "btn-warning"
    case SimulatorExecutionLoop       => "btn-danger"
  }

  val stateIcon = i(cls := "").render
  val stateTitle = span().render
  val root = a(
    cls := ""
//      ,href:="#"
//      ,rel:="tooltip"
//      ,data("html"):="true"
//      ,data("toggle"):="tooltip"
//      ,title:="<div> <h1> HOLAHOLA </h1> <p> Chau </p> </div>"
    ,
    stateIcon,
    stateTitle
  ).render

  simulatorEvent()

  def simulatorEvent() {
    val color = stateToButtonClass(s.s.state)
//    root.className = "btn " + color + " simulatorState"
    root.className = "btn " + color + " navbar-btn simulatorState"
    root.title = s.uil.stateToTooltip(s.s.state)
    stateTitle.textContent = s.uil.stateToMessage(s.s.state)
    stateIcon.className = "fa fa-" + stateToIcon(s.s.state)

  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()

  }
  def compilationEvent() {}

}

class DeviceConfigurationUI(s: VonSimState) extends VonSimUI(s) {
  
  val stateIcon = i(cls := "").render
  val stateTitle = span(style:="padding-left:5px;").render
  val root = a(
    cls := ""
//      ,href:="#"
//      ,rel:="tooltip"
//      ,data("html"):="true"
//      ,data("toggle"):="tooltip"
//      ,title:="<div> <h1> HOLAHOLA </h1> <p> Chau </p> </div>"
    ,
    stateIcon,
    stateTitle
  ).render

  simulatorEvent()

  def simulatorEvent() {
//    root.className = "btn " + color + " simulatorState"
    root.className = "btn " + "btn-info" + " navbar-btn  simulatorState"
    root.title = " "+s.uil.deviceConfigurationToTooltip(s.s.devController)
    stateTitle.textContent = s.uil.deviceConfigurationToMessage(s.s.devController)
    stateIcon.className = "fas fa-exchange-alt"
    
    if (s.isSimulatorExecuting()) {
      root.classList.add("disabled")
    }else{
      root.classList.remove("disabled")
    }

  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }

  def compilationEvent() {}
  
   
}


class ConfigurationStateUI(s: VonSimState) extends VonSimUI(s) {
  def stateToIcon(state: SimulatorState) = state match {
    case SimulatorExecutionError(msg) => "exclamation-circle"
    case SimulatorExecutionFinished   => "check-circle"
    case SimulatorExecutionStopped    => "circle"
    case SimulatorProgramExecuting    => "pause-circle"
  }
  def stateToButtonClass(state: SimulatorState) = state match {
    case SimulatorExecutionError(msg) => "btn-danger"
    case SimulatorExecutionFinished   => "btn-success"
    case SimulatorExecutionStopped    => "btn-danger"
    case SimulatorProgramExecuting    => "btn-warning"
  }

  val stateIcon = i(cls := "").render
  val stateTitle = span().render
  val root = a(
    cls := ""
//      ,href:="#"
//      ,rel:="tooltip"
//      ,data("html"):="true"
//      ,data("toggle"):="tooltip"
//      ,title:="<div> <h1> HOLAHOLA </h1> <p> Chau </p> </div>"
    ,
    stateIcon,
    stateTitle
  ).render

  simulatorEvent()

  def simulatorEvent() {
    val color = stateToButtonClass(s.s.state)
//    root.className = "btn " + color + " simulatorState"
    root.className = "btn " + color + " navbar-btn simulatorState"
    root.title = s.uil.stateToTooltip(s.s.state)
    stateTitle.textContent = s.uil.stateToMessage(s.s.state)
    stateIcon.className = "fa fa-" + stateToIcon(s.s.state)

  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()

  }
  def compilationEvent() {}

}
class ControlsUI(s: VonSimState) extends VonSimUI(s) {
  //http://fontawesome.io/icons/
  class LoadOrStopButton(s: VonSimState) extends VonSimUI(s) {
    val hiddenClass = "hidden"
    val loadButton = buttonFactory(
      s.uil.controlsDebugButton,
      s.uil.controlsDebugTooltip,
      "fa-bug"
    )
    val stopButton = buttonFactory(
      s.uil.controlsStopButton,
      s.uil.controlsStopTooltip,
      "fa-stop"
    )
    stateLoad()
    val root = span(
      loadButton,
      stopButton
    ).render

    def stateLoad() {
      stopButton.classList.add(hiddenClass)
      loadButton.classList.remove(hiddenClass)
    }
    def stateStop() {
      loadButton.classList.add(hiddenClass)
      stopButton.classList.remove(hiddenClass)
    }
    def disableControls() {
      loadButton.classList.add("disabled")
      stopButton.classList.add("disabled")
    }
    def enableControls() {
      loadButton.classList.remove("disabled")
      stopButton.classList.remove("disabled")
    }

    def simulatorEvent() {
      updateUI()
    }
    def simulatorEvent(i: InstructionInfo) {
      simulatorEvent()
    }

    def compilationEvent() {
      updateUI()
    }

  }

  def buttonFactory(s: String, t: String, iconClass: String) = {
    val button = a(
//      cls := "controlButton btn btn-primary"
      cls := "controlButton btn btn-primary navbar-btn"
//        ,img(cls:="",src := imageUrl, alt := s)
      ,
      i(cls := s"fa $iconClass"),
      s,
      title := t
    ).render
    if(s == "Ejecución Rápida")
    	button.className += " quickButton"
    button
  }

  val quickButton = buttonFactory(
    s.uil.controlsQuickButton,
    s.uil.controlsQuickTooltip,
    "fa-play-circle"
  )
  val loadOrStopButton = new LoadOrStopButton(s)
  val stepButton = buttonFactory(
    s.uil.controlsStepButton,
    s.uil.controlsStepTooltip,
    "fa-step-forward"
  )
  val finishButton = buttonFactory(
    s.uil.controlsFinishButton,
    s.uil.controlsFinishTooltip,
    "fa-play"
  )
  val simulatorStateUI = new SimulatorStateUI(s)
  val configurationStateUI = new ConfigurationStateUI(s)
  val deviceConfigurationUI = new DeviceConfigurationUI(s)
  
  val root = span(
    id := "controls",
    span(cls := "controlSectionStart"),
    span(cls := "controlSection", quickButton),
    span(cls := "controlSectionSeparator"),
    span(cls := "controlSection", loadOrStopButton.root),
    span(cls := "controlSection", finishButton),
    span(cls := "controlSection", stepButton),
    span(cls := "controlSection", simulatorStateUI.root),
    span(cls := "controlSection", configurationStateUI.root),
    span(cls := "controlSection", deviceConfigurationUI.root)
  ).render

  def disableButton(bootstrapButton: Anchor) {
    bootstrapButton.classList.add("disabled")
  }
  def enableButton(bootstrapButton: Anchor) {
    bootstrapButton.classList.remove("disabled")
  }
  def setEnabled(bootstrapButton: Anchor, state: Boolean) {
    if (state) {
      enableButton(bootstrapButton)
    } else {
      disableButton(bootstrapButton)
    }

  }
  
  def disableControlsQuickRun() {
    setEnabled(quickButton, false)
    setEnabled(finishButton, false)
    setEnabled(stepButton, false)
    loadOrStopButton.enableControls()
  }
  
  def disableControls() {
    setEnabled(quickButton, false)
    setEnabled(finishButton, false)
    setEnabled(stepButton, false)
    loadOrStopButton.disableControls()
  }

  def updateUI() {

    setEnabled(quickButton, s.canLoadOrQuickRun())
//    setEnabled(finishButton, s.isSimulatorExecuting())
//    setEnabled(stepButton, s.isSimulatorExecuting())
    setEnabled(finishButton, ((s.isSimulatorExecuting()) && (!s.isWaitingKeyPress())))
    setEnabled(stepButton, ((s.isSimulatorExecuting()) && (!s.isWaitingKeyPress())))

    if (s.canLoadOrQuickRun()) {
      loadOrStopButton.stateLoad()
      loadOrStopButton.enableControls()
    } else if (s.isSimulatorExecuting()) {
      loadOrStopButton.stateStop()
      loadOrStopButton.enableControls()
    } else {
      loadOrStopButton.stateLoad()
      loadOrStopButton.disableControls()
    }

  }

  def simulatorEvent() {
    updateUI()
    simulatorStateUI.simulatorEvent()
    deviceConfigurationUI.simulatorEvent()
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
    simulatorStateUI.simulatorEvent(i)
    deviceConfigurationUI.simulatorEvent(i)
  }
  def compilationEvent() {
    updateUI()
    simulatorStateUI.compilationEvent()
    deviceConfigurationUI.compilationEvent()
    
  }
}
