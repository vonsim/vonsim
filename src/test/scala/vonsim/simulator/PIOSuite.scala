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

class PIOSuite extends FunSuite {
  
    def simulator(program:String)={
    val compilation= Compiler(program)
    if (compilation.isLeft) println(compilation)
    assert(compilation.isRight)
    val c=compilation.right.get
    Simulator(c)
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
    assertResult(s.devController.readIO(50))(Word(255))
    
    s.stepInstruction() // MOV AL, 0
    s.stepInstruction() // OUT CB, AL
    assertResult(s.devController.readIO(51))(Word(0))
    
    s.devController.writeIO(48, Word(0))
    
    s.stepInstruction() // POLL: MOV al, 0
    s.devController.config.toggleKeyBit(1) // Key 1 pressed
    s.stepInstruction() // IN AL, PA
    s.stepInstruction() // OUT PB, AL
    assertResult(1)(s.devController.readIO(49).bit(1))
    s.stepInstruction() // JMP POLL
    
    s.stepInstruction() // POLL: MOV al, 0
    s.devController.config.toggleKeyBit(1) // Key 1 pressed again
    s.stepInstruction() // IN AL, PA
    s.stepInstruction() // OUT PB, AL
    assertResult(0)(s.devController.readIO(49).bit(1))
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
   var timePassed = 0
   s.devController.setConfig(1)
   val tickTime = 8000
   s.devController.setPrinterTickTime(tickTime)
   s.stepInstruction(timePassed) // MOV AL, 0FDH
   s.stepInstruction(timePassed) // OUT PIO+2, AL
   s.stepInstruction(timePassed) // MOV AL, 0
   s.stepInstruction(timePassed) // OUT PIO+3, AL
   s.stepInstruction(timePassed) // IN AL, PIO
   s.stepInstruction(timePassed) // AND AL, 0FDH
   s.stepInstruction(timePassed) // OUT PIO, AL
   s.stepInstruction(timePassed) // MOV BX, OFFSET MSJ
   s.stepInstruction(timePassed) // MOV CL, OFFSET FIN-OFFSET MSJ
   
   
   for (i <- 1 to 28) {
     
     // Lee Busy y se queda en el lazo mientras sea 1. (ocupada)
     s.stepInstruction(timePassed) // POLL:	MOV AL, 0
     s.stepInstruction(timePassed) // IN AL, PIO
     s.stepInstruction(timePassed) // AND AL, 1
     s.stepInstruction(timePassed) // JNZ POLL
     // Mando al puerto de datos (PB) el carácter a imprimir
     s.stepInstruction(timePassed) // MOV AL, [BX]
     s.stepInstruction(timePassed) // OUT PIO+1, AL
     // Fuerzo Strobe a 1
     s.stepInstruction(timePassed) // IN AL, PIO
     s.stepInstruction(timePassed) // OR AL, 02H
     // TODO put it back
//     assertResult(false)(s.devController.strategie.getStrobePulse())
     s.stepInstruction(timePassed) // OUT PIO, AL
     assertResult(true)(s.devController.config.getStrobePulse())
     timePassed = tickTime  * i

//     println(s"$i - time passed: $timePassed")
     assertResult(true)(s.devController.config.isPrinting())
     
     s.stepInstruction(timePassed) // IN AL, PIO
//     println("TickTime" + s.devController.config.getPrinterTickTime())
     assertResult(false)(s.devController.config.isPrinting())
     s.stepInstruction(timePassed) // AND AL, 0FDH
     s.stepInstruction(timePassed) // OUT PIO, AL
     // Siguiente caracter
     s.stepInstruction(timePassed) // INC BX
     s.stepInstruction(timePassed) // DEC CL
     s.stepInstruction(timePassed) // JNZ POLL
   }
   assertResult("ARQUITECTURA DE COMPUTADORAS")(s.devController.config.getPrintedText())
   s.stepInstruction(timePassed) // INT 0
   assert(s.cpu.halted)
  }
   
}