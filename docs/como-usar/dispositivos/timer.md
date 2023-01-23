# Timer

El timer es un dispositivo interno que cuenta con dos registos de 8 bits:

- el registro `CONT` (dirección `10h` de la memoria E/S),
- y el registro `COMP` (dirección `11h` de la memoria E/S).

El timer incrementa el registro `CONT` en uno cada segundo. Cuando el registro `CONT` coincide con el registro `COMP`, dispara una interrupción por hardware. Está conectado al puerto `INT1` del [PIC](./pic).
