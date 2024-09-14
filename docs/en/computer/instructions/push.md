# PUSH

This instruction pushes an element onto the [stack](../cpu#stack). The source operand is not modified. The [_flags_](../cpu#flags) are not affected.

This instruction first decrements the `SP` register by 2 and then stores the source operand at the address pointed to by `SP`.

## Usage

```vonsim
PUSH source
```

_source_ can only be a 16-bit register (see [operand types](../assembly#operands)).

## Encoding

`01100rrr`

Where `rrr` encodes the source register as follows:

| `rrr` | _source_ |
| :---: | :------: |
| `000` |   `AX`   |
| `001` |   `CX`   |
| `010` |   `DX`   |
| `011` |   `BX`   |
| `100` |   `SP`   |
| `101` |    --    |
| `110` |    --    |
| `111` |    --    |
