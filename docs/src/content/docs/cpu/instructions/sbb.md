---
title: SBB
---

Esta instrucción le resta el operando fuente al operando destino y guarda el resultado en el operando destino. Si `CF=1`, entonces se resta `1` al resultado. El operando fuente no se modifica.

Los [_flags_](/docs/cpu/#flags) se modifican de la siguiente manera:

- Si la resta no entra en el operando destino, entonces `CF=1`. De lo contrario, `CF=0`.
- Si el resultado es cero, entonces `ZF=1`. De lo contrario, `ZF=0`.
- Si el el bit más significativo del resultado es `1`, entonces `SF=1`. De lo contrario, `SF=0`.
- Si la resta de un número positivo con un número negativo da un número negativo o la resta de un número negativo con un número positivo da un número positivo, entonces `OF=1`. De lo contrario, `OF=0`.

## Uso

```vonsim
SBB dest, fuente
```

Las combinaciones válidas de _dest_, _fuente_ son:

- Registro, registro
- Registro, dirección de memoria
- Registro, inmediato
- Dirección de memoria, registro
- Dirección de memoria, inmediato

(Ver [tipos de operandos](/docs/cpu/assembly/#operandos))

## Codificación

- REGISTRO a registro  
  `1000111w`, `00RRRrrr`
- Memoria (directo) a registro  
  `1000111w`, `01000rrr`, _dir-low_, _dir-high_
- Memoria (indirecto) a registro  
  `1000111w`, `01010rrr`
- Memoria (indirecto con desplazamiento) a registro  
  `1000111w`, `01100rrr`, _desp-low_, _desp-high_
- Inmediato a registro  
  `1000111w`, `01001rrr`, _dato-low_, _dato-high_
- Registro a memoria (directo)  
  `1000111w`, `11000rrr`, _dir-low_, _dir-high_
- Registro a memoria (indirecto)  
  `1000111w`, `11010rrr`
- Registro a memoria (indirecto con desplazamiento)  
  `1000111w`, `11100rrr`, _desp-low_, _desp-high_
- Inmediato a memoria (directo)  
  `1000111w`, `11001000`, _dir-low_, _dir-high_, _dato-low_, _dato-high_
- Inmediato a memoria (indirecto)  
  `1000111w`, `11011000`, _dato-low_, _dato-high_
- Inmediato a memoria (indirecto con desplazamiento)  
  `1000111w`, `11101000`, _desp-low_, _desp-high_, _dato-low_, _dato-high_

Donde `w` es el bit de tamaño de los operandos. `w=0` indica operandos de 8 bits y `w=1` operandos de 16 bits. Cuando `w=0`, _dato-high_ es obviado (la longitud de la instrucción es de un byte menos).

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
