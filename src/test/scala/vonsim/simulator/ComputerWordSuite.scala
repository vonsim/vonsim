package vonsim.simulator

import org.scalatest.FunSuite
import Simulator._
import ComputerWord._


class DWordSuite extends FunSuite {
  val alu=new ALU()
  
  test("DWord creation with strings") {
    val w=DWord("0000000100000001")
    assertResult(257)(w.toInt)
    val v=DWord("1111111111111111")
    assertResult(-1)(v.toInt)
  }
  test("Flags off when numbers are small and positive") {
    val w=DWord(300)
    val v=DWord(400)
    
    val (r1,flags)= alu.arithmeticDWord(ADD,w,v)
    assertResult(700)(r1.toInt)
    assert(!flags.z)
    assert(!flags.s)
    assert(!flags.o)
    assert(!flags.c)
    
  }
  test("0+0, z=1") {
    val w=DWord(0)
    val v=DWord(0)
    val (r1,flags)= alu.arithmeticDWord(ADD,w,v)
    assert(r1.toInt==0)
    assert(flags.z)
    assert(!flags.s)
    assert(!flags.o)
    assert(!flags.c)
  }
  test("20+(-20)==0, z=1") {
    val w=DWord(20)
    val v=DWord(-20)
    val (r1,flags)= alu.arithmeticDWord(ADD,w,v)
    assert(r1.toInt==0)
    assert(flags.z)
    assert(!flags.s)
    assert(!flags.o)
    assert(flags.c)
  }
  
  test("32767+1==-32768 ==65536u, c=0,s=1,o=1") {
    val w=DWord(32767)
    val v=DWord(1)
    val (r1,flags)= alu.arithmeticDWord(ADD,v,w)
    assertResult(r1.toInt)(-32768)
    assert(!flags.z)
    assert(flags.s)
    assert(flags.o)
    assert(!flags.c)
  }
  
  test("32767 + (-5) =32762 , c=1,s=0,o=0") {
    val w=DWord(32767)
    val v=DWord(-5)
    val (r1,flags)= alu.arithmeticDWord(ADD,w,v)
    assertResult(r1.toInt)(32762)
    assert(!flags.z)
    assert(!flags.s)
    assert(!flags.o)
    assert(flags.c)
  }
  
  test("signed unsigned conversions"){ assertResult(127)(unsignedToSignedByte(127))
    assertResult(0)(signedToUnsignedShort(0))
    assertResult(0)(unsignedToSignedShort(0))
    assertResult(127)(signedToUnsignedShort(127))
    assertResult(16767)(signedToUnsignedShort(16767))
    assertResult(-32768)(unsignedToSignedShort(32768))
    assertResult(65535)(signedToUnsignedShort(-1)) 
    assertResult(65531)(signedToUnsignedShort(-5))
    assertResult(-1)(unsignedToSignedShort(65535))
  }
  
  test("int dword conversions"){ assertResult(127)(unsignedToSignedByte(127))
    assertResult(DWord(0,0))(DWord(0))
    assertResult(DWord(7,0))(DWord(7))
    assertResult(DWord(0,1))(DWord(256))
    assertResult(DWord(255.toByte,0))(DWord(255))
    assertResult(DWord(255.toByte,127))(DWord(32767))
    assertResult(DWord(255.toByte,255.toByte))(DWord(-1))
    assertResult(DWord(0,128.toByte))(DWord(-32768))
    
    assertResult(0)(DWord(0,0).toInt)
    assertResult(7)(DWord(7,0).toInt)
    assertResult(256)(DWord(0,1).toInt)
    assertResult(255)(DWord(255.toByte,0).toInt)
    assertResult(32767)(DWord(255.toByte,127).toInt)
    assertResult(-1)(DWord(255.toByte,255.toByte).toInt)
    assertResult(-32768)(DWord(0,128.toByte).toInt)
    
  }
  
