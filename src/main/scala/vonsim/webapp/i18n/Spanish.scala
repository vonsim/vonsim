package vonsim.webapp.i18n

import vonsim.simulator._
object Spanish{
  def code="es"
}
class Spanish extends UILanguage {
  def code =Spanish.code
  def and="y"
  def iconTitle=appName+": "+pageTitle
  def pageTitle="Un simulador de la arquitectura 8088"
  def pageTitleExtended="Un simulador simplificado de la arquitectura 8088, similar al MSX88"
  
  def alertURLNotFound(url:String)="No se pudo cargar la URL "+url
  
  def helpGithubPage="Github"
  def helpReportIssue="Reportar error"
  def helpIntendedFor="Este simulador fue diseñado para su uso en las siguientes asignaturas de la Universidad Nacional de La Plata:"
  def helpMadeBy="Hecho por"
  def helpWithHelpFrom="con ayuda de"
  def helpFeedbackWelcome="Los comentarios son bienvenidos en"
  
  
  def controlsDebugButton="Depurar"
  def controlsDebugTooltip=s"$controlsDebugOrAbortHotkey: Cargar el programa en la memoria sin comenzar la ejecución, para realizar una ejecución paso a paso."
  def controlsStopButton="Abortar"
  def controlsStopTooltip= s"$controlsDebugOrAbortHotkey: Abortar ejecución y salir del modo de depuración."
  
  def controlsQuickButton="Ejecución Rápida"
  def controlsQuickTooltip=s"$controlsQuickHotkey: Reiniciar simulador, cargar el programa en la memoria, y ejecutar hasta que la CPU se detenga."
  def controlsStepButton="Paso"
  def controlsStepTooltip=s"$controlsStepHotkey: Ejecutar la próxima instrucción."
  def controlsFinishButton="Finalizar"
  def controlsFinishTooltip= s"$controlsFinishHotkey: Ejecutar el programa hasta que la CPU se detenga."
  
  def stateToMessage(state:SimulatorState)= state match{
    case SimulatorExecutionError(msg) => "Error de ejecución"
    case SimulatorExecutionFinished => "Ejecución finalizada"
    case SimulatorExecutionStopped => "No hay programa cargado"
    case SimulatorProgramExecuting => "Programa en ejecución"      
  }
  def stateToTooltip(state:SimulatorState)= state match{
    case SimulatorExecutionError(error) => "La ejecución se ha detenido por el siguiente error: "+error.message
    case SimulatorExecutionFinished => "La ejecución ha finalizado sin errores."
    case SimulatorExecutionStopped => "No hay un programa cargado en el simulador. Realiza una ejecución rápida o inicia el modo de depuración."
    case SimulatorProgramExecuting => s"""El programa está ejecutándose en modo depuración. 
Podés ejecutar instrucciones una a la vez con $controlsStepButton, o ejecutar el programa hasta que termine con $controlsFinishButton.
Mientras el programa está ejecutándose no se puede modificar el código en el editor."""      
  }
  
  
  def cpuFlagDescription(f:Flag,v:String) = {
    val description=f match{
      case C => s"El flag $f, por (C)arry, toma el valor 1 cuando hay carry o borrow al realizar la operación. Si los operandos se interpretan en BSS, implica que el resultado es erróneo, ya que era o un número negativo si hay borrow o un número con más bits de los disponibles is hay carry."
      case Z => s"El flag $f, por (Z)ero, toma el valor 1 cuando todos los bits del resultado son 0."
      case O => s"El flag $f, por (O)verflow, toma el valor 1 cuando el resultado es erróneo si se interpretan los números en el sistema CA2. "
      case S => s"El flag $f, por (S)ign, toma el valor 1 si el bit de más a la izquierda del resultado es un 1. Si el resultado se interpreta en CA2, implica que el mismo es negativo."
    }
    s"El flag $f tiene el valor $v.\n"+description
  }
  def flags="Flags"
  def aluTitle="ALU"
  def cpuTitle="CPU"
  def cpuSpecialRegisters="Registros Especiales"
  def cpuGeneralPurposeRegisters="Registros de Propósito General"
  def memoryTitle="Memoria"
  
  def addressSearch="Ver dirección de memoria"
  
  def alertCompilationFailed="La compilación ha fallado, no se puede cargar el programa."
 
  def describeInstruction(i:Instruction)="Instrucción correcta."

  
  def describeMemoryCell(address:Int,value:Word)={
    s"""Celda de memoria con dirección ${formatAddress(address)}h y valor:
Hexadecimal: ${formatWord(value)}h
Binario: ${value.bitString.reverse}
CA2: ${value.toInt}
BSS: ${value.toUnsignedInt}
"""
}
 
  
}