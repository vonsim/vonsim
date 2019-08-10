package vonsim.assembly
import scala.util.parsing.input.Positional
import PositionalExtension._
import scala.collection.mutable
import vonsim.utils.CollectionUtils._

import vonsim.assembly.parser.ConstantExpression
import vonsim.assembly.parser.BinaryExpression
import vonsim.assembly.lexer.ExpressionOperation
import vonsim.assembly.lexer.PlusOp
import vonsim.assembly.lexer.MultOp
import vonsim.assembly.lexer.DivOp
import vonsim.assembly.lexer.MinusOp
import vonsim.assembly.parser.LabelExpression
import vonsim.assembly.parser.OffsetLabelExpression
import vonsim.assembly.Compiler.ParsingResult
import vonsim.assembly.lexer.VarType
import vonsim.simulator.InstructionInfo
import vonsim.simulator.VarDefInstruction
import vonsim.simulator.ExecutableInstruction
import vonsim.simulator.Org
import vonsim.simulator.Simulator
import scala.math.Equiv

object PositionalExtension{
  implicit class RichPositional(p:Positional){
    def location=new Location(p.pos.line, p.pos.column)
  }
}

sealed trait CompilationError {
  def location: Location
  def msg: String
}

case class LexerError(location: Location, msg: String) extends CompilationError
case class ParserError(location: Location, msg: String) extends CompilationError
abstract class SemanticError extends CompilationError

abstract class InstructionSemanticError(i:parser.Instruction) extends SemanticError{  
  def location=i.location
}
case class MemoryMemoryReferenceError(i:parser.Instruction) extends InstructionSemanticError(i){
  def msg=Compiler.language.memoryMemory
}

case class IndirectPointerTypeUndefined(i:parser.Instruction) extends InstructionSemanticError(i){
  def msg=Compiler.language.indirectPointerTypeUndefined
}
case class WordDWordOperandSizeMismatchError(i:parser.Instruction) extends InstructionSemanticError(i){
  def msg=Compiler.language.WordDWordOperands 
}
case class DWordWordOperandSizeMismatchError(i:parser.Instruction) extends InstructionSemanticError(i){
  def msg=Compiler.language.DWordWordOperands 
}

case class GenericSemanticError(p:Positional,msg:String) extends SemanticError{
  def location=p.location
}

case class GlobalError(location: Option[Location], msg: String)

object Location {
  def apply(line: Int) = new Location(line, 0)
}
case class Location(line: Int, column: Int) {
  override def toString = s"$line:$column"
}


class MemoryAccessSize
case object DWordAccessSize extends MemoryAccessSize
case object WordAccessSize extends MemoryAccessSize
case object UndefinedAccessSize extends MemoryAccessSize

abstract class Resolver{
  def expression(e:parser.Expression):Int
  def jumpLabelAddress(label:String):Int
  def vardefLabelAddress(label:String):Int
  def vardefLabelType(label:String):lexer.VarType
  
  def vardefLabelDefined(label:String):Boolean
  def jumpLabelDefined(label:String):Boolean
  def equLabelDefined(label:String):Boolean
  def equ:Map[String,parser.Expression]
  
  def isMemoryExpression(e:parser.Expression)=memoryReferences(e) ==1
  def memoryReferences(e:parser.Expression):Int= e match{
    case ConstantExpression(c) => 0
    case BinaryExpression(o,l,r) => memoryReferences(l) + memoryReferences(r)
    case LabelExpression(l) => if (equLabelDefined(l)) memoryReferences(equ(l)) else 1
    case OffsetLabelExpression(l) => 0
  }
  
  
  def getMemoryLabelFromMemoryExpression(e:parser.Expression):Option[String]= e match{
    case BinaryExpression(op,a,b) => getMemoryLabelFromMemoryExpression(a) match{
      case None => getMemoryLabelFromMemoryExpression(b)
      case other => other
    }
    case LabelExpression(l) => {
      if (vardefLabelDefined(l)){
          Some(l)
      }else{
         getMemoryLabelFromMemoryExpression(equ(l))
      }
    }
    case other =>None
  }
  
  def memoryExpressionType(e:parser.Expression)= getMemoryLabelFromMemoryExpression(e) match{
    case None => None
    case Some(l) => Some(vardefLabelType(l))
  }

  def equOrVardefLabelDefined(label:String)= equLabelDefined(label) || vardefLabelDefined(label)
  def undefinedLabels(e:parser.Expression):List[String]={
    e match{
      case ConstantExpression(c) => List()
      case BinaryExpression(o,l,r) => undefinedLabels(l) ++ undefinedLabels(r)
      case LabelExpression(l) => if (equOrVardefLabelDefined(l)) List() else List(l)
      case OffsetLabelExpression(l) =>  if (vardefLabelDefined(l)) List() else List(l)
    }
  }
  
}

