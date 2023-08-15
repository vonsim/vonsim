---
title: "E/S: Conceptos generales"
---

En el simulador, hay un dos [módulos de E/S](/docs/io/modules/) que están siempre conectados al bus: un [PIC](/docs/io/modules/pic/) y un [_timer_](/docs/io/modules/timer/). Además, dos [dispositivos](/docs/io/devices/): un [reloj](/docs/io/devices/clock/) conectado al _timer_ y una [tecla](/docs/io/devices/f10/) conectada al PIC para interrupir a la CPU. Hay también hay un [teclado](/docs/io/devices/keyboard/) y una [pantalla](/docs/io/devices/screen/), pero no están conectados al bus.

A su vez, el simulador VonSim se puede configurar según las necesidades del usuario. Para ello, se pueden conectar y desconectar módulos y dispositivos de entrada/salida. Las _configuraciones_ disponibles son las siguientes:

- **PIO con teclas y luces**: un [PIO](/docs/io/modules/pio/) conectado a [teclas y luces](/docs/io/devices/switches-and-leds/).
- **PIO con impresora**: un [PIO](/docs/io/modules/pio/) conectado a una [impresora Centronics](/docs/io/devices/printer/).
- **Handshake**: Una [impresora Centronics](/docs/io/devices/printer/) conectada por un [Handshake](/docs/io/modules/handshake).

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
