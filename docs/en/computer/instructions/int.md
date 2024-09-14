# INT

This instruction triggers a software [interrupt](../cpu#interrupts). The `IF` [_flag_](../cpu#flags) is set to `0` because an interrupt will be executed. The other flags are not affected.

## Usage

```vonsim
INT N
```

_N_ is the interrupt number (0-255), which must be immediate (see [operand types](../assembly#operands)).

It uses the same interrupt vector mechanism as hardware interrupts. It is typically used for [system calls](../cpu#system-calls), but if called with any other number, it will execute the interrupt routine associated with that number.

## Encoding

`00011010`, _interrupt number_