// Dummy resolver for the first pass
class FirstPassResolver(instructions: ParsingResult) extends Resolver{
  
//  val vardefLabels:List[String]
//  val vardefLabelToType:Map[String,lexer.VarType]
//  val jumpLabels:List[String]
  val equ=instructions.collect({ case Right(x: parser.EQUDef) => (x.label, x.expression) }).toMap
  val (vardefLabelToLine, vardefLabelToType, jumpLabelToLine) = getLabelToLineMappings(instructions)
  
  def expression(e:parser.Expression)= -1
  
  
  def jumpLabelAddress(label:String)= -1
  def vardefLabelAddress(label:String)= -1
  
  def vardefLabelDefined(label:String)=vardefLabelToLine.keySet.contains(label)
  def jumpLabelDefined(label:String)=jumpLabelToLine.keySet.contains(label)
  def equLabelDefined(label:String)=equ.keySet.contains(label)
  def vardefLabelType(label:String)=vardefLabelToType(label)
  
   def getLabelToLineMappings(instructions: ParsingResult): (Map[String, Compiler.Line], Map[String, VarType], Map[String, Compiler.Line]) = {
    val vardefLabelToLine = mutable.Map[String, Compiler.Line]()
    val vardefLabelToType = mutable.Map[String, VarType]()
    val jumpLabelToLine = mutable.Map[String, Compiler.Line]()

    val unlabeledInstructions = instructions.rights.foreach(
      _ match {
        case li: parser.LabeledInstruction => {
          jumpLabelToLine(li.label) = li.pos.line
        }
        case v: parser.VarDef => {
          vardefLabelToLine(v.label) = v.pos.line
          vardefLabelToType(v.label) = v.t
        }
        case other => {}
      })

    (vardefLabelToLine.toMap, vardefLabelToType.toMap, jumpLabelToLine.toMap)
  }
}

class SecondPassResolver(val instructions:List[InstructionInfo],val firstPassResolver:FirstPassResolver) extends Resolver{
  
  def vardefLabelToType=firstPassResolver.vardefLabelToType
  def equ=firstPassResolver.equ
  
  val (vardefLineToAddress, executableLineToAddress) = getMemoryLayout(instructions)
  val vardefLabelToAddress=firstPassResolver.vardefLabelToLine.map(x => (x._1,vardefLineToAddress(x._2)))
  val jumpLabelToAddress=firstPassResolver.jumpLabelToLine.map(x => (x._1,executableLineToAddress(x._2)))
  
  def jumpLabelAddress(label:String)=jumpLabelToAddress(label)
  def vardefLabelAddress(label:String)=vardefLabelToAddress(label)
  def vardefLabelType(label:String)= vardefLabelToType(label)
  
  def vardefLabelDefined(label:String)=vardefLabelToAddress.keySet.contains(label)
  def jumpLabelDefined(label:String)=jumpLabelToAddress.keySet.contains(label)
  def equLabelDefined(label:String)=equ.keySet.contains(label)
  
  
  
      
  def expression(e:parser.Expression)= e match{
    case ConstantExpression(c) => c
    case BinaryExpression(op,a,b) => expression(op,expression(a),expression(b))
    case LabelExpression(l) => {
      if (vardefLabelDefined(l)){
          vardefLabelToAddress(l)
      }else{
         expression(equ(l))
      }
    }
    case OffsetLabelExpression(l) =>{
      vardefLabelToAddress(l)
    }
  }
  def expression(op:ExpressionOperation,a:Int,b:Int)= op match{
    case PlusOp() => a+b
    case MinusOp() => a-b
    case MultOp() => a*b
    case DivOp() => a / b
  }
  
  def getMemoryLayout(instructions: List[InstructionInfo]) = {

    val vardefLineToAddress = mutable.Map[Compiler.Line, Compiler.MemoryAddress]()
    val executableLineToAddress = mutable.Map[Compiler.Line, Compiler.MemoryAddress]()

    val firstOrgIndex = instructions.indexWhere(_.instruction.isInstanceOf[Org])
    if (firstOrgIndex >= 0) {
      val firstOrg = instructions(firstOrgIndex).instruction.asInstanceOf[Org]
      var address = firstOrg.address
      instructions.indices.foreach(i => {
        val line = instructions(i).line
        instructions(i).instruction match {
          case x: Org => {
            address = x.address
          }
          case x: VarDefInstruction => {
            vardefLineToAddress(line) = address
            address += x.bytes
          }
          case x: ExecutableInstruction => {
            executableLineToAddress(line) = address
            address += Simulator.instructionSize(x)
          }
          case other => {}
        }
      })
    }

    (vardefLineToAddress.toMap, executableLineToAddress.toMap)
  }
  
  
  
  
  
}
