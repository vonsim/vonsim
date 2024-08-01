---
title: IN
---

# {{ $frontmatter.title }}

Esta instrucción obtiene un byte de la [memoria E/S](../../io/modules/index) y lo almacena en el operando destino. Los [_flags_](../cpu#flags) no se modifican.

## Uso

```vonsim
IN dest, fuente
```

_fuente_ refiere al puerto o dirección de la memoria E/S. Puede ser un valor inmediato de 8 bits (ver [tipos de operandos](../assembly#operandos)) o el registro `DX`. En el caso de utilizar `DX`, se utilizará la palabra almacenada en el registro como dirección de memoria E/S.

_dest_ puede ser `AL` o `AX`. Si es `AX`, primero se leerá del puerto especificado por _fuente_ y se almacenará en `AL`, y luego se leerá del puerto siguiente y se almacenará en `AH`.

## Codificación

- Puerto fijo  
  `0101000w`, _puerto_
- Puerto variable  
  `0101001w`

Donde `w` es el bit de tamaño de la salida. `w=0` indica guardar la salida en `AL` y `w=1` en `AX`.
