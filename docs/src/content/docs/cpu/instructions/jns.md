---
title: JNS
---

Esta instrucción salta solo sí `SF=0`. Los [_flags_](/docs/cpu/#flags) no se modifican.

De saltar, copiará la dirección de salto en `IP`.

## Uso

```vonsim
JNS etiqueta
```

_etiqueta_ debe ser una etiqueta que apunta a una instrucción.

### Ejemplo

```vonsim
        org 2000h
salto:  push ax
        ; --- etc ---

        jns salto ; Válido
        jns 2000h ; Inválido, debe ser una etiqueta
        hlt
        end
```

## Codificación

`00100101`, _dir-low_, _dir-high_

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
