---
title: "CPU: Conceptos generales"
head:
  - tag: meta
    attrs: { property: og:image, content: https://vonsim.github.io/docs/og/cpu.png }
---

El procesador que utiliza este entorno de simulación está basado en el **Intel 8088**. Puede ver más sobre la arquitectura original del mismo en su [hoja de especificaciones](https://www.ceibo.com/eng/datasheets/Intel-8088-Data-Sheet.pdf).

El mismo se caracteriza principalmente por poder hacer operaciones de 8 y 16 bits, siendo las últimas del tipo _little-endian_.

## Puertos

El procesador cuenta con los siguientes puertos:

- 16 bits de direcciones de memoria (bus de direcciones, con su respectivo _buffer_ `MAR`)
- 8 bits de datos (bus de datos, con su respectivo _buffer_ `MBR`)
- 1 bit para la señal de lectura (`RD`)
- 1 bit para la señal de escritura (`WR`)
- 1 bit para indicar si la escritura es a [memoria principal](/docs/memory/) o a un módulo de [entrada/salida](/docs/io/modules/) (`IO/M`, siendo `1` para E/S)
- 1 bit para la petición de interrupción (`INTR`)
- 1 bit para la señal de _acknowledge_ de interrupción (`INTA`)

## Registros

El procesador cuenta con cuatro registros de propósito general de 16 bits: `AX`, `BX`, `CX` y `DX`. Los mismos también pueden ser accedidos parcialmente como registros de 8 bits: `AH`, `AL`, `BH`, `BL`, `CH`, `CL`, `DH` y `DL`. Además, para el funcionamiento de la [pila](#pila), cuenta con un registro `SP` (_stack pointer_) de 16 bits. Estos registros pueden ser accedidos por el usuario.

Dentro de los registros internos que no pueden ser accedidos por el usuario, se encuentra el registro [`FLAGS`](#flags) (_flags register_, 16 bits), el `IP` (_instruction pointer_, 16 bits) que almacena la dirección de la próxima instrucción a ejecutar, el `IR` (_instruction register_, 8 bits) que almacena el byte de la instrucción que se está analizando/decodificando en un instante dado, y el `MAR` (_memory address register_, 16 bits) que almacena la dirección de memoria que se quiere propagar por el bus de direcciones, y el `MBR` (_memory buffer register_, 8 bits) que almacena el byte que se quiere propagar o se ha recibido por el bus de datos.

Hay además algunos registros internos que sirven de intermediarios para realizar ejecutar instrucciones, como pueden ser el `ri` para almacenar una dirección temporal, el `id` para almacenar un dato temporal, o el `left`, `right` y `result` que almacenan los operandos y resultado de una operación aritmética o lógica respectivamente.

## ALU

La ALU (_Arithmetic Logic Unit_) permite realizar operaciones aritméticas y lógicas de 8 y 16 bits. Las operaciones disponibles son: [`ADD`](/docs/cpu/instructions/add/), [`ADC`](/docs/cpu/instructions/adc/), [`INC`](/docs/cpu/instructions/inc/), [`SUB`](/docs/cpu/instructions/sub/), [`SBB`](/docs/cpu/instructions/sbb/), [`DEC`](/docs/cpu/instructions/dec/), [`NEG`](/docs/cpu/instructions/neg/), [`NOT`](/docs/cpu/instructions/not/), [`AND`](/docs/cpu/instructions/and/) y [`OR`](/docs/cpu/instructions/or/). Todas estas operaciones modifican el registro `FLAGS`.

### Flags

El registro `FLAGS` es un registro de 16 bits que contiene las _flags_ mostradas en la siguiente tabla. Este registro no es directamente accesible por el usuario, pero puede ser modificado por las operaciones de la ALU y pueden realizarse saltos condicionales en base a sus valores.

| Bit # | Abreviatura | Descripción            |
| :---: | :---------: | :--------------------- |
|   0   |    `CF`     | _Flag_ de acarreo      |
|   6   |    `ZF`     | _Flag_ de cero         |
|   7   |    `SF`     | _Flag_ de signo        |
|   9   |    `IF`     | _Flag_ de interrupción |
|  11   |    `OF`     | _Flag_ de overflow     |

El resto de bits están reservados / no se utilizan.

## Pila

El procesador implementa la pila como método de almacenamiento accesible por el usuario y por la misma CPU para su correcto funcionamiento. Esta es del estilo _Last In, First Out_ (LIFO), es decir, el último elemento en entrar es el primero en salir. La pila se encuentra en la memoria principal, comenzando en la dirección más alta de la misma (`8000h`) y creciendo hacia las direcciones más bajas (`7FFEh`, `7FFCh`, etc.). El tope de la pila se guarda en el registro `SP`. Todos los elementos de la pila son de 16 bits.

## Subrutinas

El procesador también implementa subrutinas. Estas son pequeños fragmentos de código que pueden ser llamados desde cualquier parte del programa. Para ello, se utiliza la instrucción [`CALL`](/docs/cpu/instructions/call/). Esta instrucción almacena el `IP` en la [pila](#pila), y luego realiza un salto a la dirección de la subrutina, modificando el `IP` para que este apunte a la primera instrucción de la subrutina. Para volver de la subrutina, se utiliza la instrucción [`RET`](/docs/cpu/instructions/ret/), que desapila la dirección apilada previamente por `CALL` y restaura el `IP`, volviendo a el punto de ejecución posterior a la llamada a la subrutina.

Ejemplo de subrutina:

```vonsim
      org 3000h
      ; suma ax, bx y cx
sum3: add ax, bx
      add ax, cx
      ret

      org 2000h
      mov ax, 1
      mov bx, 2
      mov cx, 3
      call sum3
      ; ax = 6
      hlt
      end
```

## Interrupciones

El procesador admite interrupciones por hardware y por software, que pueden ser emitidas por el [PIC](/docs/io/modules/pic/) o por la instrucción [`INT`](/docs/cpu/instructions/int/) respectivamente. Para ejecutar interrupciones por hardware, el proesador debe estar habilitado para recibir interrupciones. Esto es, `IF=1` (la _flag_ de interrupciones activada).

Ambas interrupciones deben propocionar un número de interrupción. En el caso de las interrupciones por software, esta es dada por el operando de la instrucción `INT` ([ver más](/docs/cpu/instructions/int/)). En el caso de las interrupciones por hardware, esta es dada por el PIC ([ver cómo se obtiene](/docs/io/modules/pic/#funcionamiento)). El número de interrupción debe ser un número entre `0` y `255`.

Una vez interrumpido, el procesador ejecutará la rutina de interrupción asociada a ese número de interrupción. La dirección de comienzo de esta rutina estará almacenada en el vector de interrupciones. Este vector ocupa las celdas `0000h` hasta `03FFh` de la memoria principal, y cada elemento del vector tiene 4 bytes de largo -- el primer elemento se encuentra en `0h`, el segundo en `4h`, el tercero en `8h`, y así. Cada elemento corresponde con la dirección de inicio de la rutina de interrupción.

Específicamente, el procesador:

1. obtiene el número de la interrupción (0-255),
2. apila el registro [`FLAGS`](#flags),
3. inhabilita las interrupciones (`IF=0`),
4. apila el registro `IP`,
5. obtiene la dirección de la rutina de interrupción del vector de interrupciones,
6. modifica el `IP` para que apunte a la dirección de la rutina de interrupción.

Y así se comienza a ejecutar la rutina de interrupción. Estas tienen el mismo formato que una [subrutina](#subrutinas) salvo que terminan en [`IRET`](/docs/cpu/instructions/iret/) en vez de [`RET`](/docs/cpu/instructions/ret/).

### Llamadas al sistema

El simulador permite realizar llamadas al sistema o _syscalls_. En el simulador, estas llamadas son realizadas idénticamente a las interrupciones. Así, para realizar una _syscall_ basta con interrumpir a la CPU con el número de interrupción correspondiente. Estos números son:

- `INT 0`: termina la ejecución del programa, equivalente a la instrucción [`HLT`](/docs/cpu/instructions/hlt/);
- `INT 3`: incia el modo de depuración (_breakpoint_);
- `INT 6`: lee un carácter del [teclado](/docs/io/devices/keyboard/);
- `INT 7`: escribe una cadena de caracteres en [pantalla](/docs/io/devices/screen/).

Las direcciones del vector de interrupciones asociadas a estos números están protegidas por el sistema, impidiendo que el usuario las modifique.

El contenido de estas rutinas se encuentran almacenadas en el [monitor del sistema](/docs/memory/) en las direcciones `A000h`, `A300h`, `A600h` y `A700h` respectivamente.

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
