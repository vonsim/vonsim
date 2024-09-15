# NEG

This instruction performs the two's complement of the destination operand, effectively negating it. The result is stored in the destination operand.

The [_flags_](../cpu#flags) are modified as follows:

- Since internally, `NEG dest` is equivalent to executing `SUB 0, dest`, if _dest_ is 0, then `CF=0`. Otherwise, `CF=1`.
- If the result is zero, then `ZF=1`. Otherwise, `ZF=0`.
- If the most significant bit of the result is `1`, then `SF=1`. Otherwise, `SF=0`.
- If the destination operand is `80h` or `8000h`, then `OF=1`. Otherwise, `OF=0`.

## Usage

```vonsim
NEG dest
```

_dest_ can be a register or a memory address (see [operand types](../assembly#operands)).

## Encoding

- Register  
  `0100001w`, `00000rrr`
- Memory (direct)  
  `0100001w`, `11000000`, _addr-low_, _addr-high_
- Memory (indirect)  
  `0100001w`, `11010000`
- Memory (indirect with displacement)  
  `0100001w`, `11100000`, _disp-low_, _disp-high_

Where `w` is the operand size bit. `w=0` indicates 8-bit operands, and `w=1` indicates 16-bit operands.

`rrr` encodes a register according to the following table:

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
