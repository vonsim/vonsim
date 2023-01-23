# Impresora

El simulador cuenta con una impresora [Centronics](https://es.wikipedia.org/wiki/Puerto_paralelo#Puerto_paralelo_Centronics). Esta cuenta con papel y un _buffer_.

Al igual que las impresoras de la vida real, no imprime los caracteres inmediatamente sino que tarda un tiempo (configurable). Por eso, cuenta con una cola de impresión. Cada vez que la impresora reciba un carácter, lo amacenará en su _buffer_, y esta irá liberando el mismo secuencialmente.

Si se llena el _buffer_, el carácter que se envió se pierde. Para evitar eso, la impresora provee el flag _busy_: cuando es `1`, el _buffer_ está lleno.

## Imprimir con PIO

Una opción es conectar la impresora al [PIO](./pio). La conexión queda así:

```
PA = ____ __SB
PB = DDDD DDDD
```

En `PB` se almacenará carácter a imprimir, expresado en ASCII. En `PA`, los seis bits más significativos no hacen nada. El bit menos significativo es la flag _busy_. Y el que queda es el _strobe_.

El _strobe_ es el bit que le indica a la impresora que queremos imprimir. Las impresoras Centronics toman el valor en `PB` cuando detectan un [flanco ascendente](<https://es.wikipedia.org/wiki/Flanco_(electr%C3%B3nica)>) en el _strobe_. Es decir, una transición de `S=0` a `S=1`.

En resumen, para imprimir un carácter, hay que

1. verificar que el _buffer_ no esté lleno (flag _busy_),
2. escribir el carácter en `PB`,
3. poner el _strobe_ en 0,
4. poner el _strobe_ en 1.

## Imprimir con Handshake

A diferencia del PIO, el [Handshake](./handshake) es un dispotivo diseñado específicamente para las impresoras Centronics.

Con el Handshake no hay que preocuparse por el _strobe_, ya que este automatiza el flanco ascendente por nosotros. Así, para imprimir basta con

1. verificar que el _buffer_ no esté lleno (flag _busy_),
2. escribir el carácter en el registro de datos.

Más información sobre el Handshake y sus funcionalidades [aquí](./handshake).

## Caracteres especiales

Además de los caracteres ASCII comunes, hay otros dos que pueden resultar útiles:

- el carácter de salto de línea (`LF`, 10 en decimal) imprime, en efecto, un salto de línea — útil para no imprimir todo en una sola línea;
- el carácter de _form feed_ (`FF`, 12 en decimal) limpia la impresora (dicho de otra forma, arranca la hoja).
