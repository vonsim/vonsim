package vonsim.assembly.parser

import scala.util.parsing.combinator.Parsers
import scala.util.parsing.input.{NoPosition, Position, Reader}
import vonsim.assembly.lexer._
import scala.Left
import scala.Right

import vonsim.assembly.ParserError
import vonsim.assembly.Location
import scala.util.parsing.input.Positional
import vonsim.assembly.i18n.English
import vonsim.assembly.i18n.CompilerLanguage
import scala.util.Random


object Parser extends MyParsers {
  var compilerLanguage:CompilerLanguage=new English()
  
  override type Elem = Token
  
  def apply(tokens: Seq[Token]): Either[ParserError, Instruction] = {
    val reader = new TokenReader(tokens)
    val defaultMessage=compilerLanguage.parserError // temporary until the parser is improved
    program(reader) match {
      
      case NoSuccess(msg, next) => Left(ParserError(Location(next.pos.line, next.pos.column), defaultMessage))
      case Success(result, next) => Right(result)
    }
  }
  
  class TokenReader(tokens: Seq[Token]) extends Reader[Token] {
    override def first: Token = tokens.head
    override def atEnd: Boolean = tokens.isEmpty
    override def pos: Position = tokens.headOption.map(_.pos).getOrElse(NoPosition)
    override def rest: Reader[Token] = new TokenReader(tokens.tail)
  }

  def program = positioned {
     (labeledInstruction | instruction) ~ newline ^^{case (o:Instruction) ~ _  => o }  
  }
  def labeledInstruction =positioned {
    (label ~ instruction) ^^{ case LABEL(l) ~ (o:ExecutableInstruction) => LabeledInstruction(l,o) }
  }
  def instruction = positioned{
    zeroary | org | mov | jump  | arithmetic | io | intn | stack | vardef | equ 
  }
  def equ = positioned{
    (identifier ~ EQU() ~ expression) ^^{case ((i:IDENTIFIER) ~ (o:EQU) ~ (e:Expression) ) => EQUDef(i.str,e) } 
  }
  def arithmetic= positioned {
    binaryArithmetic | unaryArithmetic 
  }
  
  def binaryArithmetic: Parser[Instruction] = positioned {
    (binary ~ operand ~ COMMA() ~ operand) ^^ { case ( (o:BinaryArithmeticOp) ~ (m:Operand) ~ _ ~ (v:Operand)) => BinaryArithmetic(o,m,v)}
  }
  def binary= (Token.binaryArithmetic map tokenAsParser) reduceLeft(_ | _)
  
  def unaryArithmetic: Parser[Instruction] = positioned {
    (unary ~ operand) ^^ { case ( (o:UnaryArithmeticOp) ~ (m:Operand)) => UnaryArithmetic(o,m)}      
  }
  def unary = (Token.unaryArithmetic map tokenAsParser) reduceLeft(_ | _)
  
  
  def io = positioned {
    ((IN() | OUT()) ~ (AL() | AX()) ~ COMMA() ~ (ioaddress)) ^^ { case ( (o:IOToken) ~ (m:IORegister) ~ _ ~ (a:IOAddress)) => IO(o,m,a)} 
  }
  
  def cmp = positioned {
    (CMP() ~ (operand) ~ COMMA() ~ (operand) ~ (newline)) ^^ { case ( CMP() ~ (v1:Operand) ~ _ ~ (v2:Operand) ~ _) => Cmp(v1,v2)} 
  }
  
  
  def intn= positioned {
    (INT() ~ literalInteger ) ^^ {case o ~ LITERALINTEGER(v) => IntN(v)}
  }
  def org= positioned {
    (ORG() ~ literalInteger ) ^^ {case o ~ LITERALINTEGER(v) => Org(v)}
  }
  def stack= positioned {
    ((PUSH() | POP()) ~ fullRegister ) ^^ {case (o:StackInstruction) ~ (t:FullRegisterToken) => Stack(o,t)}
  }
  
  def mov= positioned {
    (MOV() ~ operand ~ COMMA() ~ operand) ^^ { 
      case ( MOV() ~ (m:Operand) ~ _ ~ (v:Operand)) => Mov(m,v)
    }
  }
  
  def zeroary= positioned {
    val end =END() ^^ (_ => End())
    val ret = RET() ^^ (_ => Ret())
    val nop = NOP() ^^ (_ => Nop())
    val hlt = HLT() ^^ (_ => Hlt())
    val cli = CLI() ^^ (_ => Cli())
    val sti = STI() ^^ (_ => Sti())
    val iret = IRET() ^^ (_ => IRet())
    val pushf = PUSHF() ^^ (_ => Pushf())
    val popf = POPF() ^^ (_ => Popf())
    end | ret | nop | hlt | cli | sti | iret | pushf | popf
  }
  
  def jump = jmp | conditionalJump | call
  def jmp = positioned {
    (JMP() ~ identifier ) ^^ {case JMP()  ~ IDENTIFIER(i) => UnconditionalJump(i)}
  }
  
