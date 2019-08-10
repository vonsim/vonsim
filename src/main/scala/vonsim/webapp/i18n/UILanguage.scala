package vonsim.webapp.i18n
import vonsim.simulator._

object UILanguage{
  val codes=Map(Spanish.code -> new Spanish()
               ,English.code -> new English())
}
abstract class UILanguage {
  
  def code:String
  
  
  def appName="VonSim"
  def pageTitle:String
  def pageTitleExtended:String
  
  
  def and:String
  def iconTitle:String
  
  
  def helpGithubPage:String
  def helpReportIssue:String
  def helpIntendedFor:String
  def helpMadeBy:String
  def helpWithHelpFrom:String
  def helpFeedbackWelcome:String
  
  
  def controlsQuickHotkey="ctrl+1"
  def controlsDebugOrAbortHotkey="ctrl+2"
  def controlsFinishHotkey="ctrl+3"
  def controlsStepHotkey="ctrl+4"
  
  def controlsDebugButton:String
  def controlsDebugTooltip:String
  def controlsStopButton:String
  def controlsStopTooltip:String
  
  def controlsQuickButton:String
  def controlsQuickTooltip:String
  def controlsStepButton:String
  def controlsStepTooltip:String
  def controlsFinishButton:String
  def controlsFinishTooltip:String
  
  def stateToMessage(state:SimulatorState):String      
  def stateToTooltip(state:SimulatorState):String      
  
  def cpuFlagDescription(f:Flag,v:String):String
  def flags:String
  def aluTitle:String
  def cpuTitle:String
  def cpuSpecialRegisters:String
  def cpuGeneralPurposeRegisters:String
  def memoryTitle:String
  def addressSearch:String 
  
  def alertCompilationFailed:String
  
  def describeInstruction(i:Instruction):String
  def describeMemoryCell(address:Int,value:Word):String
  def alertURLNotFound(url:String):String
  
  
  def formatIOAddress(a:Int)={
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