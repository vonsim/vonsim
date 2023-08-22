---
title: Handshake
head:
  - tag: meta
    attrs:
      { property: og:image, content: https://vonsim.github.io/docs/og/io/modules/handshake.png }
---

El _handshake_ es un dispotivo diseñado con el fin de facilitar la comunicación con las [impresoras Centronics](/docs/io/devices/printer/). Está basado en el PPI 8255 de Intel en su modo "1", pero con algunas modificaciones para simplificar su funcionamiento.

Este cuenta con dos registros de 8 bits:

- el registro de datos (dirección `40h` de la [memoria E/S](/docs/io/modules/)),
- y el registro de estado (dirección `41h` de la [memoria E/S](/docs/io/modules/)).

Específicamente,

```
Datos  = DDDD DDDD
Estado = I___ __SB
```

En el registro de datos se almacenará carácter a imprimir, expresado en ASCII. Cada vez que la CPU escriba sobre ese registro, el _handshake_ se encargará de realizar un flanco ascendente en el _strobe_ para que el carácter se imprima automáticamente.

En el registro de estado, los dos bits menos significativos son el _strobe_ y _busy_ ([leer más sobre los mismos](/docs/io/devices/printer/)), análogamente a como se usan en una impresora conectada con un PIO. La diferencia es que el bit de _busy_ no puede ser modificado por la CPU y el bit de _strobe_ siempre es `0`. Si la CPU trata de escribir un `1` en el bit de _strobe_, este causará un flanco ascendente en el _strobe_, enviando lo almacenado en el registro de datos, y el handshake lo volverá a `0` automáticamente.

Además, el bit más significativo del registro de estado habilita/inhabilita las interrupciones. Si este bit es `1`, mientras la impresora no esté ocupada (`B=0`), el Handshake disparará una interrupción por hardware. Está conectado al puerto `INT2` del [PIC](/docs/io/modules/pic/).

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
