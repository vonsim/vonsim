# JNC

Esta instrucción salta solo sí `CF=0`. Los [_flags_](../cpu#flags) no se modifican.

De saltar, copiará la dirección de salto en `IP`.

## Uso

```vonsim
JNC etiqueta
```

_etiqueta_ debe ser una etiqueta que apunta a una instrucción.

### Ejemplo

```vonsim
        org 2000h
salto:  push ax
        ; --- etc ---

        jnc salto ; Válido
        jnc 2000h ; Inválido, debe ser una etiqueta
        hlt
        end
```

## Codificación

`00100001`, _dir-low_, _dir-high_
