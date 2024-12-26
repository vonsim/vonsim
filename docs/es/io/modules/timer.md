# Timer

El _timer_ es un módulo que cuenta con dos registos internos:

- el registro `CONT` (dirección `10h` de la [memoria E/S](./index)),
- y el registro `COMP` (dirección `11h` de la [memoria E/S](./index)).

Cuando el [reloj](../devices/clock) hace tic, se incrementa el registro `CONT` en uno. Empieza a contar luego de la primera escrita al registro `CONT`. Cuando el registro `CONT` coincide con el registro `COMP`, se dispara una interrupción por la línea `INT1` del [PIC](./pic).

Está basado en el PIT 8253 de Intel, pero con algunas modificaciones para simplificar su funcionamiento.
