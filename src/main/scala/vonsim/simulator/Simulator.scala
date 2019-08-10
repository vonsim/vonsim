package vonsim.simulator

import scala.collection.mutable.ListBuffer
import scala.collection.mutable
import scala.util.Random
import com.sun.org.apache.bcel.internal.generic.ArithmeticInstruction
import Simulator._
import ComputerWord._
import vonsim.assembly.Compiler.SuccessfulCompilation
import vonsim.assembly.Compiler.SuccessfulCompilation
import vonsim.simulator.i18n.Spanish
import vonsim.simulator.i18n.SimulatorLanguage

object Simulator {

  type IOMemoryAddress = Byte
  def maxMemorySize = 0x4000 // in bytes
  def maxInstructions = 10000 // max number of instructions to execute
  
  def encode(instruction:Instruction)={
    
    instruction match{
      case ei:ExecutableInstruction =>
        val encoding=ListBuffer(encodeOpcode(ei))
        ei match{
          case i:JumpInstruction => encoding++=DWord(i.m).toByteList()
          case i:Zeroary => 
          case i:IOInstruction => {
            encoding++= encodeUnaryOperand(i.r)++List(Word(i.a))
          }
          case i:Mov =>{
            encoding+= encodeBinaryAddressingMode(i.binaryOperands)
            encoding++=encodeBinaryOperands(i.binaryOperands)
          }
          case i:ALUBinary=> {
            encoding+= encodeBinaryAddressingMode(i.binaryOperands)
            encoding++=encodeBinaryOperands(i.binaryOperands)
          }
          case i:ALUUnary=>{
            encoding+= encodeUnaryAddressingMode(i.unaryOperand)
            encoding++=encodeUnaryOperand(i.unaryOperand)
          }
          case i:IntN => encoding++=encodeImmediate(i.v)
          case i:Push => encoding+=encodeRegister(i.r)
          case i:Pop => encoding+=encodeRegister(i.r)
        }
        encoding.toList
      case other => List() 
    }

  }
  def encodeBinaryAddressingMode(o:BinaryOperands)={
    
    o match {
      case x:WordRegisterRegister => Word("00000000")
      case x:DWordRegisterRegister => Word("10000000")
      case x:WordRegisterValue => Word("00000001")
      case x:DWordRegisterValue => Word("10000001")
      case x:WordRegisterMemory => Word("00000010")
      case x:DWordRegisterMemory => Word("10000010")
      case x:WordRegisterIndirectMemory=> Word("00000011")
      case x:DWordRegisterIndirectMemory => Word("10000011")
      
      case x:WordMemoryRegister => Word("00000100")
      case x:DWordMemoryRegister => Word("10000100")
      case x:WordMemoryValue => Word("00000101")
      case x:DWordMemoryValue => Word("10000101")
      
      case x:WordIndirectMemoryRegister=> Word("00000110")
      case x:DWordIndirectMemoryRegister => Word("10000110")
      case x:WordIndirectMemoryValue => Word("00000111")
      case x:DWordIndirectMemoryValue => Word("10000111")  
    }
  }
  
  def encodeBinaryOperands(o:BinaryOperands)={
    o match {
      case x:DWordBinaryOperands => encodeUnaryOperand(x.o1)++encodeUnaryOperand(x.o2)
      case x:WordBinaryOperands =>  encodeUnaryOperand(x.o1)++encodeUnaryOperand(x.o2)
    }
  }
  
  def encodeUnaryAddressingMode(i:UnaryOperandUpdatable)={
    i match{
      case x:HalfRegister => Word("00000000")
      case x:FullRegister => Word("10000000")
      case x:WordMemoryAddress => Word("00000001")
      case x:DWordMemoryAddress => Word("10000001")
      case WordIndirectMemoryAddress => Word("00000010")
      case DWordIndirectMemoryAddress => Word("10000010")
        
    }
  }
  def encodeUnaryOperand(i:UnaryOperand)={
    i match{
      case r:Register=> List(encodeRegister(r))
      case x:WordMemoryAddress => DWord(x.address).toByteList()
      case x:DWordMemoryAddress =>DWord(x.address).toByteList()
      case WordIndirectMemoryAddress =>  List()
      case DWordIndirectMemoryAddress => List()
      case x:ImmediateOperand =>  encodeImmediate(x)
    }
  }
  
  def encodeImmediate(i:ImmediateOperand)={
    i match{
      case dw:DWordValue => DWord(dw.v).toByteList()
      case dw:WordValue => List(Word(dw.v))
    }
  }
  def encodeRegister(r:Register)={
    Word(List(AX,BX,CX,DX,AL,BL,CL,DL,AH,BH,CH,DH).indexOf(r))
  }
  
