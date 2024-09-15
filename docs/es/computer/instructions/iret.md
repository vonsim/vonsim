# IRET

Esta instrucción retorna de una [rutina de interrupción](../cpu#interrupciones).

Primero, se desapila el tope de la [pila](../cpu#pila) (que debería contener la dirección de retorno dada por un [`CALL`](./call)). Luego, se salta a la dirección obtenida, es decir, copia la dirección de salto en `IP`.

Después, desapila nuevamente, pero esta vez el tope de la pila es el valor de `FLAGS`. Luego, se copia el valor obtenido en `FLAGS`. Así, las [_flags_](../cpu#flags) se modificarán según lo que se desapile.

Nótese que, pese a que esta instrucción modifica los _flags_, como es el retorno de una rutina de interrupción, cuando se vuelva a el cauce de ejecución original, los _flags_ deberían ser los mismos que antes de la interrupción.

Además, esta instrucción no habilita las interrupciones _per se_. Si estas estaban habiliadas antes de la interrupción, se volverán a habilitar al copiar `FLAGS`, pero si no lo estaban, no se habilitarán. Esto es útil saberlo porque permite, por ejemplo, ejecutar interrupciones por software dentro de una rutina de interrupción sin que se rehabiliten las interrupciones.

## Uso

```vonsim
IRET
```

## Codificación

`00011011`
