package vonsim.assembly.i18n

object Spanish{
  def code="es"
}
class Spanish extends CompilerLanguage{
  def code=Spanish.code
  def newline="final de línea"
  def stringLiteral="""cadena de caracteres literal ("") """
  def identifier="identificador"
  def label="etiqueta"
  def integerLiteral="número literal"
  def offsetLabel="offset <etiqueta>"
  def equLabel="etiqueta del equ"
  def emptyProgram="El programa no contiene instrucciones. Debe tener, como mínimo, una sentencia END."
  def missingEnd="Falta una sentencia END para terminar el programa."
  def noHltInstructionsWarning="No se han encontrado instrucciones HLT."
  def onlyOneEnd="Debería haber una sola sentencia END, y debe ser la última del programa."
  def loopsInEqu="Se detectó un ciclo en la definición de constantes con sentencias EQU."
  def labelWithMultipleDefinitions(label:String)=s"La etiqueta ${label} tiene múltiples definiciones."
  def noOrg="No hay ORG antes de esta instrucción; no se puede terminar su ubicación en memoria."
  def labelUndefined(label:String)=s"La etiqueta ${label} no ha sido definida."
  def labelsUndefined(labels:List[String])=if (labels.length==1) labelUndefined(labels(0)) else s"Las etiquetas (${labels.mkString(", ")}) no están definidas."
  def operandNotUpdatable(operand:String)=s"El operando $operand no puede modificarse, es un valor."
  def immediateOperandsNotUpdatable(operand:String)=s"El operando $operand es inmediato, no puede modificarse."
  def dontFitIn16Bits(v:Int)=s"El número ${v} no puede ser representado con 8 o 16 bits"
  def dontFitIn16Bits="Algún valor no puede codificarse con 16 bits, es demasiado grande o chico."
  def dontFitIn8Bits="Algún valor no puede representarse con 8 bits."
  def instructionNotSupported(i:String)=s"La instrucción $i no está implementada."
  def invalidOperands="Operandos inválidos."
  def literalStringsAsImmediate(s:String)=s"No se puede usar strings literales ($s) como operandos inmediatos."
  def cannotDetermineMemoryReferenceType= s"No se puede determinar el tipo de referencia a memoria (word o byte)."
  def memoryMemory= "Ambos operandos acceden a la memoria. No se puede acceder a la memoria con dos operandos distintos en una misma instrucción."
  def DWordWordOperands="El segundo operando requiere solo 8 bits para representarsepero el primer operando tiene 16 bits. Entonces, no está claro si se debe escribir el resultado sobre los primeros o últimos 8 bits."
  def indirectPointerTypeUndefined= "El direccionamiento indirecto ([bx]) con un operando inmediato requiere que se especifique el tipo de puntero con las palabras clave WORD PTR (para operandos inmediatos de 16 bits) o BYTE PTR (para operandos de 8 bits). Por ejemplo, MOV WORD PTR [BX], 15."
  def WordDWordOperands="El segundo operando requiere 16 bits para representarse, pero el primero sólo tiene 8 bits"
  def parserError="Error sintáctico."
  
}