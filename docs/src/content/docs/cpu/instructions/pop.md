---
title: POP
---

Esta instrucción desapila el elemento en el tope en la [pila](/docs/cpu/#pila) y lo almacena en el operando destino. Los [_flags_](/docs/cpu/#flags) no se modifican.

Esta instrucción primero lee el valor apuntado por `SP` y lo guarda en el operando destino, para luego incrementar el registro `SP` en 2.

## Uso

```vonsim
POP dest
```

_dest_ solo puede ser un registro de 16 bits (ver [tipos de operandos](/docs/cpu/assembly/#operandos)).

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

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
