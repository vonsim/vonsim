# Instrucciones de transferencia de datos

[&larr; Volver al listado](./listado)

## `MOV`

Copia _fuente_ en _dest_.

```asm
MOV dest, fuente
```

Las posibles combinaciones de `dest,fuente` están detalladas [aquí](../modos-de-direccionamiento#combinaciones-dest-fuente).

## `PUSH`

Apila _fuente_ en la [pila](../pila). _fuente_ solo puede ser un registro de 16 bits.

```asm
PUSH fuente
```

## `POP`

Desapila el tope de la [pila](../pila) y lo carga en _dest_. _dest_ solo puede ser un registro de 16 bits.

```asm
POP dest
```

## `PUSHF`

Apila los flags.

```asm
PUSHF ; no recibe operandos
```

## `POPF`

Desapila los flags y los guarda en la ALU.

```asm
POP ; no recibe operandos
```

## `IN`

Carga el valor del puerto _fuente_ en _dest_. Sirve para leer los registros de los [dispositivos](../dispositivos/listado) mediante la memoria E/S.

```asm
IN dest, fuente
```

Las posibles combinaciones de operandos son:

| _dest_ | _fuente_ |
| :----: | :------: |
|  `AL`  | _puerto_ |
|  `AX`  | _puerto_ |
|  `AL`  |   `DX`   |
|  `AX`  |   `DX`   |

donde _puerto_ es una dirección entre 0 y 255 (puede ser un operando inmediato o una etiqueta).

## `OUT`

Carga en el puerto _dest_ el valor en _fuente_. Sirve para escribir en los registros de los [dispositivos](../dispositivos/listado) mediante la memoria E/S.

```asm
OUT dest, fuente
```

Las posibles combinaciones de operandos son:

|  _dest_  | _fuente_ |
| :------: | :------: |
| _puerto_ |   `AL`   |
| _puerto_ |   `AX`   |
|   `DX`   |   `AL`   |
|   `DX`   |   `AX`   |

donde _puerto_ es una dirección entre 0 y 255 (puede ser un operando inmediato o una etiqueta).
