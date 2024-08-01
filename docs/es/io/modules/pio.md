---
title: PIO
---

# {{ $frontmatter.title }}

El _programmed input-output_ (PIO) es un módulo que hace de interfaz para conectar dispositivos genéricos al CPU. Está basado en el PPI 8255 de Intel en su modo "0", pero con algunas modificaciones para simplificar su funcionamiento.

Cuenta con dos puertos de 8 bits (A y B) programables. Los registros disponibles son:

- `PA` (dirección `30h` de la [memoria E/S](./index)),
- `PB` (dirección `31h` de la [memoria E/S](./index)),
- `CA` (dirección `32h` de la [memoria E/S](./index)),
- y `CB` (dirección `33h` de la [memoria E/S](./index)).

El valor del puerto A se encuentra en el registro `PA` y su configuración en el registro `CA`. El registro `CA` también es de 8 bits y le indica al PIO el modo cada bit: un `0` si es de salida y un `1` si es de entrada. Por ejemplo, para `CA = 00001111b`, los cuatro bits más significativos son de salida y los cuatro menos significativos son de entrada. El puerto B funciona idénticamente.

El PIO puede estar conectado a [llaves y luces](../devices/switches-and-leds) o a una [impresora](../devices/printer).
