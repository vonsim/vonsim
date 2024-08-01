---
title: JMP
---

# {{ $frontmatter.title }}

Esta instrucción salta incondicionalmente. Los [_flags_](../cpu#flags) no se modifican.

Copiará la dirección de salto en `IP`.

## Uso

```vonsim
JMP etiqueta
```

_etiqueta_ debe ser una etiqueta que apunta a una instrucción.

### Ejemplo

```vonsim
        org 2000h
salto:  push ax
        ; --- etc ---

        jmp salto ; Válido
        jmp 2000h ; Inválido, debe ser una etiqueta
        hlt
        end
```

## Codificación

`00110000`, _dir-low_, _dir-high_
