package vonsim.simulator.i18n

import vonsim.simulator.Instruction
import vonsim.simulator.InstructionInfo

object SimulatorLanguage{
  val codes=Map(Spanish.code -> new Spanish()
               ,English.code -> new English()
               )
}
abstract class SimulatorLanguage {
  def code:String
  def memoryCellAsInstruction:String
  def modifyingReadOnlyMemory(address:Int):String
  def invalidMemoryAddress(address:Int):String
  def instructionNotImplemented(instruction:String):String
  def instructionErrorMessage(i:InstructionInfo):String
  def reason:String
  
  
}
