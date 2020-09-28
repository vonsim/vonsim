//package vonsim.simulator
//
//
//
//sealed trait ParseErrorDescription  
//case object MoreThanOneLabel extends ParseErrorDescription
//case object InvalidLabel extends ParseErrorDescription
//
//class ParseError(val position:Position,val d:ParseErrorDescription){
//}
//
//class InstructionLabel(val label:String,val p:Position){
//  
//}
//
//sealed trait Instruction
//case object Nothing extends Instruction
//case object Zeroary extends Instruction
//
//
//
//
//object Parser{
//  
//  
//  val zeroary = List("ret","nop","hlt","cli","sti")
//  val unary = List("call","jmp","jz","jnz","js","jns","jc","jnc")
//  val binary = List("mov","add","adc","sub","in","out")
//  val operations = zeroary++unary++binary
//  
//  def apply(tokens:List[Token])={
//      val label = this.parseLabel(tokens)
//      
//      
//      label match {
//        case Left(x) => Left(x)
//        case Right => {
//          val tokensWithoutLabel=tokens.drop(2)
//          this.parseInstruction(tokensWithoutLabel)
//        }
//         
//      }
//      
//  }
//  def parseInstruction(tokens:List[Token])={
//    tokens.length match {
//      case 0 => Right(Nothing)
//      case _ => {
//        tokens(0) match {
//          case x if zeroary.contains(x) => this.parseZeroary()
//        }
//        
//      }
//    }
//  }
//  
//  def parseZeroary
//  
//  def isLabel(s:String) = {
//    s.matches("^[\\pL_][\\pL\\pN_]+$")
//  }
//  
//  def constructLabel(t:Token)={
//    if (this.isLabel(t.text)){
//      Right(Some(new InstructionLabel(t.text,t.position)))  
//    }else{
//      Left(new ParseError(t.position,InvalidLabel))
//    }
//    
//  }
//  
//  def parseLabel(tokens:List[Token]):Either[ParseError,Option[InstructionLabel]]={
//    val colons = tokens.filter(_.text == ":")
//    
//    colons.length match{
//      case 0 => Right(None)
//      case 1 =>{
//        tokens.indexWhere(_.text==":") match{
//        case 1 => this.constructLabel(tokens(0))
//        case _ => Left(new ParseError( tokens(0).position, InvalidLabel))
//        }
//      }
//      case _ =>Left(new ParseError(colons(1).position,MoreThanOneLabel))
//    }
//      
//  }
//      
//}