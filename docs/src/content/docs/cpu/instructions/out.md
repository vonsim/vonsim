---
title: OUT
head:
  - tag: meta
    attrs:
      { property: og:image, content: https://vonsim.github.io/docs/og/cpu/instructions/out.png }
---

Esta instrucción escribe un byte en la [memoria E/S](/docs/io/modules/). Los [_flags_](/docs/cpu/#flags) no se modifican.

## Uso

```vonsim
OUT dest, fuente
```

_dest_ refiere al puerto o dirección de la memoria E/S. Puede ser un valor inmediato de 8 bits (ver [tipos de operandos](/docs/cpu/assembly/#operandos)) o el registro `DX`. En el caso de utilizar `DX`, se utilizará la palabra almacenada en el registro como dirección de memoria E/S.

_fuente_ puede ser `AL` o `AX`. Si es `AX`, primero se escribirá del puerto especificado por _dest_ el valor en `AL`, y luego se escribirá en el puerto siguiente el valor de `AH`.

## Codificación

- Puerto fijo  
  `0101010w`, _puerto_
- Puerto variable  
  `0101011w`

Donde `w` es el bit de tamaño de la entrada. `w=0` indica leer de `AL` y `w=1` de `AX`.

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
