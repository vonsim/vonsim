# RET

This instruction returns from a [subroutine](../cpu#subroutines). The [_flags_](../cpu#flags) are not affected.

First, it pops the top of the [stack](../cpu#stack) (which should contain the return address provided by a [`CALL`](./call)). Then, it jumps to the obtained address, i.e., copies the jump address into `IP`.

## Usage

```vonsim
RET
```

## Encoding

`00110011`
