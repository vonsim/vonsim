# Handshake

El Handshake es un dispotivo diseñado con el fin de facilitar la comunicación con las impresoras Centronics. Este cuenta con dos registros de 8 bits:

- el registro de datos (dirección `40h` de la memoria E/S),
- y el registro de estado (dirección `41h` de la memoria E/S).

Específicamente,

```
Datos  = DDDD DDDD
Estado = I___ __SB
```

En el registro de estado, los dos bits menos significativos son el _strobe_ y _busy_. [Leer más sobre los mismos](./impresora).

En el registro de datos se almacenará carácter a imprimir, expresado en ASCII. Cada vez que se escriba en ese registro con la instrucción [`IN`](../instrucciones/transferencia-de-datos#in), el handshake realizará un flanco ascendente en el _strobe_ **automáticamente**. Así, se evita tener que modificar el _strobe_ manualmente para imprimir.

Además, el bit más significativo del registro de estado habilita/inhabilita las interrupciones. Si este bit es `1`, mientras la impresora no esté ocupada (`B=0`), el Handshake disparará una interrupción por hardware. Está conectado al puerto `INT0` del [PIC](./pic).
