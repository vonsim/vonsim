# CALL

This instruction initiates a [subroutine](../cpu#subroutines). The [_flags_](../cpu#flags) are not affected.

First, it pushes the return address (the address of the instruction following the `CALL`) onto the [stack](../cpu#stack). Then, it jumps to the subroutine address, i.e., copies the jump address into `IP`.

## Usage

```vonsim
CALL label
```

_label_ must be a label that points to an instruction.

### Example

```vonsim
            org 3000h
subroutine: push ax
            ; --- etc ---
            ret

            org 2000h
            call subroutine ; Valid
            call 3000h      ; Invalid, must be a label
            hlt
            end
```

## Encoding

`00110001`, _addr-low_, _addr-high_
