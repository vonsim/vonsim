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
     timePassed = 8000 * i
     // Fuerzo Strobe a 0
     assertResult(true)(s.devController.config.isPrinting())
     s.stepInstruction(timePassed) // IN AL, PIO
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
   
   
   test("Handshake + Printer / Polling") {
     val program = 
"""
  HAND EQU 40H
  
  ORG 1000H
  MSJ	DB "FACULTAD DE "
  	DB "INFORMATICA"
  FIN	DB ?
  
  ORG 2000H
  	IN AL, HAND+1
  	AND AL, 7FH
  	OUT HAND+1, AL
  	MOV BX, OFFSET MSJ
  	MOV CL, OFFSET FIN-OFFSET MSJ
  POLL:	MOV AL, 0
  IN AL, HAND+1
  	AND AL, 1
  	JNZ POLL
  	MOV AL, [BX]
  	OUT HAND, AL
  	INC BX
  	DEC CL
  	JNZ POLL
  	INT 0
  END
"""
    val s=simulator(program)
    var timePassed: Long = 0
    s.devController.setConfig(2)
  	
    s.stepInstruction(timePassed) // IN AL, HAND+1
  	s.stepInstruction(timePassed) // AND AL, 7FH
  	s.stepInstruction(timePassed) // OUT HAND+1, AL
  	
  	s.stepInstruction(timePassed) // MOV BX, OFFSET MSJ
  	s.stepInstruction(timePassed) // MOV CL, OFFSET FIN-OFFSET MSJ
  	
    for (i <- 1 to 23) {
      // Lee Busy y se queda en el lazo mientras sea 1. (ocupada)
      s.stepInstruction(timePassed) // POLL:	MOV AL, 0
      s.stepInstruction(timePassed) // IN AL, HAND+1
      s.stepInstruction(timePassed) // AND AL, 1
      s.stepInstruction(timePassed) // JNZ POLL
    	
    	// Mando al puerto de datos (PB) el carácter a imprimir
      s.stepInstruction(timePassed) // MOV AL, [BX]
    	s.stepInstruction(timePassed) // OUT HAND, AL
      
      timePassed = 8000 * i
    	
    	// Siguiente caracter
    	s.stepInstruction(timePassed) // INC BX
    	s.stepInstruction(timePassed) // DEC CL
  	  s.stepInstruction(timePassed)
    }
  	
     
    assertResult("FACULTAD DE INFORMATICA")(s.devController.config.getPrintedText())
  	s.stepInstruction(timePassed) // INT 0
    assert(s.cpu.halted)
  }

   test("Handshake + Printer / Interruptions") {
     val program = 
"""
  PIC EQU 20H
  HAND EQU 40H
  N_HND EQU 10
  
  ORG 40
  IP_HND	DW RUT_HND
  
  ORG 1000H
  MSJ	DB "UNIVERSIDAD "
      DB "NACIONAL DE LA PLATA"
  FIN	DB ?
  
  ORG 3000H
  RUT_HND: PUSH AX
  	MOV AL, [BX]
  	OUT HAND, AL
  	INC BX
  	DEC CL
  	JNZ CONT
  	MOV AL, 0FFH
  	OUT PIC+1, AL
  CONT:	MOV AL, 20H
  	OUT PIC, AL
  	POP AX
  	IRET
  
  ORG 2000H
  	MOV BX, OFFSET MSJ
  	MOV CL, OFFSET FIN-OFFSET MSJ
  	CLI
  	MOV AL, 0FBH
  	OUT PIC+1, AL
  	MOV AL, N_HND
  	OUT PIC+6, AL
  	MOV AL, 80H
  	OUT HAND+1, AL
  	STI
  LAZO:	CMP CL, 0
  	JNZ LAZO
  	IN AL, HAND+1
  	AND AL, 7FH
  	OUT HAND+1, AL
  	INT 0
  END
"""
    val s=simulator(program)
    var timePassed = 0
    s.devController.setConfig(2)
    
    s.stepInstruction(timePassed) // MOV BX, OFFSET MSJ
    s.stepInstruction(timePassed) // MOV CL, OFFSET FIN-OFFSET MSJ
    s.stepInstruction(timePassed) // CLI
    s.stepInstruction(timePassed) // MOV AL, 0FBH
    s.stepInstruction(timePassed) // OUT PIC+1, AL
    s.stepInstruction(timePassed) // MOV AL, N_HND
    s.stepInstruction(timePassed) // OUT PIC+6, AL
    s.stepInstruction(timePassed) // MOV AL, 80H
    s.stepInstruction(timePassed) // OUT HAND+1, AL
    s.stepInstruction(timePassed) // STI

    for (i <- 1 to 31) {
      s.stepInstruction(timePassed) // RUT_HND:PUSH AX
      s.stepInstruction(timePassed) // MOV AL, [BX]
      s.stepInstruction(timePassed) // OUT HAND, AL
      timePassed += 8000
      s.stepInstruction(timePassed) // INC BX
      s.stepInstruction(timePassed) // DEC CL
      s.stepInstruction(timePassed) // JNZ CONT
      s.stepInstruction(timePassed) // CONT:	MOV AL, 20H
      s.stepInstruction(timePassed) // OUT PIC, AL
    }
    
    s.stepInstruction(timePassed) // RUT_HND:PUSH AX
    s.stepInstruction(timePassed) // MOV AL, [BX]
    s.stepInstruction(timePassed) // OUT HAND, AL
    timePassed += 8000
    s.stepInstruction(timePassed) // INC BX
    s.stepInstruction(timePassed) // DEC CL
    s.stepInstruction(timePassed) // JNZ CONT
    s.stepInstruction(timePassed) // MOV AL, 0FFH
    s.stepInstruction(timePassed) // OUT PIC+1, AL
    s.stepInstruction(timePassed) // CONT:	MOV AL, 20H
    s.stepInstruction(timePassed) // OUT PIC, AL

    assertResult("UNIVERSIDAD NACIONAL DE LA PLATA")(s.devController.config.getPrintedText())
    
    var cont = 0
    while((!s.cpu.halted) && (cont < 1000)) {
      s.stepInstruction()
      cont += 1
    }
    assert(s.cpu.halted)
  }
}