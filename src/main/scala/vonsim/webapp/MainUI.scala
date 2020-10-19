package vonsim.webapp

import scalatags.JsDom.all._
import vonsim.utils.CollectionUtils._
//import org.scalajs.dom.html._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom.raw.KeyboardEvent
import org.scalajs.dom._
import org.scalajs.dom
import scala.scalajs.js
import js.JSConverters._
import scala.scalajs.js.timers._
import scala.collection.mutable

import scala.util.parsing.input.OffsetPosition
import vonsim.assembly.lexer.VonemuPosition

import vonsim.assembly.Compiler
import org.scalajs.dom.raw.HTMLElement

import vonsim.assembly.Compiler.FailedCompilation

import vonsim.simulator.Simulator
import vonsim.simulator.InstructionInfo
import vonsim.simulator.DWord
import vonsim.simulator.Word
import vonsim.simulator.Run
import vonsim.simulator.Debug
import vonsim.simulator.Stop
import vonsim.assembly.Compiler.CompilationResult
import vonsim.assembly.Compiler.SuccessfulCompilation

import vonsim.simulator.SimulatorProgramExecuting
import vonsim.assembly.Compiler.CompilationResult
import vonsim.assembly.Compiler.SuccessfulCompilation
import vonsim.assembly.Compiler.SuccessfulCompilation
import com.scalawarrior.scalajs.ace.IEditSession
import vonsim.assembly.CompilationError
import vonsim.simulator.InstructionInfo
import vonsim.assembly.Compiler.CompilationResult
import vonsim.webapp.tutorials.Tutorial
import vonsim.simulator.GeneralExecutionError
import vonsim.simulator.InstructionInfo

import scala.concurrent.Promise
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import vonsim.assembly.Compiler.FailedCompilation
import vonsim.simulator.EventTimer
import vonsim.simulator.SimulatorExecutionLoop
import vonsim.webapp.header.HeaderUI

object UIConfig {
  def apply(
    disableEditor:    Boolean = false,
    disableMainboard: Boolean = false,
    disableControls:  Boolean = false) = {
    new UIConfig(disableEditor, disableMainboard, disableControls)
  }
  def enableAll = new UIConfig(false, false, false)
  def disableAll = new UIConfig(true, true, true)
  def disableAllButMainboard = new UIConfig(true, false, true)
  def disableAllButEditor = new UIConfig(false, true, true)
  def disableAllButControls = new UIConfig(true, true, false)
}
class UIConfig(
  val disableEditor:    Boolean,
  val disableMainboard: Boolean,
  val disableControls:  Boolean) {}

