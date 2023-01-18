# Instrucciones de manejo de interrupciones

[&larr; Volver al listado](./listado)

## `INT`

Interrumpe al sistema operativo.

```asm
INT n
```

_n_ debe ser una de las [posibles interrupciones de software](../dispositivos/interrupciones-de-software.md).

## `IRET`

Retorna de una interrupción.

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
