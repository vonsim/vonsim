# Instrucciones transferencia de control

[&larr; Volver al listado](./listado)

## `CALL`

Llama a [subrutina](../subrutinas) cuyo inicio es _etiqueta_.

```vonsim
CALL etiqueta
```

## `RET`

Retorna de la [subrutina](../subrutinas).

```vonsim
RET
```

## `JZ`

Salta si el último valor calculado es cero (flag Z=1).

```vonsim
JZ etiqueta
```

## `JNZ`

Salta si el último valor calculado no es cero (flag Z=0).

```vonsim
JNZ etiqueta
```

## `JS`

Salta si el último valor calculado es negativo (flag S=1).

```vonsim
JS etiqueta
```

## `JNS`

Salta si el último valor calculado no es negativo (flag S=0).

```vonsim
JNS etiqueta
```

## `JC`

Salta si el último valor calculado produjo carry (flag C=1).

```vonsim
JC etiqueta
```

## `JNC`

Salta si el último valor calculado no produjo carry (flag C=0).

```vonsim
JNC etiqueta
```

## `JO`

Salta si el último valor calculado produjo overflow (flag O=1).

```vonsim
JO etiqueta
```

## `JNO`

Salta si el último valor calculado no produjo overflow (flag O=0).

```vonsim
JNO etiqueta
```

## `JMP`

Salto incondicional a _etiqueta_

```vonsim
JNO etiqueta
```
