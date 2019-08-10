package vonsim.simulator
import vonsim.utils.CollectionUtils._
import org.scalatest.FunSuite
import Simulator._
import ComputerWord._
import com.sun.org.apache.bcel.internal.generic.ArithmeticInstruction
import vonsim.assembly.Compiler
import vonsim.assembly.Compiler.SuccessfulCompilation
import scala.io.Source
import vonsim.assembly.lexer.Lexer


class LexerSuite extends FunSuite {
  
def getTokens(program:String,assertLength:Int)={
    val t =Lexer(program)
//    println(t)
    assert(t.isRight)
    val tokens=t.right.get
    assertResult(assertLength)(t.right.get.length)
    tokens
}
  
test("org") {
     val program = "org 1000h"
    val tokens=getTokens(program, 3)
}           
test("unary") {
  
     val program ="pushf" 
     val tokens=getTokens(program, 2)
     
     getTokens("end", 2)
     getTokens("end  ", 2)
}
                
test("vardef") {
     val program = "variable dw  3"
     val tokens=getTokens(program, 4)
}

test("vardef when name has instruction prefix") {
     val program = " pushfull  dw 3 "
     val tokens=getTokens(program, 4)
}

test("vardef when name has register prefix") {
     val program = " clito  dw 3 "
     val tokens=getTokens(program, 4)
}

test("literal") {
     val program = "  3 "
     val tokens=getTokens(program, 2)
}
test("expression") {
     val program = " 3 + 2 "
     val tokens=getTokens(program, 4)
}

test("binary values") {
     val program = "10101010b"
     val tokens=getTokens(program, 2)
     
}


}

  