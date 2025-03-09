# Printer

The simulator includes a printer with a Centronics parallel port. This printer has paper and a buffer.

This printer receives one character at a time and prints it on the paper. Since the printer is slow, the character is not printed immediately; instead, it is stored in an internal buffer. When the printer finishes printing one character, it prints the next one, and so on, until the buffer is emptied.

The time it takes for the printer to print a character is configurable.

If the buffer is full and a character is sent, it will be lost. To prevent this, the printer provides the busy flag: when it is `1`, the buffer is full.

Each time a character is sent, if the buffer is not full, the busy flag is set to `1`. If the buffer becomes full, it will remain `1` until a character is printed. Otherwise, as soon as the character is added to the buffer, the busy flag will return to `0`.

## Printing with PIO

One option is to connect the printer to the [PIO](../modules/pio). The connection is as follows:

```
PA = ____ __SB
PB = DDDD DDDD
```

In `PB`, the character to be printed is stored, expressed in ASCII. In `PA`, the six most significant bits do nothing. The least significant bit is the busy flag, and the remaining bit is the strobe.

The strobe is the bit that indicates to the printer that we want to print. Centronics printers take the value in `PB` when they detect a rising edge in the strobe, meaning a transition from `S=0` to `S=1`.

In summary, to print a character, you must:

1. Check that the buffer is not full (busy flag),
2. Write the character to `PB`,
3. Set the strobe to 0,
4. Set the strobe to 1.

## Printing with Handshake

Unlike the PIO, the [Handshake](../modules/handshake) is a module specifically designed for Centronics printers.

With the Handshake, there is no need to worry about the strobe, as it automates the rising edge. Thus, to print, you only need to:

1. Check that the buffer is not full (busy flag),
2. Write the character to the data register.

More information about the Handshake and its functionalities can be found [here](../modules/handshake).

## Special Characters

In addition to common ASCII characters, there are two others that can be useful:

- The line feed character (`LF`, 10 in decimal) effectively prints a line break — useful for not printing everything on a single line.
- The form feed character (`FF`, 12 in decimal) clears the printer (in other words, it starts a new page).
