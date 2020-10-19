package vonsim.simulator.i18n

import vonsim.simulator.Instruction
import vonsim.simulator.InstructionInfo


import vonsim.simulator.MemoryError
import vonsim.simulator.InvalidMemoryAddress
import vonsim.simulator.MemoryAccessViolation


object SimulatorLanguage {
  val codes = Map(Spanish.code -> new Spanish(), English.code -> new English())
}
abstract class SimulatorLanguage {
  
  def hex(v:Int){
    
  }
  def code: String
  def memoryCellAsInstruction(address:Int): String
  def modifyingReadOnlyMemory(address: Int): String
  def invalidMemoryAddress(address: Int): String
  def instructionNotImplemented(instruction: String): String
  def instructionErrorMessage(i: InstructionInfo): String
  def reason: String
  def memoryError(e:MemoryError)= {
    e match {
      case e:InvalidMemoryAddress => invalidMemoryAddress(e.address)
      case e:MemoryAccessViolation => memoryCellAsInstruction(e.address)
    }
  }

}
