---
title: JMP
head:
  - tag: meta
    attrs:
      { property: og:image, content: https://vonsim.github.io/docs/og/cpu/instructions/jmp.png }
---

Esta instrucción salta incondicionalmente. Los [_flags_](/docs/cpu/#flags) no se modifican.

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

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
