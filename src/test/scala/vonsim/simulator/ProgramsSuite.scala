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


class ProgramsSuite extends FunSuite {
  
  
  
  def simulator(program:String)={
    val compilation= Compiler(program)
    if (compilation.isLeft) println(compilation)
    assert(compilation.isRight)
    val c=compilation.right.get
    Simulator(c)
  }
  
  
   test("vardef") {
     val program = 
"""
  org 1000h
  vardb db 1
  
  org 1500h
  vardb2 db 2
  vardw dw 20
  vardw2 dw 24
  
  org 2000h
  hlt  
  end
"""
    val s=simulator(program)
    val base1=0x1000
    val base2=0x1500
    assertResult(1)(s.memory.getByte(base1).toInt)
    assertResult(2)(s.memory.getByte(base2).toInt)
    assertResult(20)(s.memory.getByte(base2+1).toInt)
    assertResult(0)(s.memory.getByte(base2+2).toInt)
    assertResult(24)(s.memory.getByte(base2+3).toInt)
    assertResult(0)(s.memory.getByte(base2+4).toInt)
    s.stepInstruction()
    assert(s.cpu.halted)
  }
      test("push pop") {

     val program = 
"""
  org 2000h
  mov ax,3
  push ax
  pop bx
  hlt  
  end
"""
    val s=simulator(program)
    s.stepInstruction()
    assertResult(3)(s.cpu.get(AX).toInt)
    val sp=s.cpu.sp
    s.stepInstruction()
    assertResult(sp-2)(s.cpu.sp)
    s.stepInstruction()
    assertResult(3)(s.cpu.get(BX).toInt)
    assertResult(sp)(s.cpu.sp)
    s.stepInstruction()
    assert(s.cpu.halted)
  }
  
   test("3+2=5 register") {
    val program= 
"""org 2000h
mov ax,3
add ax,2
hlt
end"""
    
    val s=simulator(program)
    s.stepInstruction()
    assertResult(3)(s.cpu.get(AX).toInt)
    s.stepInstruction()
    assertResult(5)(s.cpu.get(AX).toInt)
    s.stepInstruction()
    assert(s.cpu.halted)
  }
  
   test("all syntax supported") {
     val program = 
"""
const EQU 12
const2 EQU  const+1

org 1000h

inta db 1,2,3,4
;intlist2 dw 1,2,3,4
complex db 10000000B,2,34h,4
uninitialized db ?
uninitialized2 dW ?
asd db "hola"
zzz db "chau"
num1 dw 5h
num2 db 3h
res dw ?

org 1500h
vardb db 1
vardw dw 2


    org 2000h
mov ax, bx
    MOV ax, bx
    mov  AX, bX
    mov  CX, Dx
    mov  ax, bx
    mov  ax, bx   
    mov     ax, bx
    mov  ax   , bx
    mov  ax,bx
hola: mov ax, bx
    mov [bx],ax
    mov ax, 2
    mov ax, -25
HOLA:    mov ax, 25AH
    mov ax, 25Ah
    mov ax, 10001111B
    not ax
    add ax, bx
    add ax, 3
    add ax, 26h
    adc ax, 26h
    xor ax, 26h
    cmp ax, 26h
    mov ax,sp
    mov vardb,1
    mov al,vardb
    mov ax,vardw
    mov vardw,4
;    in al,PIC ; not implemented yet!
;    in al,123 ; not implemented yet!
;    out ax,dx ; not implemented yet!

    mov ax,num1
	mov ax,num2
	mov ax,(2+3)-5+offset res
	mov ax,num2+3
	mov ax,offset num2+3
	mov ax,const+2
	mov ax,const2+num2+offset num2
	mov bx, offset num1
	mov [bx],ax
	mov [bx],al
	mov WORD PTR [bx],2
	mov BYTE PTR [bx],255
    jc hola
    
org 1000


JMP HOLA
JC HOLA
CALL HOLA
RET
NOP
HLT
CLI 
StI 
ret
pushf
popf
push ax
pop bx
pop cx
int 4
hlt

END
"""
    //val r=Source.fromURL(getClass.getResource("/assembly/all_syntax.asm")).bufferedReader()
    
    val compilation= Compiler(program)
//    println(compilation)
    val s=simulator(program)
    
  }
   
