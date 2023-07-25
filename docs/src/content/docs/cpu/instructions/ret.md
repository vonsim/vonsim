---
title: RET
---

Esta instrucción retorna de una [subrutina](/docs/cpu/#subrutinas). Los [_flags_](/docs/cpu/#flags) no se modifican.

Primero, se desapila el tope de la [pila](/docs/cpu/#pila) (que debería contener la dirección de retorno dada por un [`CALL`](/docs/cpu/instructions/call/)). Luego, se salta a la dirección obtenida, es decir, copia la dirección de salto en `IP`.

## Uso

```vonsim
RET
```

## Codificación

`00110011`

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