  test("bit access") {
    
    val z=DWord(0)
    val w=DWord(127)
    val x=DWord(64)
    val v=DWord(-1)
    
    assertResult(IndexedSeq.fill(16)(0))(z.toBits)
    assertResult(IndexedSeq(1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0))(w.toBits)
    assertResult(IndexedSeq(0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0))(x.toBits)
    assertResult(IndexedSeq(0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0))(DWord(16).toBits)
    assertResult(IndexedSeq.fill(16)(1))(v.toBits)
    assertResult(IndexedSeq(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1))(DWord(-32768).toBits)
    
    assertResult(-32768)(IndexedSeq(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1).toDWord.toInt)
    assertResult(65)(IndexedSeq(1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0).toDWord.toInt)
  }
}
  class WordSuite extends FunSuite {
    
    
  test("Word creation with strings") {
    val w=Word("01000001")
    assertResult(65)(w.toInt)
    val v=Word("11111111")
    assertResult(-1)(v.toInt)
  }
    
  val alu=new ALU()
  
  
  test("Flags off when numbers are small and positive") {
    val w=25.toByte
    val v=29.toByte
    val (r1,flags)= alu.performALUArithmetic(ADD,w,v)
    assert(r1.toInt==54)
    assert(!flags.z)
    assert(!flags.s)
    assert(!flags.o)
    assert(!flags.c)
    
  }
  test("0+0, z=1") {
    val w=0.toByte
    val v=0.toByte
    val (r1,flags)= alu.performALUArithmetic(ADD,w,v)
    assert(r1.toInt==0)
    assert(flags.z)
    assert(!flags.s)
    assert(!flags.o)
    assert(!flags.c)
  }
  test("20+(-20)==0, z=1") {
    val w=20.toByte
    val v=(-20).toByte
    val (r1,flags)= alu.performALUArithmetic(ADD,w,v)
    assert(r1.toInt==0)
    assert(flags.z)
    assert(!flags.s)
    assert(!flags.o)
    assert(flags.c)
  }
  
  test("127+1==-128 ==128u, c=0,s=1,o=1") {
    val w=127.toByte
    val v=1.toByte
    val (r1,flags)= alu.performALUArithmetic(ADD,v,w)
    assertResult(r1.toInt)(-128)
    assert(!flags.z)
    assert(flags.s)
    assert(flags.o)
    assert(!flags.c)
  }
  
  test("127+ (-5)== 127+(251u)==122, c=1,s=0,o=0") {
    val w=127.toByte
    val v=(-5).toByte
    val (r1,flags)= alu.performALUArithmetic(ADD,w,v)
    assertResult(r1.toInt)(122)
    assert(!flags.z)
    assert(!flags.s)
    assert(!flags.o)
    assert(flags.c)
  }
  
  test("signed unsigned conversions"){ assertResult(127)(unsignedToSignedByte(127))
    assertResult(0)(signedToUnsignedByte(0))
    assertResult(0)(unsignedToSignedByte(0))
    assertResult(127)(signedToUnsignedByte(127))
    assertResult(-128)(unsignedToSignedByte(128))
    assertResult(255)(signedToUnsignedByte(-1)) 
    assertResult(251)(signedToUnsignedByte(-5))
    assertResult(-1)(unsignedToSignedByte(255))
  }
  
  test("bit access") {
    val w=127.toByte
    val v=(-1).toByte
    val z=0.toByte
    val x=64.toByte

    
    assertResult(IndexedSeq(0,0,0,0,0,0,0,0))(z.toBits)
    assertResult(IndexedSeq(1,1,1,1,1,1,1,0))(w.toBits)
    assertResult(IndexedSeq(0,0,0,0,0,0,1,0))(x.toBits)
    assertResult(IndexedSeq(0,0,0,0,1,0,0,0))(16.toByte.toBits)
    assertResult(IndexedSeq(1,1,1,1,1,1,1,1))(v.toBits)
    assertResult(IndexedSeq(0,0,0,0,0,0,0,1))(-128.toByte.toBits)
    
    assertResult(-128)(IndexedSeq(0,0,0,0,0,0,0,1).toByte)
    assertResult(65)(IndexedSeq(1,0,0,0,0,0,1,0).toByte)
  }
   
}