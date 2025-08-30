# INC

This instruction adds one to the destination operand and stores the result in the same operand.

The [_flags_](../cpu#flags) are modified as follows:

- If the result exceeds the size of the destination operand, then `CF=1`. Otherwise, `CF=0`.
- If the result is zero, then `ZF=1`. Otherwise, `ZF=0`.
- If the most significant bit of the result is `1`, then `SF=1`. Otherwise, `SF=0`.
- If the operand is positive and the result is negative, then `OF=1`. Otherwise, `OF=0`.

## Usage

```vonsim
INC dest
```

_dest_ can be a register or a memory address (see [operand types](../assembly#operands)).

## Encoding

- Register  
  `0100010w`, `00000rrr`
- Memory (direct)  
  `0100010w`, `11000000`, _addr-low_, _addr-high_
- Memory (indirect)  
  `0100010w`, `11010000`
- Memory (indirect with offset)  
  `0100010w`, `11100000`, _disp-low_, _disp-high_

Where `w` is the operand size bit. `w=0` indicates 8-bit operands, and `w=1` indicates 16-bit operands.

`rrr` encodes a register according to the following table:

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
