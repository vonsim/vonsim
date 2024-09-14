# POPF

This instruction pops the element at the top of the [stack](../cpu#stack) and stores it in the [`FLAGS`](../cpu#flags) register. The [_flags_](../cpu#flags) are modified accordingly.

This instruction first reads the value pointed to by `SP` and stores it in the `FLAGS` register, then increments the `SP` register by 2.

## Usage

```vonsim
POPF
```

## Encoding

`01111000`
