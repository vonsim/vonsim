# Instrucciones aritméticas

[&larr; Volver al listado](./listado)

## `ADD`

Suma _fuente_ y _dest_ y guarda el resultado en _dest_.

```asm
ADD dest, fuente
```

Las posibles combinaciones de `dest,fuente` están detalladas [aquí](../modos-de-direccionamiento#combinaciones-dest-fuente).

## `ADC`

Suma _fuente_, _dest_ y la flag C y guarda el resultado en _dest_.

```asm
ADC dest, fuente
```

Las posibles combinaciones de `dest,fuente` están detalladas [aquí](../modos-de-direccionamiento#combinaciones-dest-fuente).

## `SUB`

Resta _fuente_ a _dest_ y guarda el resultado en _dest_.

```asm
SUB dest, fuente
```

Las posibles combinaciones de `dest,fuente` están detalladas [aquí](../modos-de-direccionamiento#combinaciones-dest-fuente).

## `SBB`

Resta _fuente_ y la flag C a _dest_ y guarda el resultado en _dest_.

```asm
SBB dest, fuente
```

Las posibles combinaciones de `dest,fuente` están detalladas [aquí](../modos-de-direccionamiento#combinaciones-dest-fuente).

## `CMP`

Compara _fuente_ con _dest_. Es equivalente a hacer `SUB dest,fuente` pero sin guardar el resultado en memoria.

```asm
CMP dest, fuente
```

Las posibles combinaciones de `dest,fuente` están detalladas [aquí](../modos-de-direccionamiento#combinaciones-dest-fuente).

## `NEG`

Negativo de _dest_. Guarda el complemento a 2 (Ca2) de _dest_ en _dest_.

```asm
NEG dest
```

Las posibles combinaciones de `dest` están detalladas [aquí](../modos-de-direccionamiento#combinaciones-dest).

## `INC`

Incrementa _dest_ en 1.

```asm
INC dest
```

Las posibles combinaciones de `dest` están detalladas [aquí](../modos-de-direccionamiento#combinaciones-dest).

## `DEC`

Disminuye _dest_ en 1.

```asm
DEC dest
```

Las posibles combinaciones de `dest` están detalladas [aquí](../modos-de-direccionamiento#combinaciones-dest).
