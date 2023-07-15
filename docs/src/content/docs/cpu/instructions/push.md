---
title: PUSH
---

Esta instrucción apila un elemento en la [pila](/cpu/#pila). El operando fuente no se modifica. Los [_flags_](/cpu/#flags) no se modifican.

Esta instrucción primero decrementa el registro `SP` en 2 y luego almacena el operando fuente en la dirección apuntada por `SP`.

## Uso

```vonsim
PUSH fuente
```

_fuente_ solo puede ser un registro de 16 bits (ver [tipos de operandos](/cpu/assembly/#operandos)).

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

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
