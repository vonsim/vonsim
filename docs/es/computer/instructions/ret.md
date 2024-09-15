# RET

Esta instrucción retorna de una [subrutina](../cpu#subrutinas). Los [_flags_](../cpu#flags) no se modifican.

Primero, se desapila el tope de la [pila](../cpu#pila) (que debería contener la dirección de retorno dada por un [`CALL`](./call)). Luego, se salta a la dirección obtenida, es decir, copia la dirección de salto en `IP`.

## Uso

```vonsim
RET
```

## Codificación

`00110011`
