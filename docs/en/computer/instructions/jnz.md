# JNZ

This instruction jumps only if `ZF=0`. The [_flags_](../cpu#flags) are not affected.

If a jump occurs, it will copy the jump address into `IP`.

## Usage

```vonsim
JNZ label
```

_label_ must be a label that points to an instruction.

### Example

```vonsim
        org 2000h
jump:   push ax
        ; --- etc ---

        jnz jump  ; Valid
        jnz 2000h ; Invalid, must be a label
        hlt
        end
```

## Encoding

`00100011`, _addr-low_, _addr-high_
