# PUSH

Esta instrucción apila un elemento en la [pila](../cpu#pila). El operando fuente no se modifica. Los [_flags_](../cpu#flags) no se modifican.

Esta instrucción primero decrementa el registro `SP` en 2 y luego almacena el operando fuente en la dirección apuntada por `SP`.

## Uso

```vonsim
PUSH fuente
```

_fuente_ solo puede ser un registro de 16 bits (ver [tipos de operandos](../assembly#operandos)).

## Codificación

`01100rrr`

Donde `rrr` codifica el registro fuente según esta tabla:

| `rrr` | _fuente_ |
| :---: | :------: |
| `000` |   `AX`   |
| `001` |   `CX`   |
| `010` |   `DX`   |
| `011` |   `BX`   |
| `100` |   `SP`   |
| `101` |    --    |
| `110` |    --    |
| `111` |    --    |