  def encodeOpcode(instruction:ExecutableInstruction)={
    instruction match{
    case i:ALUBinary=>
        Word(List(ADD,ADC,SUB,SBB,OR,AND,XOR,CMP).indexOf(i.op))
    case i:Mov => Word("00001000")
    case i:In =>  Word("00001001")
    case i:Out => Word("00001010")
    case i:ALUUnary=> Word(16+List(INC,DEC,NOT,NEG).indexOf(i.op)) 
    case i:IntN => Word("00100001")
    case i:Push => Word("00100000")
    case i:Pop =>  Word("00100001")
    
    case ji:JumpInstruction =>
      ji match{
        case cj:ConditionalJump =>
          Word(32+16+List(JC,JNC,JZ,JNZ,JO,JNO,JS,JNS).indexOf(cj.c))
        case x:Call => Word("00111001")
        case x:Jump => Word("00111000")
      }
    case i:Zeroary => Word(List(Pushf,Popf,Ret,Iret,Nop,Hlt,Cli,Sti).indexOf(i)+64)
    }
    
  }
  def instructionSize(instruction:Instruction)={
      val encoding=encode(instruction)
      encoding.length
//    instruction match {
//      
//      case i:JumpInstruction => 3
//      case i:IOInstruction => 3
//      case i:Zeroary => 1
//      case i:Mov => 2+operandSizes(i.binaryOperands)
//      case i:ALUBinary=> 2+operandSizes(i.binaryOperands)
//      case i:ALUUnary=> 2+operandSize(i.unaryOperands)
//      case i:IntN => 2
//      case i:Push => 2
//      case i:Pop => 2
//      
//      case _ => 0
//    }
  }
  def operandSizes(o:BinaryOperands)={
    o match{
      case w:WordBinaryOperands =>  operandSize(w.o1)+operandSize(w.o2)
      case w:DWordBinaryOperands => operandSize(w.o1)+operandSize(w.o2)
    }
    
  }
  def operandSize(o:UnaryOperand)={
    o match{
      case r:Register=> 1
      case d:DirectMemoryAddressOperand => 2
      case i:IndirectMemoryAddressOperand => 1
      case w:WordValue => 1
      case dw:DWordValue => 2
    }
  }
  
  def Empty() = {
    new Simulator(new CPU(), Memory(Simulator.maxMemorySize), Map[Int, InstructionInfo]())
  }
  def apply(c:SuccessfulCompilation)={
    val s= Empty()
    s.load(c)
    s
  }

}


class InstructionInfo(val line: Int, val instruction: Instruction,val rawInstruction:String) {
  
  override def toString()={
    s"Line $line: $instruction"
  }
  
}
class SimulatorState

class SimulatorStoppedState extends SimulatorState
case object SimulatorExecutionStopped extends SimulatorStoppedState
//case object SimulatorProgramLoaded extends SimulatorStoppedState
case object SimulatorProgramExecuting extends SimulatorState
case class SimulatorExecutionError(val e:ExecutionError) extends SimulatorStoppedState
case object SimulatorExecutionFinished extends SimulatorStoppedState


trait ExecutionError{
  def message:String
}

case class GeneralExecutionError(val message:String) extends ExecutionError{
  
}

case class InstructionExecutionError(val message:String,val i:InstructionInfo) extends ExecutionError{
  
}



class Simulator(val cpu: CPU, val memory: Memory, var instructions: Map[Int, InstructionInfo]) {
  var state:SimulatorState=SimulatorExecutionStopped
  var language:SimulatorLanguage=new Spanish()
  def reset(){
    cpu.reset()
    //memory.reset()
    state=SimulatorExecutionStopped  
  }
  def stop(){
    cpu.reset()
    //memory.reset()
    state=SimulatorExecutionStopped  
  }
  
  def load(c:SuccessfulCompilation){
    cpu.reset()
    memory.update(c.variablesMemory)
    memory.update(c.instructionsMemory)
//    println("Memory addresses set:"+c.variablesMemory.keys.toList.sorted)
//    println("Instructions addresses set:"+c.instructionsMemory.keys.toList.sorted)
    memory.readOnlyAddresses=c.instructionsMemory.keys.toList
    instructions=c.addressToInstruction
    state=SimulatorProgramExecuting
  }

  
  def currentInstruction() = {
    if (instructions.keySet.contains(cpu.ip)) {
      val instruction = instructions(cpu.ip)
      Right(instruction)
    } else {
      val message=language.memoryCellAsInstruction
      Left(GeneralExecutionError(message))
    }
  }

