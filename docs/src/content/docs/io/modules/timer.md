---
title: Timer
---

El _timer_ es un módulo que cuenta con dos registos internos:

- el registro `CONT` (dirección `10h` de la [memoria E/S](/io/modules/)),
- y el registro `COMP` (dirección `11h` de la [memoria E/S](/io/modules/)).

Cuando el [reloj](/io/devices/clock/) hace tic, se incrementa el registro `CONT` en uno. Cuando el registro `CONT` coincide con el registro `COMP`, se dispara una interrupción por la línea `INT1` del [PIC](/io/modules/pic/).

Está basado en el PIT 8253 de Intel, pero con algunas modificaciones para simplificar su funcionamiento.

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
