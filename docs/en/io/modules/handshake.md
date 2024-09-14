# Handshake

The _handshake_ is a device designed to facilitate communication with [Centronics printers](../devices/printer). It is based on Intel's PPI 8255 in "mode 1", but with some modifications to simplify its operation.

It has two 8-bit registers:

- the data register (address `40h` in the [I/O memory](./index)),
- and the status register (address `41h` in the [I/O memory](./index)).

Specifically,

```
Data   = DDDD DDDD
Status = I___ __SB
```

The character to be printed, expressed in ASCII, will be stored in the data register. Each time the CPU writes to this register, the _handshake_ will generate a rising edge on the _strobe_ to automatically print the character.

In the status register, the two least significant bits are the _strobe_ and _busy_ ([read more about them](../devices/printer)), analogous to how they are used in a printer connected with a PIO. The difference is that the _busy_ bit cannot be modified by the CPU and the _strobe_ bit is always `0`. If the CPU tries to write a `1` to the _strobe_ bit, this will cause a rising edge on the _strobe_, sending what is stored in the data register, and the handshake will automatically return it to `0`.

Additionally, the most significant bit of the status register enables/disables interrupts. If this bit is `1`, while the printer is not busy (`B=0`), the Handshake will trigger a hardware interrupt. It is connected to the `INT2` port of the [PIC](./pic).
