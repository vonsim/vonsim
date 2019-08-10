package vonsim.assembly.i18n

object CompilerLanguage{
  val codes=Map(Spanish.code -> new Spanish()
               ,English.code -> new English()
               )
}
abstract class CompilerLanguage {
  def code:String
  def newline:String
  def stringLiteral:String
  def identifier:String
  def integerLiteral:String
  def label:String
  def offsetLabel:String
  def equLabel:String
  def emptyProgram:String
  def missingEnd:String
  def noHltInstructionsWarning:String
  def onlyOneEnd:String
  def loopsInEqu:String
  def labelWithMultipleDefinitions(label:String):String
  def noOrg:String
  def labelUndefined(label:String):String
  def labelsUndefined(labels:List[String]):String
  def operandNotUpdatable(operand:String):String
  def immediateOperandsNotUpdatable(operand:String):String
  def dontFitIn16Bits(v:Int):String
  def dontFitIn16Bits:String
  def dontFitIn8Bits:String
  def instructionNotSupported(i:String):String
  def invalidOperands:String
  def literalStringsAsImmediate(s:String):String
  def cannotDetermineMemoryReferenceType:String
  def memoryMemory:String
  def DWordWordOperands:String
  def indirectPointerTypeUndefined:String
  def WordDWordOperands:String
  def parserError:String
  
}
