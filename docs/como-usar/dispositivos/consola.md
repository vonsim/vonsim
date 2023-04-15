# Consola

El simulador cuenta con una consola para escribir y leer caracteres. Esta es un dispositivo externo y el CPU puede comunicarse con esta mediante interrupciones por software.

Con la interrupción 6 (`INT 6`) se detiene la ejecución del código hasta que se escriba un carácter en la consola. El carácter que se escriba será guardado en la dirección de memoria almacenada en `BX` según su representación en ASCII.

```vonsim
ORG 1000h
car DB ?

ORG 2000h
MOV BX, OFFSET car
INT 6
; Escribe un carácter
INT 0
END

; El caractar escrito se almacenó en 'car'
```

Con la interrupción 7 (`INT 7`) se escribe una cadena de caracteres en la consola. Recibe dos parámetros:

- `AL`: longitud de la cadena a imprimir
- `BX`: dirección de memoria donde empieza la cadena

```vonsim
ORG 1000h
cadena db "Hola!"

ORG 2000h
MOV BX, OFFSET cadena
MOV AL, 5
INT 7
; Se imprime en consola
INT 0
END
```

Hay tres caracteres especiales:

- el carácter de retroceso (`BS`, 8 en decimal) borra el carácter previo;
- el carácter de salto de línea (`LF`, 10 en decimal) imprime, en efecto, un salto de línea — útil para no imprimir todo en una sola línea;
- el carácter de _form feed_ (`FF`, 12 en decimal) limpia la consola.
