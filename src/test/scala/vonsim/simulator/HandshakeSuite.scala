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

class HandshakeSuite extends FunSuite {
  
    def simulator(program:String)={
    val compilation= Compiler(program)
    if (compilation.isLeft) println(compilation)
    assert(compilation.isRight)
    val c=compilation.right.get
    Simulator(c)
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
    
   val message="UNIVERSIDAD NACIONAL DE LA PLATA"
   def hsIntPrinter = 
s"""
  PIC EQU 20H
  HAND EQU 40H
  N_HND EQU 10
  
  ORG 40
  IP_HND	DW RUT_HND
  
  ORG 1000H
  MSJ	DB "$message"
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
   test("Handshake + Printer / Interruptions Simple") {
    val s=simulator(hsIntPrinter)
    
    s.devController.setConfig(2)
    val printerSpeed = 2000
    s.devController.setPrinterTickTime(printerSpeed)
    
    var time = 0
    while (! s.cpu.halted){
      s.stepInstruction(time)
      time+=printerSpeed
    }
    assertResult(message)(s.devController.config.getPrintedText())
   }
//   test("Handshake + Printer / Interruptions") {
//     
//    val s=simulator(hsIntPrinter)
//    var timePassed = 0
//    s.devController.setConfig(2)
//    val printerSpeed = 2000
//    s.devController.setPrinterTickTime(printerSpeed)
//    s.stepInstruction(timePassed) // MOV BX, OFFSET MSJ
//    s.stepInstruction(timePassed) // MOV CL, OFFSET FIN-OFFSET MSJ
//    s.stepInstruction(timePassed) // CLI
//    s.stepInstruction(timePassed) // MOV AL, 0FBH
//    s.stepInstruction(timePassed) // OUT PIC+1, AL
//    s.stepInstruction(timePassed) // MOV AL, N_HND
//    s.stepInstruction(timePassed) // OUT PIC+6, AL
//    s.stepInstruction(timePassed) // MOV AL, 80H
//    s.stepInstruction(timePassed) // OUT HAND+1, AL
//    s.stepInstruction(timePassed) // STI
//
//    for (i <- 1 to 31) {
//      s.stepInstruction(timePassed) // RUT_HND:PUSH AX
//      s.stepInstruction(timePassed) // MOV AL, [BX]
//      s.stepInstruction(timePassed) // OUT HAND, AL
//      timePassed += printerSpeed 
//      s.stepInstruction(timePassed) // INC BX
//      s.stepInstruction(timePassed) // DEC CL
//      s.stepInstruction(timePassed) // JNZ CONT
//      s.stepInstruction(timePassed) // CONT:	MOV AL, 20H
//      s.stepInstruction(timePassed) // OUT PIC, AL
//      s.stepInstruction(timePassed) // OUT PIC, AL
//    }
//    
//    s.stepInstruction(timePassed) // RUT_HND:PUSH AX
//    s.stepInstruction(timePassed) // MOV AL, [BX]
//    s.stepInstruction(timePassed) // OUT HAND, AL
//    timePassed += printerSpeed
//    s.stepInstruction(timePassed) // INC BX
//    s.stepInstruction(timePassed) // DEC CL
//    s.stepInstruction(timePassed) // JNZ CONT
//    s.stepInstruction(timePassed) // MOV AL, 0FFH
//    s.stepInstruction(timePassed) // OUT PIC+1, AL
//    s.stepInstruction(timePassed) // CONT:	MOV AL, 20H
//    s.stepInstruction(timePassed) // OUT PIC, AL
//        
//    
//    var cont = 0
//    while((!s.cpu.halted) && (cont < 1000)) {
//      s.stepInstruction()
//      cont += 1
//    }
//    assert(s.cpu.halted)
//    
//    assertResult(message)(s.devController.config.getPrintedText())
//  }
}