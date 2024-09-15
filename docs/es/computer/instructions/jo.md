# JO

Esta instrucción salta solo sí `OF=1`. Los [_flags_](../cpu#flags) no se modifican.

De saltar, copiará la dirección de salto en `IP`.

## Uso

```vonsim
JO etiqueta
```

_etiqueta_ debe ser una etiqueta que apunta a una instrucción.

### Ejemplo

```vonsim
        org 2000h
salto:  push ax
        ; --- etc ---

        jo salto ; Válido
        jo 2000h ; Inválido, debe ser una etiqueta
        hlt
        end
```

## Codificación

`00100110`, _dir-low_, _dir-high_
