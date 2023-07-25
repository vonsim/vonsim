---
title: Memoria E/S
---

VonSim implementa dos "memorias". Una es la memoria principal de almacenamiento, que cuenta con 32 kB de espacio (`0000h` hasta `7FFFh`) y donde se almacenan los programas y datos.

La otra es la memoria de entrada/salida, a la que se accede con direcciones de un byte (`00h` hasta `FFh`) y se encuentra aislada de la memoria principal. Es decir, para acceder a ella se utilizan exclusivamente las instrucciones [`IN`](/docs/cpu/instructions/in/) y [`OUT`](/docs/cpu/instructions/out/). Cuando se quiere acceder a un módulo de entrada/salida, la [CPU](/docs/cpu/) activa la señal `M/IO`, lo que causa que un selector de chips (_chip select_) lea la dirección del bus del direcciones y envíe la señal de lectura/escritura al módulo correspondiente.

## Registros de E/S

Estos son las registros de entrada/salida disponibles en el simulador, todos de 8 bits:

| Dirección | Nombre  | Módulo                                   |
| :-------: | :-----: | :--------------------------------------- |
|   `10h`   | `CONT`  | [Timer](/docs/io/modules/timer/)         |
|   `11h`   | `COMP`  | [Timer](/docs/io/modules/timer/)         |
|   `20h`   |  `EOI`  | [PIC](/docs/io/modules/pic/)             |
|   `21h`   |  `IMR`  | [PIC](/docs/io/modules/pic/)             |
|   `22h`   |  `IRR`  | [PIC](/docs/io/modules/pic/)             |
|   `23h`   |  `ISR`  | [PIC](/docs/io/modules/pic/)             |
|   `24h`   | `INT0`  | [PIC](/docs/io/modules/pic/)             |
|   `25h`   | `INT1`  | [PIC](/docs/io/modules/pic/)             |
|   `26h`   | `INT2`  | [PIC](/docs/io/modules/pic/)             |
|   `27h`   | `INT3`  | [PIC](/docs/io/modules/pic/)             |
|   `28h`   | `INT4`  | [PIC](/docs/io/modules/pic/)             |
|   `29h`   | `INT5`  | [PIC](/docs/io/modules/pic/)             |
|   `2Ah`   | `INT6`  | [PIC](/docs/io/modules/pic/)             |
|   `2Bh`   | `INT7`  | [PIC](/docs/io/modules/pic/)             |
|   `30h`   |  `PA`   | [PIO](/docs/io/modules/pio/)             |
|   `31h`   |  `PB`   | [PIO](/docs/io/modules/pio/)             |
|   `32h`   |  `CA`   | [PIO](/docs/io/modules/pio/)             |
|   `33h`   |  `CB`   | [PIO](/docs/io/modules/pio/)             |
|   `40h`   | `DATA`  | [Handshake](/docs/io/modules/handshake/) |
|   `41h`   | `STATE` | [Handshake](/docs/io/modules/handshake/) |

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
