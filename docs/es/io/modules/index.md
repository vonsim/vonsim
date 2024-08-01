---
title: Memoria E/S
---

# {{ $frontmatter.title }}

La memoria de entrada/salida se encuentra aislada de la memoria principal. Es decir, para acceder a ella se utilizan exclusivamente las instrucciones [`IN`](../../computer/instructions/in) y [`OUT`](../../computer/instructions/out). Cuando se quiere acceder a un módulo de entrada/salida, la [CPU](../../computer/cpu) activa la señal `IO/M`, lo que causa que un selector de chips (_chip select_) lea la dirección del bus del direcciones y envíe la señal de lectura/escritura al módulo correspondiente.

El rango de direcciones de la memoria de entrada/salida es de `00h` hasta `FFh` (256 direcciones).

## Registros de E/S

Estos son las registros de entrada/salida disponibles en el simulador, todos de 8 bits:

| Dirección | Nombre  | Módulo                   |
| :-------: | :-----: | :----------------------- |
|   `10h`   | `CONT`  | [Timer](./timer)         |
|   `11h`   | `COMP`  | [Timer](./timer)         |
|   `20h`   |  `EOI`  | [PIC](./pic)             |
|   `21h`   |  `IMR`  | [PIC](./pic)             |
|   `22h`   |  `IRR`  | [PIC](./pic)             |
|   `23h`   |  `ISR`  | [PIC](./pic)             |
|   `24h`   | `INT0`  | [PIC](./pic)             |
|   `25h`   | `INT1`  | [PIC](./pic)             |
|   `26h`   | `INT2`  | [PIC](./pic)             |
|   `27h`   | `INT3`  | [PIC](./pic)             |
|   `28h`   | `INT4`  | [PIC](./pic)             |
|   `29h`   | `INT5`  | [PIC](./pic)             |
|   `2Ah`   | `INT6`  | [PIC](./pic)             |
|   `2Bh`   | `INT7`  | [PIC](./pic)             |
|   `30h`   |  `PA`   | [PIO](./pio)             |
|   `31h`   |  `PB`   | [PIO](./pio)             |
|   `32h`   |  `CA`   | [PIO](./pio)             |
|   `33h`   |  `CB`   | [PIO](./pio)             |
|   `40h`   | `DATA`  | [Handshake](./handshake) |
|   `41h`   | `STATE` | [Handshake](./handshake) |
