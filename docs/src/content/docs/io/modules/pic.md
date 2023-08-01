---
title: PIC
---

El _programmable interrupt controller_ (PIC) es un módulo que se encuentra entre los dispositvos que emiten [interrupciones](/docs/cpu/#interrupciones) y la CPU. Como la CPU tiene solo una línea de entrada, este dispositivo se encarga de recibir interrupciones de múltiples dispositivos y multiplexar sus pedidos en esta única línea.

Está basado en el PIC 8259A de Intel, pero con algunas modificaciones para simplificar su funcionamiento.

## Líneas

El PIC cuenta con 8 líneas: de la `INT0` a la `INT7` (no todas son utilizadas). Cada línea tiene un registro de 8 bits en la memoria E/S relacionado. La línea `INT0` tiene la dirección `24h`, la línea `INT1` tiene la dirección `25h`, y así hasta la línea `INT7`, con la dirección `2Bh`. En cada uno de estos registros se almacena el número de interrupción corresponde a cada línea.

Cuando uno de los módulos/dispositvos quiera interrumpir a la CPU, el número de interrupción que PIC enviará será el almacenado en el registro correspondiente a la línea que se interrumpió, independizando así el número de interrupción del número de línea.

Las líneas están conectadas a los siguientes dispositivos:

| Línea  | Módulo/Disp.                             |
| :----: | :--------------------------------------- |
| `INT0` | [Tecla F10](/docs/io/devices/f10/)       |
| `INT1` | [Timer](/docs/io/devices/timer/)         |
| `INT2` | [Handshake](/docs/io/devices/handshake/) |
| `INT3` | --                                       |
| `INT4` | --                                       |
| `INT5` | --                                       |
| `INT6` | --                                       |
| `INT7` | --                                       |

## Control

El PIC cuenta con tres registros adiciones de control. En los siguientes registros, cada bit corresponde con una línea de interrupción: el bit menos significativo corresponde a la línea `INT0` y el más significativo a la línea `INT7`.

El registro `IMR` o _interrupt mask register_ (dirección `21h` de la [memoria E/S](/docs/io/modules/)) es el que se utiliza para enmascarar (o "inhabilitar") líneas de interrupción. Si el bit correspondiente a una línea es `1`, esta línea está enmascarada y no se emitirá la interrupción a la CPU. Si el bit es `0`, la línea está habilitada y se emitirá la interrupción a la CPU. Este puede ser modificado por la CPU.

El registro `IRR` o _interrupt request register_ (dirección `22h` de la [memoria E/S](/docs/io/modules/)) indica las interrupciones pendientes. Si el bit correspondiente a una línea es `1`, esta línea tiene una interrupción pendiente. Si el bit es `0`, no tiene interrupciones pendientes. Este es modificado por el PIC y es de solo lectura para la CPU.

El registro `ISR` o _in-service register_ (dirección `23h` de la [memoria E/S](/docs/io/modules/)) indica qué interrupción está siendo atendida en un instante dado. Si el bit correspondiente a una línea es `1`, esta línea está siendo atendida. Si el bit es `0`, no está siendo atendida. Este es modificado por el PIC y es de solo lectura para la CPU.

## Funcionamiento

Cuando una línea de interrupción se activa, el PIC la encola en el registro `IRR`. Si la línea no está enmascarada y no hay otra interrupción siendo atendida (es decir, si `ISR = 00h`), el PIC envía la señal de interrupción a la CPU activando línea `INTR`.

Cuando la CPU esté lista para atender la interrupción, esta activa la línea `INTA`. En este momento, el PIC marca la línea como _in-service_ en el registro `ISR` y la saca de la cola en el registro `IRR`.

Luego de un tiempo dado, la CPU apaga y enciende la línea `INTA` nuevamente. Ahora, el PIC envía por el bus de datos el número de interrupción correspondiente a la línea que está siendo atendida. La CPU recibe este número y lo utiliza para acceder al vector de interrupciones y ejecutar la rutina de interrupción correspondiente. Finalmente, la CPU apaga la línea `INTA`.

Por último, para indicarle al PIC que la la rutina de interrupción terminó, la CPU escribe en la dirección `20h` de la [memoria E/S](/docs/io/modules/) el byte de fin de interrupción o `EOI`, que es, coincidentemente, `20h`. Al leer este byte, el PIC apaga la línea `INTR` y desmarca la línea como _in-service_ en el registro `ISR`. Si hay interrupciones pendientes, el PIC activa la línea `INTR` nuevamente, repitiendo el proceso.

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>