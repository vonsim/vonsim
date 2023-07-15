---
title: "E/S: Conceptos generales"
---

En el simulador, hay un dos [módulos de E/S](/io/modules/) que están siempre conectados al bus: un [PIC](/io/modules/pic/) y un [_timer_](/io/modules/timer/). Además, dos [dispositivos](/io/devices/): un [reloj](/io/devices/clock/) conectado al _timer_ y una [tecla](/io/devices/f10/) conectada al PIC para interrupir a la CPU. Hay también una [consola](/io/devices/console/), pero esta no está conectada al bus ([por qué](/io/devices/console/)).

A su vez, el simulador VonSim se puede configurar según las necesidades del usuario. Para ello, se pueden conectar y desconectar módulos y dispositivos de entrada/salida. Las _configuraciones_ disponibles son las siguientes:

- **PIO con teclas y luces**: un [PIO](/io/modules/pio/) conectado a [teclas y luces](/io/devices/switches-and-leds/).
- **PIO con impresora**: un [PIO](/io/modules/pio/) conectado a una [impresora Centronics](/io/devices/printer/).
- **Handshake**: Una [impresora Centronics](/io/devices/printer/) conectada por un [Handshake](/io/modules/handshake).

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
