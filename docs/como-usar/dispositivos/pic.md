# PIC

El _programmable interrupt controller_ (PIC) es un dispositivo interno que se encuentra entre los dispositvos que emiten [interrupciones](../interrupciones-por-hardware) y la CPU. Como la CPU tiene solo una línea de entrada, este dispositivo se encarga de recibir interrupciones de múltiples dispositivos y multiplexar sus pedidos en esta única línea.

## Líneas

El PIC cuenta con 8 líneas: de la `INT0` a la `INT7` (no todas son utilizadas). Cada línea tiene un registro de 8 bits en la memoria E/S relacionado. La línea `INT0` tiene la dirección `24h`, la línea `INT1` tiene la dirección `25h`, y así hasta la línea `INT7`, con la dirección `2Bh`. En cada uno de estos registros se programará qué ID N le corresponde a cada línea.

Por ejemplo, sé que la tecla F10 está conectada a la línea `INT0`. Ahora, quiero que cuando presione la tecla F10 a la CPU le llegue una interrupción con ID N igual a 55. Entonces, escribo 55 en el registro `24h`: `OUT 24h, 55`.

## Control

Sabiendo cómo programar las distintas líneas, podemos entender cómo funciona el resto del PIC. Este cuenta con los siguientes registros de 8 bits:

- el registro `EOI` o _end of interrupt_ (dirección `20h` de la memoria E/S),
- el registro `IMR` o _interrupt mask register_ (dirección `21h` de la memoria E/S),
- el registro `IRR` o _interrupt request register_ (dirección `22h` de la memoria E/S),
- y el registro `ISR` o _in-service register_ (dirección `23h` de la memoria E/S).

El primero es el que utilizará la CPU para avisarle al PIO que terminó de procesar la interrupción. Avisa esto escribiendo `20h` en este registro. Esto es así porque pueden dispararse muchas interrupciones en un lapso corto de tiempo, pero el PIC solo puede emitir una a la vez. Por eso necesita saber cuándo la CPU está libre para recibir otra interrupción.

El registro `IMR` denota qué interrupciones están _enmascaradas_: con un `1` se enmascaran (es decir, inhabilitan) y con un `0` se habilitan. Mientras una línea esté enmascarada, no se emitirá la interrupción a la CPU. Cada bit de este registro corresponde con una línea:

```
IMR = 7654 3210
```

El bit más significativo corresponde a la línea `INT7` y el menos significativo a la línea `INT0`.

El registro `IRR` denota las interrupciones pendientes con un `1` y la ausencia de las mismas con un `0`. Al igual que en el `IMR`, cada bit corresponde con una línea.

Finalmente, el registro `ISR` denota cuál es la interrupción que está siendo procesada por la CPU.
