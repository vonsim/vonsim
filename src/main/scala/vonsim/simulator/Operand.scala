package vonsim.simulator

sealed class UnaryOperand

sealed trait WordOperand extends UnaryOperand
sealed trait DWordOperand extends UnaryOperand

class UnaryOperandUpdatable extends UnaryOperand 


class MemoryOperand extends UnaryOperandUpdatable 

trait DirectMemoryAddressOperand extends MemoryOperand{
  def asDWord:DWordMemoryAddress
  def asWord:WordMemoryAddress
}
case class DWordMemoryAddress(address:Int) extends DirectMemoryAddressOperand  with DWordOperand{
  def asWord=WordMemoryAddress(address)
  def asDWord=this
}
case class WordMemoryAddress(address:Int) extends DirectMemoryAddressOperand  with WordOperand{
  def asWord=this
  def asDWord=DWordMemoryAddress(address)
}

trait IndirectMemoryAddressOperand extends MemoryOperand
// TODO this is a hack. never use UndefinedIndirectMemoryAddress directly: it is only used by the compiler
case object UndefinedIndirectMemoryAddress extends IndirectMemoryAddressOperand   with DWordOperand
case object DWordIndirectMemoryAddress extends IndirectMemoryAddressOperand   with DWordOperand 
case object WordIndirectMemoryAddress extends IndirectMemoryAddressOperand  with WordOperand

class ImmediateOperand extends UnaryOperand
case class DWordValue(v:Int) extends ImmediateOperand with DWordOperand
case class WordValue(v:Int) extends ImmediateOperand with WordOperand

class Register extends UnaryOperandUpdatable

class FullRegister extends Register with DWordOperand

class HalfRegister extends Register with WordOperand{
   
  def full={
    this match{
      case AH => AX
      case BH => BX
      case CH => CX
      case DH => DX
      case AL => AX
      case BL => BX
      case CL => CX
      case DL => DX
    }
  }
   
  
}
class HighRegister extends HalfRegister{
  def low={
    this match{
      case AH => AL
      case BH => BL
      case CH => CL
      case DH => DL
    }
  }
}
class LowRegister extends HalfRegister{
  def high={
    this match{
      case AL => AH
      case BL => BH
      case CL => CH
      case DL => DH
    }
  }
  
}

trait IORegister extends Register
trait IndirectRegister
trait GeneralPurposeRegister
trait SpecialRegister 

case object SP extends FullRegister with SpecialRegister 
case object IP extends FullRegister with SpecialRegister 
case object MAR extends FullRegister with SpecialRegister 
case object MBR extends FullRegister with SpecialRegister
case object IR extends FullRegister with SpecialRegister

case object AX extends FullRegister with IORegister with GeneralPurposeRegister
case object BX extends FullRegister with IndirectRegister with GeneralPurposeRegister  
case object CX extends FullRegister with GeneralPurposeRegister
case object DX extends FullRegister with GeneralPurposeRegister


case object AH extends HighRegister with GeneralPurposeRegister
case object BH extends HighRegister with GeneralPurposeRegister
case object CH extends HighRegister with GeneralPurposeRegister
case object DH extends HighRegister with GeneralPurposeRegister

case object AL extends LowRegister with IORegister with GeneralPurposeRegister
case object BL extends LowRegister with GeneralPurposeRegister
case object CL extends LowRegister with GeneralPurposeRegister
case object DL extends LowRegister with GeneralPurposeRegister



abstract class BinaryOperands{
  def o1:UnaryOperand
  def o2:UnaryOperand
}

abstract class WordBinaryOperands extends BinaryOperands{
  def o1:WordOperand
  def o2:WordOperand
}

abstract class DWordBinaryOperands extends BinaryOperands{
  def o1:DWordOperand
  def o2:DWordOperand
}

case class DWordRegisterRegister(o1:FullRegister,o2:FullRegister) extends DWordBinaryOperands
case class WordRegisterRegister(o1:HalfRegister,o2:HalfRegister) extends WordBinaryOperands
case class DWordRegisterIndirectMemory(o1:FullRegister,o2:DWordIndirectMemoryAddress.type) extends DWordBinaryOperands
case class WordRegisterIndirectMemory(o1:HalfRegister,o2:WordIndirectMemoryAddress.type) extends WordBinaryOperands
case class DWordRegisterMemory(o1:FullRegister,o2:DWordMemoryAddress) extends DWordBinaryOperands
case class WordRegisterMemory(o1:HalfRegister,o2:WordMemoryAddress) extends WordBinaryOperands
case class DWordRegisterValue(o1:FullRegister,o2:DWordValue) extends DWordBinaryOperands
case class WordRegisterValue(o1:HalfRegister,o2:WordValue) extends WordBinaryOperands

case class DWordMemoryRegister(o1:DWordMemoryAddress,o2:FullRegister) extends DWordBinaryOperands
case class WordMemoryRegister(o1:WordMemoryAddress,o2:HalfRegister) extends WordBinaryOperands
case class DWordMemoryValue(o1:DWordMemoryAddress,o2:DWordValue) extends DWordBinaryOperands
case class WordMemoryValue(o1:WordMemoryAddress,o2:WordValue) extends WordBinaryOperands


case class DWordIndirectMemoryRegister(o1:DWordIndirectMemoryAddress.type,o2:FullRegister) extends DWordBinaryOperands
case class WordIndirectMemoryRegister(o1:WordIndirectMemoryAddress.type,o2:HalfRegister) extends WordBinaryOperands
case class DWordIndirectMemoryValue(o1:DWordIndirectMemoryAddress.type,o2:DWordValue) extends DWordBinaryOperands
case class WordIndirectMemoryValue(o1:WordIndirectMemoryAddress.type,o2:WordValue) extends WordBinaryOperands