class MainUI(
  s:           VonSimState,
  defaultCode: String,
  saveCodeKey: String,
  tutorial:    Option[Tutorial]) extends VonSimUI(s) {

  val devicesConfigKey = "config"
  println("Setting up UI..")
  val editorUI = new EditorUI(s, defaultCode, () => {
    saveCode()
    compile()
  })

  val $ = js.Dynamic.global.$
  val mainboardUI = new MainboardUI(s)

  val headerUI = new HeaderUI(s)
  //  print(headerUI.configButtons.length)
  headerUI.controlsUI.deviceConfigurationUI.root.onclick = (e: Any) => {
    val dc = s.s.devController
    val index = dc.configs.indexOf(dc.config)
    val newIndex = (index + 1) % dc.configs.length
    val newConfig = dc.configs(newIndex)

    s.s.devController.setConfig(newConfig)
    mainboardUI.changeDisplayConfiguration(newConfig)
    simulatorEvent()
    setConfigValue(devicesConfigKey, newIndex)

  }

  val tutorialUI = tutorial.map(t => new TutorialUI(s, t, this))
  println("checking mode:..")
  val leftPanelId = "leftWrap"
  val leftPanel = tutorialUI match {
    case None => div(id := leftPanelId, editorUI.root)
    case Some(t) => {
      if (t.tutorial.fullscreen) {
        println("fullscreen mode")
        div(id := leftPanelId, editorUI.root)

      } else {
        div(id := leftPanelId, t.root, editorUI.root)
      }
    }
  }

  val sim = div(id := "main", leftPanel, mainboardUI.root).render

  val root = div(id := "pagewrap", headerUI.root, sim).render

  tutorialUI match {
    case Some(t) => {
      if (t.tutorial.fullscreen) {
        println("fullscreen mode")
        val tutorialDiv = div(cls := "fullscreenDiv", t.root).render
        t.root.classList.add("fullscreenTutorial")
        root.appendChild(tutorialDiv)
      }
    }
    case None =>
  }
  
  mainboardUI.keyboardUI.keyboardArea.onkeypress = (event: KeyboardEvent) => {
    val code = event.keyCode
    s.s.inputChar(code)
    mainboardUI.keyboardUI.keyPressed(code)
    simulatorEvent()
    s.s.runState match {
      case Run   => runInstructionsTimed()
      case Debug => headerUI.controlsUI.updateUI()
    }
  }
  
  bindkey(root, s.uil.controlsQuickHotkey, () => {
    if (s.canLoadOrQuickRun()) {
      s.s.runState = Run
      quickRun()
    }
    false
  })

  bindkey(root, s.uil.controlsDebugOrAbortHotkey, () => {
    if (s.canLoadOrQuickRun()) {
      s.s.runState = Debug
      loadProgram()
    } else if (s.isSimulatorExecuting()) {
      s.s.runState = Stop
      stop()
    }
    false
  })

  bindkey(root, s.uil.controlsFinishHotkey, () => {
    if (s.isSimulatorExecuting()) {
      if (s.s.runState == Debug)
        finishInstructions()
      else {
        s.s.runState = Run
        quickRun()
      }
    }
    false
  })

  bindkey(root, s.uil.controlsStepHotkey, () => {
    if (s.isSimulatorExecuting()) {
      stepInstruction()
    }
    false
  })

  bindkey(root, "ctrl+s", () => {
    false
  })

  headerUI.controlsUI.quickButton.onclick = (e: Any) => {
    s.s.runState = Run
    quickRun()
  }

  headerUI.controlsUI.loadOrStopButton.loadButton.onclick = (e: Any) => {
    s.s.runState = Debug
    loadProgram()
  }

  headerUI.controlsUI.loadOrStopButton.stopButton.onclick = (e: Any) => {
    s.s.runState = Stop
    stop()
  }

  headerUI.dropdownUI.languageUI.languageButtons.foreach(b => {
    b.onclick = (e: Any) => {
      val language = b.getAttribute("lang")
      dom.window.localStorage.setItem(Main.cookieLanguageKey, language)
      dom.window.location.reload(false)
    }
  })

  headerUI.controlsUI.finishButton.onclick = (e: Any) => {
    runInstructionsTimed()
  }

  headerUI.controlsUI.stepButton.onclick = (e: Any) => { stepInstruction() }

  mainboardUI.keysUI.confKeys(mainboardUI.pioUI.simulatorEvent)

  

  println("UI set up. Updating for the first time..")
  simulatorEvent()
  compilationEvent()

  tutorialUI.foreach(f => f.startTutorial)

  def compilationEvent() {
    headerUI.compilationEvent()
    editorUI.compilationEvent()
  }

  def simulatorEvent() {
    headerUI.simulatorEvent()
    editorUI.simulatorEvent()
    mainboardUI.simulatorEvent()
  }

  def simulatorEvent(i: InstructionInfo) {
    headerUI.simulatorEvent(i)
    editorUI.simulatorEvent(i)
    mainboardUI.simulatorEvent(i)
  }

  def compile() {
    val codeString = editorUI.getCode()
//    println("MainUI:Code String:" + codeString)
    s.c = Compiler(codeString)
    compilationEvent()
  }

  def reset() {
    println("Resetting	... ")
    s.s.reset()
    mainboardUI.reset()
    simulatorEvent()
  }

  def stop() {
    println("Stopping execution... ")
    s.s.stop()
    mainboardUI.reset()
    simulatorEvent()
  }

  def delay(milliseconds: Int): Future[Unit] = {
    val p = Promise[Unit]()
    js.timers.setTimeout(milliseconds) {
      p.success(())
    }
    p.future
  }

  var cant = 0 // Cantidad de instrucciones realizadas
  var timeElapsed: Long = 0
  var startTime: Long = 0

  def getTickTime() = s.systemEventTimer.getTickTime()

  def executeInstructionsTimed() {
    val now = System.currentTimeMillis()
    if (!s.isWaitingKeyPress()) {
      timeElapsed = now - startTime
      if ((timeElapsed * getTickTime() / 1000) >= cant) {
        cant = cant + 1
        var i = s.s.stepInstruction(now)
        i match {
          case Left(error) => {
            simulatorEvent()
          }
          case Right(i) => {
            simulatorEvent(i)
            if (s.isWaitingKeyPress())
              $("#external-devices-tab a").tab("show")
          }
        }
      }
    } else {
      cant = 0
      startTime = System.currentTimeMillis()
    }
    checkTime()
  }

  def checkTime() {
    var readyLater = for {
      delayed <- delay(25)
    } yield {
      if (s.isSimulatorExecuting()) {
        if (s.systemEventTimer.update(System.currentTimeMillis()))
          executeInstructionsTimed()
        else
          checkTime()
      }
    }
  }

  def runInstructionsTimed() {
    println("Running with time control...")

    editorUI.disableTextArea()
    headerUI.disable()
    headerUI.controlsUI.disableControlsQuickRun()

    cant = 0
    timeElapsed = 0
    startTime = System.currentTimeMillis()

    executeInstructionsTimed()
  }

  def finishInstructions() {
    println("Finishing... ")

    editorUI.disableTextArea()
    headerUI.disable()
    headerUI.controlsUI.disableControlsQuickRun()

    var cant = 0
    var inst = 0
    while (s.isSimulatorExecuting() && !s.isWaitingKeyPress() && (cant < 1000)) {
      cant += 1
      val i = s.s.stepInstruction(inst * s.systemEventTimer.tickTime)
      i match {
        case Left(error) => {
          mainboardUI.displayNewToast(error.message)
        }
        case Right(i) => {
          inst += 1
          simulatorEvent(i)
          if (s.isWaitingKeyPress())
            $("#external-devices-tab a").tab("show")
        }
      }
    }

    if (cant == 5000) {
      s.s.pauseExecution("Loop")
      mainboardUI.displayNewToast(s.uil.stateToTooltip(SimulatorExecutionLoop))
      simulatorEvent()
    }
  }

  var inst = 0
  def stepInstruction() {
    println("Step instruction.. ")
    val i = s.s.stepInstruction(inst * s.systemEventTimer.tickTime)
    i match {
      case Left(error) => {
        mainboardUI.displayNewToast(error.message)
      }
      case Right(i) => {
        inst += 1
        simulatorEvent(i)
        if (s.isWaitingKeyPress())
          $("#external-devices-tab a").tab("show")
      }
    }

  }

  def quickRun() {
    s.c match {
      case Right(c: SuccessfulCompilation) => {
        loadProgram()
        runInstructionsTimed()
      }
      case _ => dom.window.alert(s.uil.alertCompilationFailed)
    }
  }

  def loadProgram() {
    s.c match {
      case Right(c: SuccessfulCompilation) => {
        println("Loading program... ")
        s.s.load(c)
        mainboardUI.reset()
        simulatorEvent()
      }
      case _ => dom.window.alert(s.uil.alertCompilationFailed)
    }

  }

  def saveCode() {
    dom.window.localStorage.setItem(saveCodeKey, editorUI.getCode())
  }

  def applyUIConfig(uiConfig: UIConfig) {
    headerUI.setDisabled(uiConfig.disableControls)
    editorUI.setDisabled(uiConfig.disableEditor)
    mainboardUI.setDisabled(uiConfig.disableMainboard)
  }

}
