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
    s.resumeExecution('A'.toInt)
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
    assertResult("ARQUITECTURA DE COMPUTADORAS-FACULTAD DE INFORMATICA-UNLP")(s.devController.monitor.getText())
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

   test("PIO + LEDS + LIGHTS") {
     val program = 
"""
  PA EQU 30H
  PB EQU 31H
  CA EQU 32H
  CB EQU 33H
  
  ORG 2000H
    MOV AL, 0FFH
    OUT CA, AL
    MOV AL, 0
    OUT CB, AL
  POLL: MOV al, 0
    IN AL, PA
    OUT PB, AL
    JMP POLL
  END
"""
    val s=simulator(program)
    s.stepInstruction() // MOV AL, 0FFH
    s.stepInstruction() // OUT CA, AL
    assertResult(s.devController.pio.readIO(50))(Word(255))
    
    s.stepInstruction() // MOV AL, 0
    s.stepInstruction() // OUT CB, AL
    assertResult(s.devController.pio.readIO(51))(Word(0))
    
    s.devController.pio.writeIO(48, Word(0))
    
    s.stepInstruction() // POLL: MOV al, 0
    s.devController.keys.toggleBit(1) // Key 1 pressed
    s.stepInstruction() // IN AL, PA
    s.stepInstruction() // OUT PB, AL
    assertResult(1)(s.devController.leds.PB.bit(1))
    s.stepInstruction() // JMP POLL
    
    s.stepInstruction() // POLL: MOV al, 0
    s.devController.keys.toggleBit(1) // Key 1 pressed again
    s.stepInstruction() // IN AL, PA
    s.stepInstruction() // OUT PB, AL
    assertResult(0)(s.devController.leds.PB.bit(1))
  }

   test("PIO + Printer") {
     val program = 
"""
PIO EQU 30H

ORG 1000H
MSJ	DB "ARQUITECTURA DE "
	DB "COMPUTADORAS"
FIN	DB ?

ORG 2000H
	; CA = 1111 1101 -> B= Entrada S=Salida
	MOV AL, 0FDH
	OUT PIO+2, AL

	; CB = 0000 0000 -> PB = Salida
	MOV AL, 0
	OUT PIO+3, AL

	; Fuerza Strobe a 0
	IN AL, PIO
	AND AL, 0FDH
	OUT PIO, AL

	; Inicializo BX y CL
	MOV BX, OFFSET MSJ
	MOV CL, OFFSET FIN-OFFSET MSJ

POLL:	MOV AL, 0

	; Lee Busy y se queda en el lazo mientras sea 1. (ocupada)
	IN AL, PIO
	AND AL, 1
	JNZ POLL

	; Mando al puerto de datos (PB) el carácter a imprimir
	MOV AL, [BX]
	OUT PIO+1, AL

	; Fuerzo Strobe a 1
	IN AL, PIO
	OR AL, 02H
	OUT PIO, AL

	; Fuerzo Strobe a 0
	IN AL, PIO
	AND AL, 0FDH
	OUT PIO, AL

	; Siguiente caracter
	INC BX
	DEC CL
	JNZ POLL

	INT 0
END"""
    val s=simulator(program)
//    s.devController.setConfig(1)
//    s.stepInstruction()
//    s.stepInstruction()
//    s.stepInstruction()
//    s.stepInstruction()
//    s.stepInstruction()
//    
//    s.stepInstruction()
//    s.stepInstruction()
//    s.stepInstruction()
//    s.stepInstruction()
//    s.stepInstruction()
//    
//    // Lee Busy y se queda en el lazo mientras sea 1. (ocupada)
//    s.stepInstruction()
//    s.stepInstruction()
//    s.stepInstruction()
//    
//    // Mando al puerto de datos (PB) el carácter a imprimir
//    s.stepInstruction()
//    s.stepInstruction()
//    
//    // Fuerzo Strobe a 1
//    s.stepInstruction() // IN AL, PIO
//    s.stepInstruction() // OR AL, 02H
//    println("strobePulse: " + s.devController.printer.strobePulse)
//    s.stepInstruction() // OUT PIO, AL
//    println("strobePulse: " + s.devController.printer.strobePulse)
//    
//    assertResult(true)(s.devController.printerConnection.isPrinting())
//    assertResult('A')(s.devController.printer.getPrintedText())
//    assertResult(false)(s.devController.printerConnection.isPrinting())
//    
//    // Fuerzo Strobe a 0
//    s.stepInstruction()
//    println("strobePulse: " + s.devController.printer.strobePulse)
//    s.stepInstruction()
//    println("isPrinting: " + s.devController.printerConnection.isPrinting())
//    s.stepInstruction()
//    println("isPrinting: " + s.devController.printerConnection.isPrinting())
//    println("Printed: " + s.devController.printer.getPrintedText())    
//    println("isPrinting: " + s.devController.printerConnection.isPrinting())
//    // Siguiente caracter
//    s.stepInstruction()
//    s.stepInstruction()
//    s.stepInstruction()
  }
   
   test("STI and CLI") {
     val program = 
"""
  ORG 2000H
    CLI
    NOP
    NOP
    NOP
    NOP
    NOP
    STI
    NOP
    HLT
  END
"""
    val s=simulator(program)
    s.stepInstruction()
    assertResult(false)(s.cpu.acceptInterruptions)
    s.stepInstruction()
    s.devController.pic.picInterruption(0)
    assertResult(Word(1))(s.devController.pic.IRR)
    s.stepInstruction()
    assertResult(Word(0))(s.devController.pic.IRR)
    s.stepInstruction()
    s.stepInstruction()
    s.stepInstruction()
    assertResult(Word(1))(s.devController.pic.ISR)
    assertResult(true)(s.devController.pic.isPendingInterruption())
    s.stepInstruction()
    assertResult(true)(s.cpu.acceptInterruptions)
    s.stepInstruction()
    assertResult(false)(s.devController.pic.isPendingInterruption())
  }
   
   test("Handshake + Printer / Polling") {
     val program = 
"""
  ORG 2000H
    HLT
  END
"""
    val s=simulator(program)
  }

   test("Handshake + Printer / Interruptions") {
     val program = 
"""
  ORG 2000H
    HLT
  END
"""
    val s=simulator(program)
  }
}