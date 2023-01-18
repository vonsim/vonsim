# PIO

El _programmed input-output_ (PIO) es un dispositivo interno que hace de interfaz para conectar dispositivos genéricos al CPU. Cuenta con dos puertos de 8 bits (A y B) programables.

Los registros disponibles son:

- `PA` (dirección `30h` de la memoria E/S),
- `PB` (dirección `31h` de la memoria E/S),
- `CA` (dirección `32h` de la memoria E/S),
- y `CB` (dirección `33h` de la memoria E/S).

El valor del puerto A se encuentra en el registro `PA` y su configuración en el registro `CA`. El registro `CA` también es de 8 bits y le indica al PIO el modo cada bit: un `0` si es de salida y un `1` si es de entrada. Por ejemplo, para `CA = 00001111b`, los cuatro bits más significativos son de salida y los cuatro menos significativos son de entrada.

El puerto B funciona idénticamente.
