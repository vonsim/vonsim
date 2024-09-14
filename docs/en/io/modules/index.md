# I/O Memory

The input/output memory is isolated from the main memory. In other words, it can only be accessed using the [`IN`](../../computer/instructions/in) and [`OUT`](../../computer/instructions/out) instructions. When access to an input/output module is required, the [CPU](../../computer/cpu) activates the `IO/M` signal, which causes a chip select to read the address from the address bus and send the read/write signal to the corresponding module.

The address range for the input/output memory is from `00h` to `FFh` (256 addresses).

## I/O Registers

These are the input/output registers available in the simulator, all 8 bits wide:

| Address |  Name   | Module                   |
| :-----: | :-----: | :----------------------- |
|  `10h`  | `CONT`  | [Timer](./timer)         |
|  `11h`  | `COMP`  | [Timer](./timer)         |
|  `20h`  |  `EOI`  | [PIC](./pic)             |
|  `21h`  |  `IMR`  | [PIC](./pic)             |
|  `22h`  |  `IRR`  | [PIC](./pic)             |
|  `23h`  |  `ISR`  | [PIC](./pic)             |
|  `24h`  | `INT0`  | [PIC](./pic)             |
|  `25h`  | `INT1`  | [PIC](./pic)             |
|  `26h`  | `INT2`  | [PIC](./pic)             |
|  `27h`  | `INT3`  | [PIC](./pic)             |
|  `28h`  | `INT4`  | [PIC](./pic)             |
|  `29h`  | `INT5`  | [PIC](./pic)             |
|  `2Ah`  | `INT6`  | [PIC](./pic)             |
|  `2Bh`  | `INT7`  | [PIC](./pic)             |
|  `30h`  |  `PA`   | [PIO](./pio)             |
|  `31h`  |  `PB`   | [PIO](./pio)             |
|  `32h`  |  `CA`   | [PIO](./pio)             |
|  `33h`  |  `CB`   | [PIO](./pio)             |
|  `40h`  | `DATA`  | [Handshake](./handshake) |
|  `41h`  | `STATE` | [Handshake](./handshake) |
