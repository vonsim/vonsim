

package vonsim.simulator


trait Positional{
  def position:Position
  
}

class Position(val line: Int, val column: Int){
  
  
  override def toString(): String = {
    //
    return s"${this.line}:${this.column}"
  }
  
}
class TextToken(val text: String,val position:Position) {

  override def toString(): String = {
    return s"${this.text}(${this.position})"
  }
}

sealed trait Token extends Positional with Product with Serializable


  
trait InstructionToken extends Token
case class RET(val position:Position) extends InstructionToken  



//  def special = List(COMMA())
//  def keyword = List(END(), NOP(), RET(), HLT(), EQU())
//  def ops = List(ORG(), MOV(), CMP()) ++ binaryArithmetic ++ unaryArithmetic
//  def binaryArithmetic =
//    List(ADD(), ADC(), SUB(), SBB(), OR(), XOR(), AND(), CMP())
//  def unaryArithmetic = List(INC(), DEC(), NOT(), NEG())
//  def registers: List[RegisterToken] =
//    lRegisters ++ hRegisters ++ xRegisters ++ List(SP(), IP())
//  def lRegisters = List(AL(), BL(), CL(), DL())
//  def hRegisters = List(AH(), BH(), CH(), DH())
//  def xRegisters = List(AX(), BX(), CX(), DX())
//  def inputOutput = List(IN(), OUT())
//  def jump = List(JMP(), CALL()) ++ conditionalJump
//  def conditionalJump = List(JC(), JNC(), JZ(), JNZ(), JO(), JNO(), JS(), JNS())
//  def interrupt = List(CLI(), STI(), IRET(), INT())
//  def stack = List(PUSH(), POP())
//  def flagsStack = List(PUSHF(), POPF())
//  def varType = List(DB(), DW())
//  def all = special ++ keyword ++ ops ++ registers ++ inputOutput++jump++interrupt++stack++flagsStack++varType
//}
//


//
//trait Operand extends Token
//trait Mutable extends Operand
//
//sealed trait IORegister
//
//sealed trait IOAddress
//case class LABEL(str: String) extends Special
//case class OFFSETLABEL(str: String) extends Special
//
//case class INDIRECTBX() extends Mutable
//case class WORDINDIRECTBX() extends Mutable
//case class DWORDINDIRECTBX() extends Mutable
//
//case class WHITESPACE() extends Special
//
//case class WORD() extends Special
//case class BYTE() extends Special
//case class PTR() extends Special
//case class EQU() extends Special
//
//case class IDENTIFIER(str: String) extends Token
//


//
//sealed trait Interrupt extends InstructionToken
//
//case class CLI() extends Interrupt
//case class STI() extends Interrupt
//case class IRET() extends Interrupt