  test("3+2=5 mem reg") {
    val program= 
"""
org 1000h
var dw 2  
  org 2000h
mov ax,3
add ax,var
hlt
end"""
    
    val s=simulator(program)
    assertResult(2)(s.memory.getBytes(0x1000).toInt)
    s.stepInstruction()
    assertResult(3)(s.cpu.get(AX).toInt)
    s.stepInstruction()
    assertResult(5)(s.cpu.get(AX).toInt)
    s.stepInstruction()
    assert(s.cpu.halted)
  }
  
   test("sum naturals") {
//     println("PROGRAM sum naturals")
     val program = 
"""
  org 2000h
      mov al,0
      add cl,8
loop: cmp cl,0
      jz fin  
      add al,cl
      dec cl
      jmp loop
fin:  hlt  
  end
"""
    
    val s=simulator(program)
    
    s.runInstructions()
    assertResult(8+7+6+5+4+3+2+1)(s.cpu.get(AL).toInt)
    assert(s.cpu.halted)
  }
     test("mult") {
//      println("PROGRAM mult")
   val program="""
  org 1000h
; mult receives number a in AX and b in CX
; returns result in dx
mult: push cx
      mov dx,0
loop_mult: cmp cx,0
      jz fin_mult  
      add dx,ax
      dec cx
      jmp loop_mult
fin_mult: pop cx
         ret 
 
org 2000h
mov ax,3
mov cx,5
call mult
hlt
end

"""    
    
//   println(Lexer(program))
    
    val s=simulator(program)
    val instructions=s.runInstructions().toList
    
//    val compiledInstructionsAddresses=s.instructions.keys.toList.sorted
//    println(compiledInstructionsAddresses.map(a => Simulator.encode(s.instructions(a).instruction)).mkString("\n"))
   
    assertResult(15)(s.cpu.get(DX).toInt)
    assertResult(0x200E)(s.cpu.ip)
    assert(s.cpu.halted)
    assert(instructions.allRight)
}
     
    test("factorial") {
//      println("PROGRAM factorial")
     val program = 
"""
  org 1000h
; mult receives number a in AX and b in CX
; returns result in dx
mult: push cx
      mov dx,0
loop_mult: cmp cx,0
      jz fin_mult  
      add dx,ax
      dec cx
      jmp loop_mult
fin_mult:pop cx
         ret  

org 3000h
; fact receives n in cx
; returns result in ax
fact:      mov ax,1
loop_fact: cmp cx,0
           jz fin_fact
           call mult
           mov ax,dx
           dec cx
           jmp loop_fact
fin_fact:  ret
            
org 2000h
mov cx,5
call fact
hlt  
end
"""
    
    val s=simulator(program)    
    s.runInstructions()
    assertResult(5*4*3*2)(s.cpu.get(AX).toInt)
    assert(s.cpu.halted)
  }
   
   test("pushf popf") {
     val program = 
"""
  org 2000h
  mov al,128
  add al,128
  pushf
  add al,1
  popf
  hlt  
  end
"""
    val addFlags=new Flags(true,false,true,true)
    val subFlags=new Flags(false,false,false,false)
    val s=simulator(program)
    
    s.stepInstruction()
    assertResult(Word("10000000"))(s.cpu.get(AL))
    s.stepInstruction()
    
    
    assertResult(addFlags)(s.cpu.alu.flags)
    assertResult(Word("00000000"))(s.cpu.get(AL))
    val sp=s.cpu.sp
    s.stepInstruction()
    assertResult(sp-2)(s.cpu.sp)
    s.stepInstruction()
    assertResult(subFlags)(s.cpu.alu.flags)
    assertResult(Word("00000001"))(s.cpu.get(AL))
    s.stepInstruction()
    assertResult(sp)(s.cpu.sp)
    assertResult(addFlags)(s.cpu.alu.flags)
    s.stepInstruction()
    assert(s.cpu.halted)
  }
   
