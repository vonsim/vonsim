# PIO

The _programmed input-output_ (PIO) is a module that serves as an interface to connect generic devices to the CPU. It is based on Intel's PPI 8255 in "mode 0," but with some modifications to simplify its operation.

It has two programmable 8-bit ports (A and B). The available registers are:

- `PA` (address `30h` in the [I/O memory](./index)),
- `PB` (address `31h` in the [I/O memory](./index)),
- `CA` (address `32h` in the [I/O memory](./index)),
- and `CB` (address `33h` in the [I/O memory](./index)).

The value of port A is stored in the `PA` register, and its configuration is stored in the `CA` register. The `CA` register is also 8 bits and tells the PIO the mode of each bit: a `0` if it's an output, and a `1` if it's an input. For example, with `CA = 00001111b`, the four most significant bits are outputs, and the four least significant bits are inputs. Port B works in the same way.

The PIO can be connected to [switches and LEDs](../devices/switches-and-leds) or to a [printer](../devices/printer).
