---
title: NOT
---

Esta instrucción realiza la operación lógica NOT sobre el operando destino (NOT destino). El resultado se almacena en el operando destino.

Los [_flags_](/docs/cpu/#flags) se modifican de la siguiente manera:

- `CF=0`.
- Si el resultado es cero, entonces `ZF=1`. De lo contrario, `ZF=0`.
- Si el el bit más significativo del resultado es `1`, entonces `SF=1`. De lo contrario, `SF=0`.
- `OF=0`.

## Uso

```vonsim
NOT dest
```

_dest_ puede ser un registro o una dirección de memoria (ver [tipos de operandos](/docs/cpu/assembly/#operandos)).

## Codificación

- Registro  
  `0100000w`, `00000rrr`
- Memoria (directo)  
  `0100000w`, `11000000`, _dir-low_, _dir-high_
- Memoria (indirecto)  
  `0100000w`, `11010000`
- Memoria (indirecto con desplazamiento)  
  `0100000w`, `11100000`, _desp-low_, _desp-high_

Donde `w` es el bit de tamaño de los operandos. `w=0` indica operandos de 8 bits y `w=1` operandos de 16 bits.

`rrr` o `RRR` codifica un registro según la siguiente tabla:

| `rrr` | `w=0` | `w=1` |
| :---: | :---: | :---: |
| `000` | `AL`  | `AX`  |
| `001` | `CL`  | `CX`  |
| `010` | `DL`  | `DX`  |
| `011` | `BL`  | `BX`  |
| `100` | `AH`  | `SP`  |
| `101` | `CH`  |  --   |
| `110` | `DH`  |  --   |
| `111` | `BH`  |  --   |

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
