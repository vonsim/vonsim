# MOV

This instruction copies the source operand into the destination operand. The source operand is not modified. The [_flags_](../cpu#flags) are not affected.

## Usage

```vonsim
MOV dest, source
```

The valid combinations for _dest_ and _source_ are:

- Register, register
- Register, memory address
- Register, immediate
- Memory address, register
- Memory address, immediate

(See [operand types](../assembly#operands))

## Encoding

- REGISTER to register  
  `1000000w`, `00RRRrrr`
- Memory (direct) to register  
  `1000000w`, `01000rrr`, _addr-low_, _addr-high_
- Memory (indirect) to register  
  `1000000w`, `01010rrr`
- Memory (indirect with offset) to register  
  `1000000w`, `01100rrr`, _disp-low_, _disp-high_
- Immediate to register  
  `1000000w`, `01001rrr`, _data-low_, _data-high_
- Register to memory (direct)  
  `1000000w`, `11000rrr`, _addr-low_, _addr-high_
- Register to memory (indirect)  
  `1000000w`, `11010rrr`
- Register to memory (indirect with offset)  
  `1000000w`, `11100rrr`, _disp-low_, _disp-high_
- Immediate to memory (direct)  
  `1000000w`, `11001000`, _addr-low_, _addr-high_, _data-low_, _data-high_
- Immediate to memory (indirect)  
  `1000000w`, `11011000`, _data-low_, _data-high_
- Immediate to memory (indirect with offset)  
  `1000000w`, `11101000`, _disp-low_, _disp-high_, _data-low_, _data-high_

Where `w` is the operand size bit. `w=0` indicates 8-bit operands, and `w=1` indicates 16-bit operands. When `w=0`, _data-high_ is omitted (the instruction length is one byte shorter).

`rrr` or `RRR` encodes a register according to the following table:

| `rrr` | `w=0` | `w=1` |
| :---: | :---: | :---: |
| `000` | `AL`  | `AX`  |
| `001` | `CL`  | `CX`  |
| `010` | `DL`  | `DX`  |
| `011` | `BL`  | `BX`  |
| `100` | `AH`  | `SP`  |
| `101` | `CH`  |  --   |
| `110` | `DH`  |  --   |
| `111` | `BH`  |  --   |
