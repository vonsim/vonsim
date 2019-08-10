package vonsim.simulator

import scala.collection.mutable.ListBuffer
import scala.collection.mutable
import scala.util.Random
import com.sun.org.apache.bcel.internal.generic.ArithmeticInstruction
import Simulator._
import ComputerWord._
import scala.Equals
import vonsim.assembly.Compiler.MemoryAddress

object Flags {

  def apply(d: DWord)={
    new Flags(d.bit(0).toBoolean, d.bit(1).toBoolean, d.bit(2).toBoolean, d.bit(3).toBoolean)
  }
}
trait Flag
object Flag{
  def all=List(C,O,S,Z)
}

case object C extends Flag
case object O extends Flag
case object S extends Flag
case object Z extends Flag

class Flags(var c: Boolean = false, var s: Boolean = false, var o: Boolean = false, var z: Boolean = false) {
  
  
  def get(f:Flag)={
    f match{
      case C => c
      case O => o
      case S => s
      case Z => z
    }
  }
  def set(f:Flag,v:Boolean)={
    f match{
      case C => c=v
      case O => o=v
      case S => s=v
      case Z => z=v
    }
  }
  def reset() {
    c = false
    s = false
    z = false
    o = false
  }

  def satisfy(cd: Condition) = {
    cd match {
      case JC  => c
      case JNC => !c
      case JO  => o
      case JNO => !o
      case JZ  => z
      case JNZ => !z
      case JS  => s
      case JNS => !s
    }
  }
    def toDWord() = {
      DWord(IndexedSeq(c.toInt, s.toInt, z.toInt, o.toInt).toInt())
    }
    def canEqual(a: Any) = a.isInstanceOf[Flags]
    override def equals(a:Any)={
      a match {
            case a: Flags=> a.c==c && a.z==z && a.o==o && a.s==s
            case _ => false
     }
      
    }
    override def hashCode()={
      c.hashCode()
    }
    override def toString()={
      s"Flags (c,s,z,o)=($c,$s,$z,$o)"
    }
  
}

class ALU {
  var o1 = DWord()
  var o2 = DWord()
  var res = DWord()
  var op: ALUOp = CMP

  var flags = new Flags()

  def reset() { flags.reset() }

  def setOps(op: ALUOp, o1: Word, o2: Word,r:Word,f:Flags) {
    this.setOps(op,o1.toDWord(),o2.toDWord(),r.toDWord(),f)
  }
  def setOps(op: ALUOp, o: Word,r:Word,f:Flags) {
    this.setOps(op,o.toDWord(),r.toDWord(),f)
  }
  def setOps(op: ALUOp, o1: DWord, o2: DWord,r:DWord,f:Flags) {
    this.op = op
    this.o1 = o1
    this.o2 = o2
    this.res=r
    this.flags=f
  }
  def setOps(op: ALUOp, o: DWord,r:DWord,f:Flags) {
    setOps(op,o,DWord(),r,f)
  }

  def applyOp(op: ALUOpUnary, o: DWord): DWord = {
    val (result, newFlags) = op match {
      case au: ArithmeticOpUnary => { arithmeticDWord(au,o) }
      case lu: LogicalOpUnary => { logicalDWord(lu, o)}
    }
    setOps(op, o,result,newFlags)
    result
  }

  def applyOp(op: ALUOpBinary, o1: DWord, o2: DWord): DWord = {

    val (result, newFlags) = op match {
      case ab: ArithmeticOpBinary => { arithmeticDWord(ab, o1, o2, flags.c.toInt) }
      case lb: LogicalOpBinary    => { logicalDWord(lb, o1, o2) }
    }
    setOps(op, o1,o2,result,newFlags)
    result
  }

  def applyOp(op: ALUOpBinary, o1: Word, o2: Word): Word = {
    val (result, newFlags) = op match {
      case ab: ArithmeticOpBinary => { arithmeticWord(ab, o1, o2, flags.c.toInt) }
      case lb: LogicalOpBinary    => { logicalWord(lb, o1, o2) }
    }    
    setOps(op, o1,o2,result,newFlags)
    result
  }

