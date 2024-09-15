# E/S: Conceptos generales

Por defecto, los únicos componentes conectados al bus la [CPU](../computer/cpu) y la [memoria principal](../computer/memory). El simulador puede configurarse para conectar [módulos](./modules/index) de entrada/salida al bus y otros [dispositivos](./devices/index).

Estos se encuentran agrupados, y cada uno de estos grupos puede conectarse solo si lo desea el usuario:

- **Teclado y pantalla**: un [teclado](./devices/keyboard) y una [pantalla](./devices/screen).
- **PIC**: un [PIC](./modules/pic), además de
  - la [tecla F10](./devices/f10) para interrumpir,
  - y un [timer](./modules/timer) con su [reloj](./devices/clock).
- **PIO**: un [PIO](./modules/pio) que puede conectarse a
  - [llaves y luces](./devices/switches-and-leds)
  - o a una [impresora Centronics](./devices/printer).
- **Handshake**: Una [impresora Centronics](./devices/printer) conectada por un [Handshake](./modules/handshake).
