# E/S: Conceptos generales

Por defecto, los únicos componentes conectados al bus la [CPU](../computer/cpu) y la [memoria principal](../computer/memory). El simulador puede configurarse para conectar [módulos](./modules/index) de entrada/salida al bus y otros [dispositivos](./devices/index). Estos se encuentrar agrupados en conjuntos o configuraciones:

- **Teclado y pantalla**: un [teclado](./devices/keyboard) y una [pantalla](./devices/screen).
- **PIO con llaves y luces**: un [PIO](./modules/pio) conectado a [llaves y luces](./devices/switches-and-leds).
- **PIO con impresora**: un [PIO](./modules/pio) conectado a una [impresora Centronics](./devices/printer).
- **Handshake**: Una [impresora Centronics](./devices/printer) conectada por un [Handshake](./modules/handshake).

Las últimas tres, además, incluyen un [PIC](./modules/pic), la [tecla F10](./devices/f10) para interrumpir, un [timer](./modules/timer) con su [reloj](./devices/clock), una [pantalla](./devices/screen) y un [teclado](./devices/keyboard).
