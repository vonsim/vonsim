# Instrucciones transferencia de control

[&larr; Volver al listado](./listado)

## `CALL`

Llama a [subrutina](../subrutinas) cuyo inicio es _etiqueta_.

```asm
CALL etiqueta
```

## `RET`

Retorna de la [subrutina](../subrutinas).

```asm
RET
```

## `JZ`

Salta si el último valor calculado es cero (flag Z=1).

```asm
JZ etiqueta
```

## `JNZ`

Salta si el último valor calculado no es cero (flag Z=0).

```asm
JNZ etiqueta
```

## `JS`

Salta si el último valor calculado es negativo (flag S=1).

```asm
JS etiqueta
```

## `JNS`

Salta si el último valor calculado no es negativo (flag S=0).

```asm
JNS etiqueta
```

## `JC`

Salta si el último valor calculado produjo carry (flag C=1).

```asm
JC etiqueta
```

## `JNC`

Salta si el último valor calculado no produjo carry (flag C=0).

```asm
JNC etiqueta
```

## `JO`

Salta si el último valor calculado produjo overflow (flag O=1).

```asm
JO etiqueta
```

## `JNO`

Salta si el último valor calculado no produjo overflow (flag O=0).

```asm
JNO etiqueta
```

## `JMP`

Salto incondicional a _etiqueta_

```asm
JNO etiqueta
```
