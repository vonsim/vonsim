---
title: PIO
head:
  - tag: meta
    attrs: { property: og:image, content: https://vonsim.github.io/docs/og/io/modules/pio.png }
---

El _programmed input-output_ (PIO) es un módulo que hace de interfaz para conectar dispositivos genéricos al CPU. Está basado en el PPI 8255 de Intel en su modo "0", pero con algunas modificaciones para simplificar su funcionamiento.

Cuenta con dos puertos de 8 bits (A y B) programables. Los registros disponibles son:

- `PA` (dirección `30h` de la [memoria E/S](/docs/io/modules/)),
- `PB` (dirección `31h` de la [memoria E/S](/docs/io/modules/)),
- `CA` (dirección `32h` de la [memoria E/S](/docs/io/modules/)),
- y `CB` (dirección `33h` de la [memoria E/S](/docs/io/modules/)).

El valor del puerto A se encuentra en el registro `PA` y su configuración en el registro `CA`. El registro `CA` también es de 8 bits y le indica al PIO el modo cada bit: un `0` si es de salida y un `1` si es de entrada. Por ejemplo, para `CA = 00001111b`, los cuatro bits más significativos son de salida y los cuatro menos significativos son de entrada. El puerto B funciona idénticamente.

El PIO puede estar conectado a [llaves y luces](/docs/io/devices/switches-and-leds/) o a una [impresora](/docs/io/devices/printer/).

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
