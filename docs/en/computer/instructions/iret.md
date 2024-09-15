# IRET

This instruction returns from an [interrupt routine](../cpu#interrupts).

First, it pops the top of the [stack](../cpu#stack) (which should contain the return address provided by a [`CALL`](./call)). Then, it jumps to the obtained address, i.e., copies the jump address into `IP`.

Next, it pops the stack again, but this time the top of the stack is the value of `FLAGS`. The obtained value is then copied into `FLAGS`. Thus, the [_flags_](../cpu#flags) are modified according to what is popped.

Note that, although this instruction modifies the flags, as it is returning from an interrupt routine, the flags should be the same as before the interrupt when returning to the original execution flow.

Additionally, this instruction does not enable interrupts per se. If interrupts were enabled before the interrupt, they will be re-enabled when copying `FLAGS`, but if they were not enabled, they will not be enabled. This is useful because, for example, it allows software interrupts to be executed within an interrupt routine without re-enabling interrupts.

## Usage

```vonsim
IRET
```

## Encoding

`00011011`
