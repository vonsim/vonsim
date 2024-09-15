# OUT

Esta instrucción escribe un byte en la [memoria E/S](../../io/modules/index). Los [_flags_](../cpu#flags) no se modifican.

## Uso

```vonsim
OUT dest, fuente
```

_dest_ refiere al puerto o dirección de la memoria E/S. Puede ser un valor inmediato de 8 bits (ver [tipos de operandos](../assembly#operandos)) o el registro `DX`. En el caso de utilizar `DX`, se utilizará la palabra almacenada en el registro como dirección de memoria E/S.

_fuente_ puede ser `AL` o `AX`. Si es `AX`, primero se escribirá del puerto especificado por _dest_ el valor en `AL`, y luego se escribirá en el puerto siguiente el valor de `AH`.

## Codificación

- Puerto fijo  
  `0101010w`, _puerto_
- Puerto variable  
  `0101011w`

Donde `w` es el bit de tamaño de la entrada. `w=0` indica leer de `AL` y `w=1` de `AX`.
