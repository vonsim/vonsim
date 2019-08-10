package vonsim.simulator.i18n

import vonsim.simulator.InstructionInfo

object English{
  def code="en"
}
class English extends SimulatorLanguage{
  def code=English.code

  def memoryCellAsInstruction="Attempting to interpretate a random memory cell as an instruction. Check that your program contains all the HLT instructions necessary, and that there are instructions in address 2000h."
  def modifyingReadOnlyMemory(address:Int)=s"Memory address $address is marked as read-only. It is likely you are attempting to modify a memory cell where part of an instruction is stored."
  def invalidMemoryAddress(address:Int)=s"Memory address $address is invalid, that is, it is out of range."
  def instructionNotImplemented(instruction:String)=s"Instruction $instruction has not been implemented"
  
  def instructionErrorMessage(i:InstructionInfo)=s"Error executing instruction ${i.rawInstruction}."
  def reason="Reason"
}