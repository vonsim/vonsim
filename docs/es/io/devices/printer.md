---
title: Impresora
---

# {{ $frontmatter.title }}

El simulador cuenta con una impresora con un puerto paralelo tipo _Centronics_. Esta cuenta con papel y un _buffer_.

Esta impresora recibe un carácter por vez, y lo imprime en el papel. Como la impresora es lenta, el carácter no se imprime inmediatamente, sino que se almacena en un _buffer_ interno. Cuando la impresora termina de imprimir un carácter, imprime el siguiente, y así sucesivamente hasta que el _buffer_ se vacíe.

El tiempo que tarda la impresora en imprimir un carácter es configurable.

Si el _buffer_ se encuentra lleno y aún así se envía un carácter, este se pierde. Para evitar eso, la impresora provee el flag _busy_: cuando es `1`, el _buffer_ está lleno.

Cada vez que se envía un carácter, si el _buffer_ no está lleno, el flag _busy_ se pone en `1`. Luego, si el _buffer_ se llenó, este quedará en `1` hasta que se imprima algún carácter. De lo contrario, ni bien se agrege el carácter al _buffer_, el flag _busy_ volverá a `0`.

## Imprimir con PIO

Una opción es conectar la impresora al [PIO](../modules/pio). La conexión queda así:

```
PA = ____ __SB
PB = DDDD DDDD
```

En `PB` se almacenará carácter a imprimir, expresado en ASCII. En `PA`, los seis bits más significativos no hacen nada. El bit menos significativo es la flag _busy_. Y el que queda es el _strobe_.

El _strobe_ es el bit que le indica a la impresora que queremos imprimir. Las impresoras Centronics toman el valor en `PB` cuando detectan un flanco ascendente en el _strobe_. Es decir, una transición de `S=0` a `S=1`.

En resumen, para imprimir un carácter, hay que

1. verificar que el _buffer_ no esté lleno (flag _busy_),
2. escribir el carácter en `PB`,
3. poner el _strobe_ en 0,
4. poner el _strobe_ en 1.

## Imprimir con Handshake

A diferencia del PIO, el [Handshake](../modules/handshake) es un módulo diseñado específicamente para las impresoras Centronics.

Con el Handshake no hay que preocuparse por el _strobe_, ya que este automatiza el flanco ascendente. Así, para imprimir basta con

1. verificar que el _buffer_ no esté lleno (flag _busy_),
2. escribir el carácter en el registro de datos.

Más información sobre el Handshake y sus funcionalidades [aquí](../modules/handshake).

## Caracteres especiales

Además de los caracteres ASCII comunes, hay otros dos que pueden resultar útiles:

- el carácter de salto de línea (`LF`, 10 en decimal) imprime, en efecto, un salto de línea — útil para no imprimir todo en una sola línea;
- el carácter de _form feed_ (`FF`, 12 en decimal) limpia la impresora (dicho de otra forma, arranca la hoja).
