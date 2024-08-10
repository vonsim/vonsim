# POP

Esta instrucción desapila el elemento en el tope en la [pila](../cpu#pila) y lo almacena en el operando destino. Los [_flags_](../cpu#flags) no se modifican.

Esta instrucción primero lee el valor apuntado por `SP` y lo guarda en el operando destino, para luego incrementar el registro `SP` en 2.

## Uso

```vonsim
POP dest
```

_dest_ solo puede ser un registro de 16 bits (ver [tipos de operandos](../assembly#operandos)).

## Codificación

`01101rrr`

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
