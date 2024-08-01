---
title: JZ
---

# {{ $frontmatter.title }}

Esta instrucción salta solo sí `ZF=1`. Los [_flags_](../cpu#flags) no se modifican.

De saltar, copiará la dirección de salto en `IP`.

## Uso

```vonsim
JZ etiqueta
```

_etiqueta_ debe ser una etiqueta que apunta a una instrucción.

### Ejemplo

```vonsim
        org 2000h
salto:  push ax
        ; --- etc ---

        jz salto ; Válido
        jz 2000h ; Inválido, debe ser una etiqueta
        hlt
        end
```

## Codificación

`00100010`, _dir-low_, _dir-high_