  def call = positioned {
    (CALL() ~ identifier ) ^^ {case CALL() ~ IDENTIFIER(i) => Call(i)}
  }
  def vardef = positioned {
    val r = new scala.util.Random(31)
    val ints= ((identifier?) ~ (DB() | DW() ) ~ varDefInts  )  ^^ {
      case Some(IDENTIFIER(id))~ (t:VarType) ~ (e:List[Either[Undefined.type,Expression]]) => VarDef(id,t,e)
      case None~ (t:VarType) ~ (e:List[Either[Undefined.type,Expression]]) => VarDef(Random.alphanumeric.take(30).mkString,t,e)
     }
    val str = ((identifier ?) ~ DB() ~ literalString ) ^^ {
      case Some(IDENTIFIER(id))~ DB() ~ LITERALSTRING(s) => VarDef(id,DB(),stringToIntList(s))
      case None ~ DB() ~ LITERALSTRING(s) => VarDef(Random.alphanumeric.take(30).mkString,DB(),stringToIntList(s))
      }
    str | ints 
  }
  
  def stringToIntList(s:String)=s.map( (c:Char) => Right(ConstantExpression(c.charValue().toInt))).toList
  
  //
  def varDefValue = (expression ^^ {case e => Right(e)} | UNINITIALIZED() ^^ {case u => Left(Undefined)})

  def varDefInts = rep1sep(varDefValue, COMMA()) 
  
  
  def conditionalJump = positioned {
    (conditionalJumpTokens  ~ identifier ) ^^ {case (o:ConditionalJumpToken) ~ IDENTIFIER(i) => ConditionalJump(o,i)}
  }
  
  private def newline= positioned {
    accept(compilerLanguage.newline, { case bl @ NEWLINE() => bl })
  }
  private def literalString = positioned {
    accept(compilerLanguage.stringLiteral, { case lit @ LITERALSTRING(v) => lit })
  }
  private def identifier = positioned {
    accept(compilerLanguage.identifier, { case lit @ IDENTIFIER(v) => lit })
  }
   private def label = positioned {
    accept(compilerLanguage.label, { case lit @ LABEL(v) => lit })
  }
  private def literalInteger = positioned {
    accept(compilerLanguage.integerLiteral, { case lit @ LITERALINTEGER(v) => lit })
  } 
  
  def conditionalJumpTokens = positioned{
    (Token.conditionalJump map  tokenAsParser) reduceLeft(_ | _)
  }
  def tokenAsParser(t:Token)= t ^^^ t
  
  private def indirect={ 
     val indirectDWord = (WORD() ~ PTR() ~ INDIRECTBX()) ^^ { case (WORD() ~ PTR() ~ INDIRECTBX()) => DWORDINDIRECTBX()}
     val indirectWord = (BYTE() ~ PTR() ~ INDIRECTBX()) ^^ { case (BYTE() ~ PTR() ~ INDIRECTBX()) => WORDINDIRECTBX()}
     indirectDWord | indirectWord |INDIRECTBX()
  }
  
  def operand = expression | allRegisters | indirect 
  
  private def allRegisters=(Token.registers map tokenAsParser) reduceLeft(_ | _) 
  private def fullRegister = positioned{
    (Token.xRegisters map tokenAsParser) reduceLeft(_ | _)
  }
  private def ioaddress = expression 
  
  def copyPosition[T <: Positional,E <: Positional](to:T,from:E)={
    to.pos=from.pos
    to
  }
  def offsetLabel = accept(compilerLanguage.offsetLabel, { case lit @ OFFSETLABEL(v) => copyPosition(OffsetLabelExpression(v),lit)})
  def negativeInteger = MinusOp() ~ integer ^^ {case m ~ i => copyPosition(ConstantExpression(-i.v),i)} 

  def integer = accept(compilerLanguage.integerLiteral, { case lit @ LITERALINTEGER(v) => copyPosition(ConstantExpression(v),lit) })
  def expressionLabel = accept(compilerLanguage.equLabel, { case lit @ IDENTIFIER(v) => copyPosition(LabelExpression(v),lit)})
  
  
    def parens:Parser[Expression] = OpenParen() ~> expression <~ CloseParen()
    def term = ( negativeInteger | integer | offsetLabel | expressionLabel |  parens )

    def binaryOp(level:Int):Parser[((Expression,Expression)=>Expression)] = {
        level match {
            case 1 =>
                PlusOp() ^^^ { (a:Expression, b:Expression) => BinaryExpression(PlusOp() ,a,b) } |
                MinusOp() ^^^ { (a:Expression, b:Expression) => BinaryExpression(MinusOp(),a,b) }
            case 2 =>
                MultOp() ^^^ { (a:Expression, b:Expression) => BinaryExpression(MultOp(),a,b) } |
                DivOp() ^^^ { (a:Expression, b:Expression) => BinaryExpression(DivOp(),a,b) }
            case _ => throw new RuntimeException("bad precedence level "+level)
        }
    }
    val minPrec = 1
    val maxPrec = 2

    def binary(level:Int):Parser[Expression] =
        if (level>maxPrec) term
        else binary(level+1) * binaryOp(level)

    def expression = ( binary(minPrec) | term )
  
  
  
}