  def applyOp(op: ALUOpUnary, o: Word): Word = {
    val (result, newFlags) = op match {
      case au: ArithmeticOpUnary => { arithmeticWord(au, o) }
      case lu: LogicalOpUnary    => { logicalWord(lu, o) }
    }
    setOps(op, o,result,newFlags)
    result
  }
  
  
  def logicalDWord(op: LogicalOpUnary, w: DWord): (DWord, Flags) = {
    val result = op match {
      case NOT => DWord((~w.toInt))
      case NEG => DWord(-(w.toInt))
    }
    (result, logicalFlags(result.toInt))
  }
  def logicalWord(op: LogicalOpUnary, w: Word): (Word, Flags) = {
    val result = op match {
      case NOT => (~w).toByte
      case NEG => (-w).toByte
    }
    (result, logicalFlags(result))
  }

  def logicalDWord(op: LogicalOpBinary, w: DWord, v: DWord): (DWord, Flags) = {
    val r=performALULogical(op, w, v).toDWord
    (r, logicalFlags(r.toInt))
  }
  def logicalWord(op: LogicalOpBinary, w: Word, v: Word): (Word, Flags) = {
    val r=performALULogical(op, w, v).toWord
    (r, logicalFlags(r.toInt))
  }
  def performALULogical(op: LogicalOpBinary, w: ComputerWord, v: ComputerWord) = {
    (w.toBits.zip(v.toBits()) map { case (b1, b2) => applyLogical(op, b1, b2) })
  }
  def applyLogical(op: LogicalOpBinary, b1: Int, b2: Int) = op match {
    case OR  => b1 | b2
    case AND => b1 & b2
    case XOR => b1 ^ b2
  }
  def logicalFlags(result: Int) = {
    val f = new Flags()
    f.o = false
    f.c = false
    f.z = result == 0
    f.s = result < 0
    f
  }
  
    
  def arithmeticDWord(op: ArithmeticOpBinary, w: DWord, v: DWord, carry: Int = 0): (DWord, Flags) = {
    val (res, f) = performALUArithmetic(op, w, v, carry)
    (DWord(res), f)
  }
  def arithmeticWord(op: ArithmeticOpBinary, w: Word, v: Word, carry: Int = 0): (Word, Flags) = {
    val (res, f) = performALUArithmetic(op, w, v, carry)
    (Word(res), f)
  }
  
  def arithmeticWord(op: ArithmeticOpUnary, w: Word): (Word, Flags) = {
    op match {
      case INC => arithmeticWord(ADD, w, Word(1))
      case DEC => arithmeticWord(SUB, w, Word(1))
    }
  }
  def arithmeticDWord(op: ArithmeticOpUnary, w: DWord): (DWord, Flags) = {
    op match {
      case INC => arithmeticDWord(ADD, w, DWord(1))
      case DEC => arithmeticDWord(SUB, w, DWord(1))
    }
  }
  
  def performALUArithmetic(op: ArithmeticOpBinary, w: ComputerWord, v: ComputerWord, carry: Int = 0): (Int, Flags) = {
    val f = new Flags()

    var res = operate(op, w.toInt, v.toInt, carry)
    var unsignedRes = operate(op, w.toUnsignedInt, v.toUnsignedInt, carry)

    if (res < w.minSigned) {
      f.o = true
      res += w.numbers
    }
    if (res > w.maxSigned) {
      f.o = true
      res -= w.numbers
    }

    if (unsignedRes > w.maxUnsigned || unsignedRes < 0) {
      f.c = true
    }

    f
    .s = res < 0
    f.z = res == 0
    (res, f)
  }
  def operate(op: ArithmeticOpBinary, v: Int, w: Int, carry: Int) = {
    op match {
      case ADD => v + w
      case ADC => v + w + carry
      case SUB => v - w
      case SBB => v - w - carry
      case CMP => v - w
    }
  }


}

class CPU {

