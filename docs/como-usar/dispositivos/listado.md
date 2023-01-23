# Dispositivos

Dispositivos internos:

- [Handshake](./handshake)
- [PIC](./pic)
- [PIO](./pio)
- [Timer](./timer)

Dispositivos externos:

- [Consola](./consola)
- [Impresora](./impresora)
- [Tecla F10](./f10)
- [Teclas y leds](./teclas-y-leds)

## Registros

Tabla de todos los registros accesibles mediante la memoria E/S.

| Dirección | Registro |       Dispositivo        |
| :-------: | :------: | :----------------------: |
|   `10h`   |  `CONT`  |     [Timer](./timer)     |
|   `11h`   |  `COMP`  |     [Timer](./timer)     |
|   `20h`   |  `EOI`   |       [PIC](./pic)       |
|   `21h`   |  `IMR`   |       [PIC](./pic)       |
|   `22h`   |  `IRR`   |       [PIC](./pic)       |
|   `23h`   |  `ISR`   |       [PIC](./pic)       |
|   `23h`   |  `ISR`   |       [PIC](./pic)       |
|   `24h`   |  `INT0`  |       [PIC](./pic)       |
|   `25h`   |  `INT1`  |       [PIC](./pic)       |
|   `26h`   |  `INT2`  |       [PIC](./pic)       |
|   `27h`   |  `INT3`  |       [PIC](./pic)       |
|   `28h`   |  `INT4`  |       [PIC](./pic)       |
|   `29h`   |  `INT5`  |       [PIC](./pic)       |
|   `2Ah`   |  `INT6`  |       [PIC](./pic)       |
|   `2Bh`   |  `INT7`  |       [PIC](./pic)       |
|   `30h`   |   `PA`   |       [PIO](./pio)       |
|   `31h`   |   `PB`   |       [PIO](./pio)       |
|   `32h`   |   `CA`   |       [PIO](./pio)       |
|   `33h`   |   `CB`   |       [PIO](./pio)       |
|   `40h`   |   Dato   | [Handshake](./handshake) |
|   `41h`   |  Estado  | [Handshake](./handshake) |
