# JMP

This instruction performs an unconditional jump. The [_flags_](../cpu#flags) are not affected.

It will copy the jump address into `IP`.

## Usage

```vonsim
JMP label
```

_label_ must be a label that points to an instruction.

### Example

```vonsim
        org 2000h
jump:   push ax
        ; --- etc ---

        jmp jump  ; Valid
        jmp 2000h ; Invalid, must be a label
        hlt
        end
```

## Encoding

`00110000`, _addr-low_, _addr-high_
