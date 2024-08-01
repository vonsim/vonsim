---
title: POPF
---

# {{ $frontmatter.title }}

Esta instrucción desapila el elemento en el tope en la [pila](../cpu#pila) y lo almacena en el registro [`FLAGS`](../cpu#flags). Los [_flags_](../cpu#flags) se modificarán acordemente.

Esta instrucción primero lee el valor apuntado por `SP` y lo guarda en el registro `FLAGS`, para luego incrementar el registro `SP` en 2.

## Uso

```vonsim
POPF
```

## Codificación

`01111000`