  def runInstructions() = {
    stepNInstructions(Simulator.maxInstructions)
  }

  def stepNInstructions(n: Int) ={
    val instruction = stepInstruction()
    var instructions = ListBuffer(instruction)
    var counter = 0

    while (counter < n && instruction.isRight && !cpu.halted) {
      val instruction = stepInstruction()
      instructions += instruction
    }
    instructions
  }

  def stepInstruction() = {
    val instructionInfo = currentInstruction()
    //println("Executing instruction: "+instructionInfo)
    if (instructionInfo.isRight) {
      val info = instructionInfo.right.get
      val instruction=info.instruction
      cpu.jump(cpu.ip+ Simulator.instructionSize(instruction))
      state=SimulatorProgramExecuting
      try{
      execute(info)
      }catch{
        case e:InvalidMemoryAddress => stopExecutionForError(language.invalidMemoryAddress(e.address)) 
      }
     
    }else{
      stopExecutionForError(instructionInfo.left.get)
    }
    instructionInfo
  }
  def finishExecution(){
    cpu.halted=true
    state=SimulatorExecutionFinished
  }
  def stopExecutionForError(message:String){
    stopExecutionForError(GeneralExecutionError(message))
  }
  def stopExecutionForError(executionError:ExecutionError){
    cpu.halted=true
    state=SimulatorExecutionError(executionError)
  }
  
  def stopExecutionForError(reason:String,i:InstructionInfo){
    val message=language.instructionErrorMessage(i)+"\n"+language.reason+"\n"+reason
    stopExecutionForError(new InstructionExecutionError(message,i))
  }
  def stopExecutionForError(e:MemoryAccessViolation,i:InstructionInfo){
    val message=language.modifyingReadOnlyMemory(e.address)
    stopExecutionForError(message,i)
  }
  def setSpecialRegisters(i:Instruction){
    var encoding=Simulator.encode(i)
    cpu.set(IR,encoding(0).toDWord()) 
    cpu.set(MAR,cpu.get(IP))
    cpu.set(MBR,cpu.get(IR))
    i match {
      case (_:JumpInstruction | _:Zeroary | _:IOInstruction | _:IntN | _:Push | _:Pop) => {
        //nothing to do here        
      }
      // if there are memory operand accesses, they'll overwrite the MAR/MBR registers  
      case i: Mov => {
        cpu.set(IR,DWord(encoding(0),encoding(1)))
        setMemoryRegistersIfAccessed(i.binaryOperands)
      }
      case i: ALUBinary => {
        cpu.set(IR,DWord(encoding(0),encoding(1)))
        setMemoryRegistersIfAccessed(i.binaryOperands)
      }
      case i: ALUUnary => {
        cpu.set(IR,DWord(encoding(0),encoding(1)))
        setMemoryRegistersIfAccessed(i.unaryOperand)
        
      }
    }
  }
  def setMemoryRegistersIfAccessed(o:BinaryOperands){
    setMemoryRegistersIfAccessed(o.o1)
    setMemoryRegistersIfAccessed(o.o2)
  }
  def setMemoryRegistersIfAccessed(o:UnaryOperand){
    o match {
      case x:WordMemoryAddress => {
        cpu.set(MAR,x.address)
        cpu.set(MBR,memory.getByte(x.address).toDWord())
      }
      case WordIndirectMemoryAddress =>{
        val address=cpu.get(BX).toInt
        cpu.set(MAR,address)
        cpu.set(MBR,memory.getByte(address).toDWord())
        
      }
      case x:DWordMemoryAddress => {
        cpu.set(MAR,x.address)
        cpu.set(MBR,memory.getBytes(x.address))
      }
      case DWordIndirectMemoryAddress =>{
        val address=cpu.get(BX).toUnsignedInt
        cpu.set(MAR,address)
        cpu.set(MBR,memory.getBytes(address))
      }
      case other =>
    }
  }
  
  
  def execute(i: InstructionInfo){
    setSpecialRegisters(i.instruction)
    i.instruction match {
      case Nop           => {}
      case Hlt           => { finishExecution() }
      case Jump(address) => { cpu.jump(address)}
      case ConditionalJump(address,condition) => {
        if (cpu.alu.flags.satisfy(condition)){
          cpu.jump(address)
        }
      }
      case Call(address) => {
//        println(s"Calling $address, returning to ${cpu.ip}")
        val ra = push(cpu.ip)
//        println(memory.getBytes(cpu.sp))
        cpu.jump(address)
      }
      case Ret => {
        val ra = pop()
//        println(s"Retting to $ra (${ra.toInt}) from ${cpu.ip}")
        cpu.jump(ra.toInt)
      }
      case Push(register) => {
        push(cpu.get(register))
      }
      case Pop(register) => {
        cpu.set(register,pop())
      }
      case Pushf => {
        push(cpu.alu.flags.toDWord)
      }
      case Popf => {
        val f=Flags(pop())
        cpu.alu.flags=f
      }
      
      case Mov(os: WordBinaryOperands) => {
//        println(s"Updating operand ${os.o1} with ${os.o2}")
        checkUpdateResult(update(os.o1, get(os.o2)),i) 
      }
      case Mov(os: DWordBinaryOperands) => {
        checkUpdateResult(update(os.o1, get(os.o2)),i) 
      }
      case ALUBinary(CMP, os: WordBinaryOperands) => {
        cpu.alu.applyOp(SUB, get(os.o1), get(os.o2))
      }
      case ALUBinary(CMP, os: DWordBinaryOperands) => {
        cpu.alu.applyOp(SUB, get(os.o1), get(os.o2))
      }
      case ALUBinary(op, os: WordBinaryOperands) => {
        checkUpdateResult(update(os.o1, cpu.alu.applyOp(op, get(os.o1), get(os.o2))),i) 
      }
      case ALUBinary(op, os: DWordBinaryOperands) => {
        checkUpdateResult(update(os.o1, cpu.alu.applyOp(op, get(os.o1), get(os.o2))),i)
      }
      case ALUUnary(op, o: WordOperand) => {
        checkUpdateResult(update(o, cpu.alu.applyOp(op, get(o))),i)
      }
      case ALUUnary(op, o: DWordOperand) => {
        val v=get(o)
        
        val a=cpu.alu.applyOp(op, v)
        checkUpdateResult(update(o, a),i)
      }
      case Sti=>{
         stopExecutionForError(language.instructionNotImplemented("sti"))
      }
      case Cli=>{
         stopExecutionForError(language.instructionNotImplemented("cli"))
      }
      case In(reg,v) =>{
         stopExecutionForError(language.instructionNotImplemented("in"))
      }
      case Out(reg,v) =>{
         stopExecutionForError(language.instructionNotImplemented("out"))
      }
      case IntN(n) =>{
         stopExecutionForError(language.instructionNotImplemented("int n"))
      }
      case other => {
        stopExecutionForError(language.instructionNotImplemented(other.toString()))
      }
    }

  }

