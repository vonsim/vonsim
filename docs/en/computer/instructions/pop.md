# POP

This instruction pops the element at the top of the [stack](../cpu#stack) and stores it in the destination operand. The [_flags_](../cpu#flags) are not affected.

This instruction first reads the value pointed to by `SP` and stores it in the destination operand, then increments the `SP` register by 2.

## Usage

```vonsim
POP dest
```

_dest_ can only be a 16-bit register (see [operand types](../assembly#operands)).

## Encoding

`01101rrr`

Where `rrr` encodes the destination register as follows:

| `rrr` | _dest_ |
| :---: | :----: |
| `000` |  `AX`  |
| `001` |  `CX`  |
| `010` |  `DX`  |
| `011` |  `BX`  |
| `100` |  `SP`  |
| `101` |   --   |
| `110` |   --   |
| `111` |   --   |
