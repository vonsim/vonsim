# I/O: General Concepts

By default, the only components connected to the bus are the [CPU](../computer/cpu) and the [main memory](../computer/memory). The simulator can be configured to connect input/output [modules](./modules/index) to the bus and other [devices](./devices/index).

These are grouped together, and each of these groups can be connected only if the user desires:

- **Keyboard and screen**: a [keyboard](./devices/keyboard) and a [screen](./devices/screen).
- **PIC**: a [PIC](./modules/pic), along with
  - the [F10 key](./devices/f10) for interrupting,
  - and a [timer](./modules/timer) with its [clock](./devices/clock).
- **PIO**: a [PIO](./modules/pio) that can be connected to
  - [switches and LEDs](./devices/switches-and-leds)
  - or to a [Centronics printer](./devices/printer).
- **Handshake**: A [Centronics printer](./devices/printer) connected via a [Handshake](./modules/handshake) interface.
