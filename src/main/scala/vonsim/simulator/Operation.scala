package vonsim.simulator

class ALUOp
class ALUOpBinary extends ALUOp
class ALUOpUnary extends ALUOp
class ALUOpCompare extends ALUOp


class ArithmeticOpBinary extends ALUOpBinary
case object ADD extends ArithmeticOpBinary
case object SUB extends ArithmeticOpBinary
case object ADC extends ArithmeticOpBinary
case object SBB extends ArithmeticOpBinary
case object CMP extends ArithmeticOpBinary

class ArithmeticOpUnary extends ALUOpUnary
case object INC extends ArithmeticOpUnary
case object DEC extends ArithmeticOpUnary

class LogicalOpBinary extends ALUOpBinary
case object XOR extends LogicalOpBinary
case object OR extends LogicalOpBinary
case object AND extends LogicalOpBinary

class LogicalOpUnary extends ALUOpUnary
case object NOT extends LogicalOpUnary
case object NEG extends LogicalOpUnary

