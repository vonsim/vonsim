# IN

This instruction reads a byte from [I/O memory](../../io/modules/index) and stores it in the destination operand. The [_flags_](../cpu#flags) are not affected.

## Usage

```vonsim
IN dest, source
```

_source_ refers to the I/O port or memory address. It can be an 8-bit immediate value (see [operand types](../assembly#operands)) or the `DX` register. If `DX` is used, the word stored in the register will be used as the I/O memory address.

_dest_ can be `AL` or `AX`. If it is `AX`, the byte will first be read from the port specified by _source_ and stored in `AL`, and then read from the next port and stored in `AH`.

## Encoding

- Fixed port  
  `0101000w`, _port_
- Variable port  
  `0101001w`

Where `w` is the output size bit. `w=0` indicates storing the output in `AL` and `w=1` in `AX`.
