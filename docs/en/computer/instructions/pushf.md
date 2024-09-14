# PUSHF

This instruction pushes the [`FLAGS`](../cpu#flags) register onto the [stack](../cpu#stack). The [_flags_](../cpu#flags) are not affected.

This instruction first decrements the `SP` register by 2 and then stores the `FLAGS` register at the address pointed to by `SP`.

## Usage

```vonsim
PUSHF
```

## Encoding

`01110000`