  var halted = false
  val alu = new ALU()
  var generalRegisters = mutable.Map[FullRegister, DWord]()
  var specialRegisters=mutable.Map[SpecialRegister,DWord]()
  reset()
  def reset() {
    jump(0x2000)
    setSP(Simulator.maxMemorySize)
    halted = false
    generalRegisters = mutable.Map[FullRegister, DWord](AX -> DWord(), BX -> DWord(), CX -> DWord(), DX -> DWord())
    specialRegisters=mutable.Map[SpecialRegister,DWord](SP -> DWord(Simulator.maxMemorySize),IP -> DWord(0x2000),MBR ->DWord(), MAR-> DWord(),IR -> DWord())
  }
  
  def ip=specialRegisters(IP).toInt
  def sp=specialRegisters(SP).toInt
  
  
  def jump(newIP:Int) { specialRegisters(IP)=DWord(newIP) }
  def setSP(newSP:Int) {  specialRegisters(SP)=DWord(newSP)}
  
  
  def get(r: FullRegister): DWord = {
    r match{
      case x:SpecialRegister => specialRegisters(x)
      case other => generalRegisters(r)
    }
  }
  def set(r: FullRegister, v: DWord) {
    r match{
      case x:SpecialRegister => specialRegisters(x)=v
      case other => generalRegisters(r) = v
    }
  }
  def set(r:FullRegister,v:Int){ set(r,DWord(v))}

  def get(r: HalfRegister): Word = {
    r match {
      case r: LowRegister  => Word(get(r.full).l)
      case r: HighRegister => Word(get(r.full).h)
    }
  }

  def set(r: HalfRegister, v: Word) {
//    println(s"Setting $r to $v")
    r match {
      case r: LowRegister  => set(r.full, DWord(v, get(r.high)))
      case r: HighRegister => set(r.full, DWord(get(r.low), v))
    }
  }
  def set(r:HalfRegister,v:Int){
//    println(s"Setting $r to $v")
    set(r,Word(v))
    }

}

object Memory{
  def apply(size:Int):Memory={
    new Memory(randomBytes(size).map(Word(_)))
  }
  
  def apply(values:Map[Int,Int],size:Int):Memory={
    val max=if (values.isEmpty) 0  else values.keys.max
    val m=Memory(Math.max(size,max))
    values.foreach{case (i,v) => m.values(i)=Word(v) }
    m
  }
  
  def randomBytes(size:Int) = {
    val values = Array.ofDim[Byte](size)
    new Random().nextBytes(values)
    values
  }
}

class MemoryAccessViolation(val address:Int)
case class InvalidMemoryAddress(val address:Int) extends Exception() 

class Memory(var values:Array[Word],var readOnlyAddresses:List[Int]=List()) {
  
  def validAddress(address:Int)=address>=0 && address<values.length
  def checkAddress(address:Int){
    if (!validAddress(address)){
      throw new InvalidMemoryAddress(address)
    }
  }
  def getByte(address: Int) = {
    checkAddress(address)
    values(address)
    
  }
  def getBytes(address: Int): DWord = {
    checkAddress(address)
    checkAddress(address+1)
    DWord(values(address), values(address + 1))
  }
  def setByte(address: Int, v: Word)={
    checkAddress(address)
//    println(s"setting $address to $v ($readOnlyAddresses)")
    if (readOnlyAddresses.contains(address)){
      Some(new MemoryAccessViolation(address))
    }else{
      values(address) = v
      None
    }
    
  }
  def setBytes(address: Int, v: DWord)={
    checkAddress(address)
    checkAddress(address+1)
//    println(s"setting $address to $v ($readOnlyAddresses)")
    if (readOnlyAddresses.contains(address) ){
      Some(new MemoryAccessViolation(address))
    }else if(readOnlyAddresses.contains(address+1)){
      Some(new MemoryAccessViolation(address+1))
    }else{
      values(address) = v.l
      values(address + 1) = v.h
      None
    }
  }
  def update(valuesMap:Map[MemoryAddress,Int]){
    valuesMap.foreach{ case (a,v) => values(a)=Word(v) }
  }
  def reset(){
    val bytes=Memory.randomBytes(values.size)
    bytes.indices.foreach(i => values(i)=Word(bytes(i)))
  }
}

