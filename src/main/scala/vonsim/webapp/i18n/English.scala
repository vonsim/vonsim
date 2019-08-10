package vonsim.webapp.i18n

import vonsim.simulator._
object English{
  def code ="en"
}
class English extends UILanguage {
  def code =English.code
  def and="and"
  def iconTitle="VonSim: A simplified 8088 simulator"
  def pageTitle="A simplified 8088 simulator"
  def pageTitleExtended="A simplified intel 8088 simulator in the spirit of MSX88"
  
  def alertURLNotFound(url:String)="Could not load URL "+url
  
  def helpGithubPage="Github page"
  def helpReportIssue="Report issue"
  def helpIntendedFor="This simulator is intended for use in the Universidad Nacional de La Plata classes:"
  def helpMadeBy="Made by"
  def helpWithHelpFrom="with help from"
  def helpFeedbackWelcome="Feedback is welcome at"
  
  
  def controlsDebugButton="Debug"
  def controlsDebugTooltip="F2: Load program into memory without starting execution."
  def controlsStopButton="Abort"
  def controlsStopTooltip= "F3: Abort execution and leave debug mode."
  
  def controlsQuickButton="Quick Run"
  def controlsQuickTooltip="F1: Reset simulator, load program into memory, run until cpu stops."
  def controlsStepButton="Step"
  def controlsStepTooltip="F6: Execute a single instruction."
  def controlsFinishButton="Finish"
  def controlsFinishTooltip= "F5: Run program until cpu stops."
  
  def stateToMessage(state:SimulatorState)= state match{
    case SimulatorExecutionError(msg) => "Execution Error"
    case SimulatorExecutionFinished => "Execution Finished"
    case SimulatorExecutionStopped => "No Program Loaded"
    case SimulatorProgramExecuting => "Program executing"      
  }
  def stateToTooltip(state:SimulatorState)= state match{
    case SimulatorExecutionError(error) => error.message
    case SimulatorExecutionFinished => "The execution has finished or has been stopped. Reload the program to execute again or perform a Quick Run."
    case SimulatorExecutionStopped => "There is no program loaded in the simulator; you must load one before executing, or perform a Quick Run"
    case SimulatorProgramExecuting => "The program is executing. You can execute instructions one at a time with Step or until the program finishes with Run. While the program is running you cannot modify the code in the editor"      
  }
  
  def cpuFlagDescription(f:Flag,v:String) = s"Flag $f has value $v"
  def flags="Flags"
  def aluTitle="ALU"
  def cpuTitle="CPU"
  def cpuSpecialRegisters="Special Registers"
  def cpuGeneralPurposeRegisters="General Purpose Registers"
  def memoryTitle="Memory"
  def addressSearch="Find memory address"
  
  def alertCompilationFailed="Compilation failed, can't load/run program"
  
  def describeInstruction(i:Instruction)="Valid instruction."
  def describeMemoryCell(address:Int,value:Word)=s"""Memory cell with address ${formatAddress(address)}h and value:
Hexadecimal: ${formatWord(value)}h
Binary: ${value.bitString.reverse}
CA2: ${value.toInt}
BSS: ${value.toUnsignedInt}
"""
}