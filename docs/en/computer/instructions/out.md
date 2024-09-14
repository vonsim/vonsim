# OUT

This instruction writes a byte to [I/O memory](../../io/modules/index). The [_flags_](../cpu#flags) are not affected.

## Usage

```vonsim
OUT dest, source
```

_dest_ refers to the I/O port or memory address. It can be an 8-bit immediate value (see [operand types](../assembly#operands)) or the `DX` register. If `DX` is used, the word stored in the register will be used as the I/O memory address.

_source_ can be `AL` or `AX`. If it is `AX`, the value in `AL` will be written to the port specified by _dest_, and then the value in `AH` will be written to the next port.

## Encoding

- Fixed port  
  `0101010w`, _port_
- Variable port  
  `0101011w`

Where `w` is the input size bit. `w=0` indicates writing from `AL` and `w=1` from `AX`.
