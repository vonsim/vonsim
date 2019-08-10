package vonsim.simulator.i18n

import vonsim.simulator.InstructionInfo

object Spanish{
  def code="es"
}
class Spanish extends SimulatorLanguage{
  def code=Spanish.code
  def memoryCellAsInstruction="Al ejecutar el programa, se quiso interpretar una celda de memoria que no ha sido marcada como ejecutable. Verifique que su programa contiene las instrucciones HLT necesarias, y que haya instrucciones en la dirección 2000h."
  def modifyingReadOnlyMemory(address:Int)=s"La dirección de memoria $address está marcada cómo de sólo lectura. Es probable que estés intentando modificar una celda de memoria donde se almacena una instrucción."
  def invalidMemoryAddress(address:Int)=s"La dirección de memoria $address es inválida, es decir, está fuera del rango permitido."
  def instructionNotImplemented(instruction:String)=s"La instrucción $instruction no ha sido implementada"
  
  def instructionErrorMessage(i:InstructionInfo)=s"Error ejecutando instrucción ${i.rawInstruction}."
  def reason="Razón"
  
}