package vonsim.simulator
import vonsim.utils.CollectionUtils._
import org.scalatest.FunSuite
import Simulator._
import ComputerWord._
import com.sun.org.apache.bcel.internal.generic.ArithmeticInstruction
import vonsim.assembly.Compiler
import vonsim.assembly.Compiler.SuccessfulCompilation
import scala.io.Source
import com.sun.xml.internal.bind.v2.runtime.RuntimeUtil.ToStringAdapter
import org.scalatest.enablers.Length


//import vonsim.assembly.lexer.Lexer


class NewLexerSuite extends FunSuite {

  def getTokens(program: String, assertLength: Int) = {
    val tokens = Tokenizer(program,0)
    println(tokens.mkString(" | "))
    assertResult(assertLength)(tokens.length)
    tokens
  }

  test("binary") {
    val program = "asd:  mov   ax,  50 "
    val tokens = getTokens(program, 6)
    val texts = tokens.map(_.text)
    assertResult(List("asd",":","mov","ax",",","50"))(texts)
  }
  
   test("label") {
    val program = "asd:  mov   ax,  50 "
    val tokens = getTokens(program, 6)
//    val parsed = Parser(tokens)
//    val texts = tokens.map(_.text)
//    assertResult(List("asd",":","mov","ax",",","50"))(texts)
  }
  

}

  