  def checkUpdateResult(e:Option[MemoryAccessViolation],i:InstructionInfo){
    e match{
          case Some(violation) => stopExecutionForError(violation, i)
          case None =>
        }
  }
  def push(v: Int) {
    push(DWord(v))
  }
  def push(v: DWord) {
    cpu.setSP(cpu.sp - 2)
    memory.setBytes(cpu.sp, v)
  }
  def pop() = {
    val v = memory.getBytes(cpu.sp)
    cpu.setSP(cpu.sp +2)
    v
  }

  def get(o: DWordOperand): DWord = {
    o match {
      case DWordMemoryAddress(address) => memory.getBytes(address)
      case r: FullRegister             => cpu.get(r)
      case v: DWordValue               => DWord(v.v)
      case DWordIndirectMemoryAddress  => memory.getBytes(cpu.get(BX).toInt)
    }
  }

  def update(o: DWordOperand, v: DWord)={
    o match {
      case DWordMemoryAddress(address) => memory.setBytes(address, v)
      case r: FullRegister             => {cpu.set(r, v); None}
      case DWordIndirectMemoryAddress  => memory.setBytes(cpu.get(BX).toInt, v)
    }
  }

  def get(o: WordOperand): Word = {
    o match {
      case WordMemoryAddress(address) => memory.getByte(address)
      case r: HalfRegister            => cpu.get(r)
      case v: WordValue               => Word(v.v)
      case WordIndirectMemoryAddress  => memory.getByte(cpu.get(BX).toInt)
    }
  }
  def update(o: WordOperand, v: Word) ={
//    println(s"Updating operand $o with $v")
    o match {
      case WordMemoryAddress(address) => memory.setByte(address, v)
      case r: HalfRegister            => {cpu.set(r, v); None}
      case WordIndirectMemoryAddress  => memory.setByte(cpu.get(BX).toInt, v)
    }
  }
    
}