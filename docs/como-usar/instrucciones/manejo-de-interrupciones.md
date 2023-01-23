# Instrucciones de manejo de interrupciones

[&larr; Volver al listado](./listado)

## `INT`

Interrumpe al sistema operativo.

```asm
INT n
```

_n_ debe ser una de las [posibles interrupciones por software](../interrupciones-por-software.md).

## `IRET`

Retorna de una [interrupción por hardware](../interrupciones-por-hardware.md).

```asm
IRET
```

## `CLI`

Inhabilita interrupciones enmascarables.

```asm
CLI
```

## `STI`

Habilita interrupciones enmascarables.

```asm
STI
```
