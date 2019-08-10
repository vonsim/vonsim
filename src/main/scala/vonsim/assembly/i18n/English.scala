package vonsim.assembly.i18n

object English{
  def code="en"
}
class English extends CompilerLanguage{
  def code=English.code
  def newline="newline"
  def stringLiteral="string literal"
  def identifier="identifier"
  
  def label="label"
  def integerLiteral="number literal"
  def offsetLabel="offset <label>"
  def equLabel="equ's label"
  def emptyProgram="Empty program. The program must have, at least, an END statement"
  def missingEnd="Missing END statement."
  def noHltInstructionsWarning="No Hlt instructions found."  
  def onlyOneEnd="There should be only one END, and it should be the last statement."
  def loopsInEqu="Loops detected in EQU statement references."
  def labelWithMultipleDefinitions(label:String)=s"Label ${label} has multiple definitions"
  def noOrg= "No ORG before this instruction; cannot determine its location in memory."
  def labelUndefined(label:String)=s"Label ${label} undefined."
  def labelsUndefined(labels:List[String])=if (labels.length==1) labelUndefined(labels(0)) else s"Labels (${labels.mkString(", ")}) are undefined"
  def operandNotUpdatable(operand:String)=s"Operand $operand is not updatable"
  def immediateOperandsNotUpdatable(operand:String)=s"Operand $operand is immediate, it cannot be modified"
  def dontFitIn16Bits(v:Int)=s"The number ${v} cannot be represented with 8 or 16 bits"
  def dontFitIn16Bits="Some values do not fit into a 16 bit representation."
  def dontFitIn8Bits="Some values do not fit into an 8 bit representation."
  def instructionNotSupported(i:String)=s"Instruction $i not supported."
  def invalidOperands="Invalid operands."
  def literalStringsAsImmediate(s:String)=s"Cannot use literal strings ($s) as inmediate operands "
  def cannotDetermineMemoryReferenceType= s"Cannot determine type of memory reference (word or byte)"
  def memoryMemory= "Both operands access memory. Cannot access two memory locations in the same instruction." 
  def DWordWordOperands="The second operand needs only 8 bits to be encoded, but the first operand has 16 bits, so it is not clear if you want to set the first or last 8 bits."
  def indirectPointerTypeUndefined= "Indirect addressing with an immediate operand requires specifying the type of pointer with WORD PTR or BYTE PTR before [BX]."
  def WordDWordOperands="The second operand needs 16 bits to be encoded, but the first one only has 8 bits."
  def parserError="Syntax error."
}