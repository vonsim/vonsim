# SBB

This instruction subtracts the source operand from the destination operand and stores the result in the destination operand. If `CF=1`, then `1` is subtracted from the result. The source operand remains unchanged.

The [_flags_](../cpu#flags) are modified as follows:

- If the subtraction produces a result that cannot fit in the destination operand, then `CF=1`. Otherwise, `CF=0`.
- If the result is zero, then `ZF=1`. Otherwise, `ZF=0`.
- If the most significant bit of the result is `1`, then `SF=1`. Otherwise, `SF=0`.
- If subtracting a positive number from a negative number results in a negative number, or subtracting a negative number from a positive number results in a positive number, then `OF=1`. Otherwise, `OF=0`.

## Usage

```vonsim
SBB dest, source
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
  `1000111w`, `00RRRrrr`
- Memory (direct) to register  
  `1000111w`, `01000rrr`, _addr-low_, _addr-high_
- Memory (indirect) to register  
  `1000111w`, `01010rrr`
- Memory (indirect with offset) to register  
  `1000111w`, `01100rrr`, _disp-low_, _disp-high_
- Immediate to register  
  `1000111w`, `01001rrr`, _data-low_, _data-high_
- Register to memory (direct)  
  `1000111w`, `11000rrr`, _addr-low_, _addr-high_
- Register to memory (indirect)  
  `1000111w`, `11010rrr`
- Register to memory (indirect with offset)  
  `1000111w`, `11100rrr`, _disp-low_, _disp-high_
- Immediate to memory (direct)  
  `1000111w`, `11001000`, _addr-low_, _addr-high_, _data-low_, _data-high_
- Immediate to memory (indirect)  
  `1000111w`, `11011000`, _data-low_, _data-high_
- Immediate to memory (indirect with offset)  
  `1000111w`, `11101000`, _disp-low_, _disp-high_, _data-low_, _data-high_

Where `w` is the operand size bit. `w=0` indicates 8-bit operands, and `w=1` indicates 16-bit operands. When `w=0`, _data-high_ is omitted (the instruction length is one byte shorter).

`rrr` or `RRR` encodes a register according to the following table:

| `rrr` | `w=0` | `w=1` |
| :---: | :---: | :---: |
| `000` | `AL`  | `AX`  |
| `001` | `CL`  | `CX`  |
| `010` | `DL`  | `DX`  |
| `011` | `BL`  | `BX`  |
| `100` | `AH`  | `SP`  |
| `101` | `CH`  | `BP`  |
| `110` | `DH`  |  --   |
| `111` | `BH`  |  --   |
