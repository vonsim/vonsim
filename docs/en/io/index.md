# I/O: General Concepts

By default, the only components connected to the bus are the [CPU](../computer/cpu) and the [main memory](../computer/memory). The simulator can be configured to connect [input/output modules](./modules/index) to the bus and other [devices](./devices/index). These are grouped into sets or configurations:

- **Keyboard and screen**: a [keyboard](./devices/keyboard) and a [screen](./devices/screen).
- **PIO with switches and lights**: a [PIO](./modules/pio) connected to [switches and lights](./devices/switches-and-leds).
- **PIO with printer**: a [PIO](./modules/pio) connected to a [Centronics printer](./devices/printer).
- **Handshake**: A [Centronics printer](./devices/printer) connected via a [Handshake](./modules/handshake).

The last three also include a [PIC](./modules/pic), the [F10 key](./devices/f10) for interrupts, a [timer](./modules/timer) with its [clock](./devices/clock), a [screen](./devices/screen), and a [keyboard](./devices/keyboard).