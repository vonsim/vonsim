---
title: CALL
---

Esta instrucción inicializa una [subrutina](/cpu/#subrutinas). Los [_flags_](/cpu/#flags) no se modifican.

Primero, se apila la dirección de retorno (la dirección de la instrucción siguiente a `CALL`) en la [pila](/cpu/#pila). Luego, se salta a la dirección de la subrutina, es decir, copia la dirección de salto en `IP`.

## Uso

```vonsim
CALL etiqueta
```

_etiqueta_ debe ser una etiqueta que apunta a una instrucción.

### Ejemplo

```vonsim
            org 3000h
subrutina:  push ax
            ; --- etc ---
            ret

            org 2000h
            call subrutina ; Válido
            call 3000h     ; Inválido, debe ser una etiqueta
            hlt
            end
```

## Codificación

`00110001`, _dir-low_, _dir-high_

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
