---
title: PUSHF
---

# {{ $frontmatter.title }}

Esta instrucción apila el registro [`FLAGS`](../cpu#flags) en la [pila](../cpu#pila). Los [_flags_](../cpu#flags) no se modifican.

Esta instrucción primero decrementa el registro `SP` en 2 y luego almacena el registro `FLAGS` en la dirección apuntada por `SP`.

## Uso

```vonsim
PUSHF
```

## Codificación

`01110000`