//case class INT() extends Interrupt
//
//sealed trait StackInstruction extends InstructionToken
//case class PUSH() extends StackInstruction
//case class POP() extends StackInstruction
//sealed trait StackFlagsInstruction extends InstructionToken
//case class PUSHF() extends StackFlagsInstruction
//case class POPF() extends StackFlagsInstruction
//
//sealed trait VarType extends Token
//case class DW() extends VarType
//case class DB() extends VarType
//
//sealed trait Special extends Token
//case class COMMA() extends Special
//case class UNINITIALIZED() extends Special
//
//case class MOV() extends InstructionToken
//
//case class NOP() extends InstructionToken
//case class END() extends InstructionToken
//case class ORG() extends InstructionToken
//case class HLT() extends InstructionToken
//
//sealed trait IOToken extends InstructionToken
//case class IN() extends IOToken
//case class OUT() extends IOToken
//
//trait ArithmeticOp extends InstructionToken
//
//trait BinaryArithmeticOp extends ArithmeticOp
//case class ADD() extends BinaryArithmeticOp
//case class ADC() extends BinaryArithmeticOp
//case class SUB() extends BinaryArithmeticOp
//case class SBB() extends BinaryArithmeticOp
//case class NOR() extends BinaryArithmeticOp // TODO WTF
//case class AND() extends BinaryArithmeticOp
//case class OR() extends BinaryArithmeticOp
//case class XOR() extends BinaryArithmeticOp
//case class CMP() extends BinaryArithmeticOp
//
//trait UnaryArithmeticOp extends ArithmeticOp
//case class DEC() extends UnaryArithmeticOp
//case class INC() extends UnaryArithmeticOp
//case class NOT() extends UnaryArithmeticOp
//case class NEG() extends UnaryArithmeticOp
//
//trait JumpInstructionToken extends InstructionToken
//case class JMP() extends JumpInstructionToken
//case class CALL() extends JumpInstructionToken
//
//trait ConditionalJumpToken extends JumpInstructionToken
//case class JC() extends ConditionalJumpToken
//case class JNC() extends ConditionalJumpToken
//case class JS() extends ConditionalJumpToken
//case class JNS() extends ConditionalJumpToken
//case class JO() extends ConditionalJumpToken
//case class JNO() extends ConditionalJumpToken
//case class JZ() extends ConditionalJumpToken
//case class JNZ() extends ConditionalJumpToken
//
//trait RegisterToken extends Token with Mutable with Operand
//case class SP() extends RegisterToken
//case class IP() extends RegisterToken
//
//trait FullRegisterToken extends RegisterToken
//case class AX() extends FullRegisterToken with IORegister
//case class BX() extends FullRegisterToken
//case class CX() extends FullRegisterToken
//case class DX() extends FullRegisterToken with IOAddress
//trait HalfRegisterToken extends RegisterToken
//trait LowRegisterToken extends HalfRegisterToken
//case class AL() extends LowRegisterToken with IORegister
//case class BL() extends LowRegisterToken
//case class CL() extends LowRegisterToken
//case class DL() extends LowRegisterToken
//trait HighRegisterToken extends HalfRegisterToken
//case class AH() extends HighRegisterToken
//case class BH() extends HighRegisterToken
//case class CH() extends HighRegisterToken
//case class DH() extends HighRegisterToken
//
//sealed trait Literal extends Token
//case class LITERALSTRING(str: String) extends Literal with Operand
//case class LITERALINTEGER(v: Int) extends Literal with Operand with IOAddress
//
//trait ExpressionToken extends Token
//
//trait ExpressionOperation extends ExpressionToken
//case class PlusOp() extends ExpressionOperation
//case class MinusOp() extends ExpressionOperation
//case class MultOp() extends ExpressionOperation
//case class DivOp() extends ExpressionOperation
//
//trait ExpressionTokenParen extends ExpressionToken
//case class OpenParen() extends ExpressionTokenParen
//case class CloseParen() extends ExpressionTokenParen
//
//
//
//


object Tokenizer {
  val discard_separators = List(" ", "\t")
  val keepSeparators = List(",", ":", "+", "-", "*", "/","[","]","(",")")
  val separators = discard_separators ++ keepSeparators

  def apply(line: String,lineNumber:Int) = {
    var i = 0
    var start = 0
    var tokens = Array[TextToken]()
    
    for (i <- 0 until line.length) {
      var c = line(i).toString()
      if (separators.contains(c)) {
        if (start < i) {
          val tokenText = line.subSequence(start, i).toString()
          val p = new Position(lineNumber, start)
          val t = new TextToken(tokenText,p)
          tokens = tokens :+ t
        }
        start = i + 1
      }
      if (keepSeparators.contains(c)) {
        val p = new Position(lineNumber, i)
        val ts = new TextToken(c,p)
        tokens = tokens :+ ts
      }
    }
    this.convert(tokens.toList)
  }
  def convert(tokens:List[TextToken])={
      tokens
    
  }
  
  def tokenizeProgram(program:String)={
    val lines = program.split("\n")
    lines.zipWithIndex.map { case (l, ln) => Tokenizer(l, ln) }
  }
  
}