   test("3+2=5 memory") {
     val program = 
"""
  org 1000h
  var db 1
  
  org 2000h
  mov var,3
  add var,2
  hlt  
  end
"""
    val s=simulator(program)
    assertResult(1)(s.memory.getByte(0x1000).toInt)
    s.stepInstruction()
    assertResult(3)(s.memory.getByte(0x1000).toInt)
    s.stepInstruction()
    assertResult(5)(s.memory.getByte(0x1000).toInt)
    assertResult(new Flags(false,false,false,false))(s.cpu.alu.flags)
    s.stepInstruction()
    assert(s.cpu.halted)
  }
   
  test("double call") {
     val program = 
"""
  org 1000h
f1:  add ax,2
     ret
     
  org 1200h
f2:  call f1
     ret
       
  org 2000h
  mov ax,2
  call f2
  hlt  
  end
"""
    val s=simulator(program)
    
    val sp=s.cpu.sp
    assert(s.stepInstruction().isRight)
    assertResult(DWord(2))(s.cpu.get(AX))
    assert(s.stepInstruction().isRight)
    assertResult(0x1200)(s.cpu.ip)
    assertResult(sp-2)(s.cpu.sp)
    assertResult(DWord(0x2008))(s.memory.getBytes(s.cpu.sp))
    assert(s.stepInstruction().isRight)
    assertResult(0x1000)(s.cpu.ip)
    assertResult(sp-4)(s.cpu.sp)
    assertResult(DWord(0x1203))(s.memory.getBytes(s.cpu.sp))
    assert(s.stepInstruction().isRight)
    assertResult(DWord(4))(s.cpu.get(AX))
    assert(s.stepInstruction().isRight)
    assertResult(0x1203)(s.cpu.ip)
    assertResult(sp-2)(s.cpu.sp)
    assertResult(DWord(0x2008))(s.memory.getBytes(s.cpu.sp))
    assert(s.stepInstruction().isRight)
    assertResult(0x2008)(s.cpu.ip)
    assertResult(sp)(s.cpu.sp)
    assert(s.stepInstruction().isRight)
    assert(s.cpu.halted)
  }
  test("no org should throw error") {
     val program = 
"""
  mov ax,3
  end
"""
    val compilation= Compiler(program)
    assert(compilation.isLeft)
    
  }
  
    test("no end should throw error") {

     val program = 
"""
  org 2000h
  mov ax,3
"""
    val compilation= Compiler(program)
    assert(compilation.isLeft)
    
  }
    
   test("end before last line should throw error") {
     val program = 
"""
  org 2000h
  end
  mov ax,3
"""
    val compilation= Compiler(program)
    assert(compilation.isLeft)
  }


    test("indirect register with immediate value fails if BYTE PTR or WORD PTR not defined") {
     val program = 
"""
  org 2000h
  mov bx,2
  mov [bx],3
  hlt
  end
"""
    val compilation= Compiler(program)
    assert(compilation.isLeft)
}   
    
    test("word ptr and byteptr") {
     val program = 
"""
  org 2000h
  mov bx,2
  mov WORD PTR [bx],3
  mov BYTE PTR [bx],5
  mov ax,6
  mov [bx],ax
  mov al,8
  mov [bx],al
  hlt
  end
"""
//    val compilation= Compiler(program)
//    println(compilation)
//    assert(compilation.isRight)
    val s=simulator(program)
    s.memory.setByte(2, Word(4))
    s.memory.setByte(3, Word(4))
    s.stepInstruction()
    assertResult(DWord(2))(s.cpu.get(BX))
    s.stepInstruction()
    assertResult(DWord(3))(s.memory.getBytes(2))
    s.stepInstruction()
    assertResult(Word(5))(s.memory.getByte(2))
    assertResult(Word(0))(s.memory.getByte(3))
    s.stepInstruction()
    assertResult(DWord(6))(s.cpu.get(AX))
    s.stepInstruction()
    assertResult(DWord(6))(s.memory.getBytes(2))
    s.stepInstruction()
    assertResult(Word(8))(s.cpu.get(AL))
    s.stepInstruction()
    assertResult(Word(8))(s.memory.getByte(2))
    assertResult(Word(0))(s.memory.getByte(3))
    s.stepInstruction()
    assert(s.cpu.halted) 
  }
    
        
   
}

  