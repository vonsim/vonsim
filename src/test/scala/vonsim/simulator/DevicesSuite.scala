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

class DevicesSuite extends FunSuite {
  
    def simulator(program:String)={
    val compilation= Compiler(program)
    if (compilation.isLeft) println(compilation)
    assert(compilation.isRight)
    val c=compilation.right.get
    Simulator(c)
  }
  
  
   test("INT 6 - Key entry") {
     val program = 
"""
  ORG 1000H
    NUM DB ?
  
  ORG 2000H
    MOV BX, OFFSET NUM
    INT 6
    INT 0
  END
"""
    val s=simulator(program)
    val base1=0x1000
    s.stepInstruction()
    s.stepInstruction()
    s.inputChar('A'.toInt)
    assertResult('A')(s.memory.getByte(base1).toInt.toChar)
  }

   test("INT 7 - Monitor") {
     val program = 
"""
  ORG 1000H
    MSJ DB "ARQUITECTURA DE COMPUTADORAS-"
  	DB "FACULTAD DE INFORMATICA-"
  	DB 55H
  	DB 4EH
  	DB 4CH
  	DB 50H
  FIN DB ?
  
  ORG 2000H
  	MOV BX, OFFSET MSJ
  	MOV AL, OFFSET FIN-OFFSET MSJ
  	INT 7
  	INT 0
  END
"""
    val s=simulator(program)
    s.stepInstruction()
    s.stepInstruction()
    s.stepInstruction()
    
    assertResult("ARQUITECTURA DE COMPUTADORAS-FACULTAD DE INFORMATICA-UNLP")(s.devController.config.getMonitorText())
    
  }

   test("Int 0 - Halt") {
     val program = 
"""
  ORG 2000H
    INT 0
  END
"""
    val s=simulator(program)
    s.stepInstruction()
    assert(s.cpu.halted)
  }

   
   test("STI and CLI") {
     val program = 
"""
  ORG 2000H
    CLI
    NOP
    STI
    NOP
    CLI
    HLT
  END
"""
    val s=simulator(program)
    assertResult(true)(s.cpu.acceptInterruptions)
    s.stepInstruction() // CLI
    assertResult(false)(s.cpu.acceptInterruptions)
    
    s.stepInstruction() // NOP
    s.stepInstruction() // STI
    assertResult(true)(s.cpu.acceptInterruptions)
    s.stepInstruction() // NOP
    s.stepInstruction() // CLI
    assertResult(false)(s.cpu.acceptInterruptions)
    s.stepInstruction() // HLT
  }
   
   
   test("IRR and ISR") {
     val program = 
"""
  ORG 2000H
    NOP
    NOP
    HLT
  END
"""
    val s=simulator(program)
    
    s.stepInstruction() // NOP    
    s.devController.config.pic.requestInterrupt(0)
    assertResult(Word(1))(s.devController.config.pic.IRR)
    assertResult(Word(0))(s.devController.config.pic.ISR)
    s.devController.config.pic.requestInterrupt(1)
    assertResult(Word(3))(s.devController.config.pic.IRR)
    assertResult(Word(0))(s.devController.config.pic.ISR)
  }
 
}