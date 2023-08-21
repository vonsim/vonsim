---
title: Lenguaje ensamblador
---

El lenguaje ensamblador (o lenguaje _assembly_) utilizado por el simulador se escribe de la siguiente manera:

```vonsim
; Este es un comentario
; Empieza con un punto y coma y termina al final de la línea

; Todas las directivas y mnemónicos se pueden escribir en mayúsculas
; o minúsculas (ORG, org, Org, ...).

org 1000h ; La directiva ORG indica la dirección de memoria donde se
          ; comienza a escribir el programa. En este caso, 1000h.

db 24     ; DB es la directiva para escribir un byte en memoria.
          ; En este caso, se escribe el byte 24 en la dirección 1000h.

db 24h    ; Los números hexadecimales se escriben con un sufijo h.
          ; En este caso, se escribe el byte 24h (36) en la dirección 1001h.

db 10b    ; Los números binarios se escriben con un sufijo b.
          ; En este caso, se escribe el byte 10b (2) en la dirección 1002h.

db '0'    ; Los caracteres se escriben entre comillas simples.
          ; En este caso, se escribe el byte 30h (48) en la dirección 1003h.

dw 5      ; DW es la directiva para escribir una palabra (2 bytes) en memoria.
          ; En este caso, se escribe la palabra 5 en la dirección 1004h.
          ; Quedando el byte 05h en la dirección 1004h y 00h en 1005h.

etq dw 7  ; 'etq' es una etiqueta. Se utiliza para referenciar una dirección
          ; de memoria.

dw ?      ; El símbolo ? indica que el valor de la palabra es desconocido. En
          ; este caso, no se escribe nada las direcciones 1008h y 1009h.

str db "Hola, Mundo!" ; También se pueden escribir cadenas de texto en ASCII,
                      ; (H=48h, o=6Fh, l=6Ch, a=61h, ...). En este caso, se
                      ; guardará la cadena a partir de la dirección 100Ah.
                      ; Quedando 48h en 100Ah, 6Fh en 100Bh, 6Ch en 100Ch, etc.
                      ; Las cadenas solo se pueden escribir con la directiva DB.

db 1, 2, 3, 4 ; Se pueden escribir varios bytes en una misma línea.

cinco equ 5 ; EQU es la directiva de equivalencia. Se utiliza para definir
            ; constantes. En este caso, se define la constante 'cinco' con
            ; el valor 5. No se reserva memoria para esta constante.


org 2000h ; Todos los programas empiezan, por convención, en la dirección 2000h.

mov al, bl ; Las instrucciones se escriben con mnemónicos. En este caso, se
           ; copia el contenido del registro BL en el registro AL.
           ; Los operandos van separados por coma.

inst: mov ax, 5 ; Las etiquetas se pueden utilizar para referenciar una
                ; instrucción. La etiqueta 'inst' se puede utilizar para
                ; referenciar la ubicación en memoria de este MOV.

jmp inst        ; Aquí se salta a la dirección 'inst'.

END

; La directiva END indica el final del archivo, no del programa.
; Indica que el ensamblador no debe seguir leyendo el archivo.
; El programa principal puede o no terminar con un END, pero
; debería terminar con un HLT o INT 0.
```

## Operandos

Las instrucciones pueden recibir varios tipos de operandos.

### Registros

Los registros accesibles por el usuario de 16 bits son `AX`, `BX`, `CX`, `DX` y `SP`. Los registros accesibles por el usuario de 8 bits son `AL`, `AH`, `BL`, `BH`, `CL`, `CH`, `DL` y `DH`. Al utilizar cualquiera de estos registros, el ensamblador puede inferir automáticamente si se tratará de una operación de 8 o 16 bits.

### Direcciones de memoria

Las direcciones de memoria se pueden expresar de varias formas:

```vonsim
[1234h] ; Dirección de memoria directa
[bx]    ; Dirección de memoria indirecta
```

:::note[Nota]
El modo de direccionamiento indirecto con desplazamiento aún no fue implementado.
:::

En el primer caso, se accede directamente a la dirección de memoria `1234h`. En el segundo caso, se accede a la dirección de memoria almacenada en `BX`. Para el modo de direccionamiento indirecto solo se puede utilizar el registro `BX`. Nótese que el ensamblador no siempre puede inferir si la operación será de 8 o 16 bits. Por ejemplo:

```vonsim
mov [bx], 6h ; ¿Se quiere escribir 06h o 0006h?
```

En este caso, se debe especificar el tamaño de la operación:

```vonsim
mov byte ptr [bx], 6h ; Se escribe 06h
mov word ptr [bx], 6h ; Se escribe 0006h
```

Un caso especial de direccionamiento de memoria es cuando se usa una etiqueta que hace referencia a una `DB` o `DW`:

```vonsim
org 1000h
dato db ?

org 2000h
mov dato, 6h
; Equivalente a
; mov byte ptr [1000h], 6h
mov dato+1, 6h
; Equivalente a
; mov byte ptr [1001h], 6h
```

En este caso, la etiqueta `dato` hace referencia a la dirección de memoria `1000h`. Por lo tanto, `dato+1` hace referencia a la dirección de memoria `1001h`. Esto funcionará siempre y cuando el operando sea de la forma `etiqueta +/- constante`. Por ejemplo, `dato+bx` no funcionará, pero `dato - 6*8 + offset otra_etiqueta` sí (pero no es recomendable; se recomienda utilizar `etiqueta +/- número` para una mejor lectura y entendimiento del código).

### Valores inmediatos

Los valores inmediatos son valores que se pueden determinar al momento de ensamblar el programa. Por ejemplo, en `mov ax, 5` se sabe que se debe copiar el número `5` en `AX`, por lo que el número `5` es un valor inmediato que se almacena en memoria. En cambio, en `mov ax, [bx]` no se sabe qué valor se debe copiar en `AX`, ya que depende del contenido de `BX`. Por lo tanto, `[bx]` no es un valor inmediato.

Estos valores inmediatos son números, que se pueden escribir de la siguiente forma:

```vonsim
24      ; Decimal
18h     ; Hexadecimal
11000b  ; Binario
'0'     ; Carácter ASCII

0FFh    ; Si el número empieza con una letra,
        ; se debe escribir un 0 antes.

13 + 8h       ; Operaciones aritméticas
13 * (7 - 2)
'A' + 5

cinco   ; Constantes definidas con la directiva EQU y etiquetas a instrucciones
offset etq ; Dirección de memoria de la etiqueta 'etq' (que define un DB o DW)

offset str + 4 ; Dirección de memoria de la cadena 'str' + 4
```

Tantos los caracteres (`'a'`) como las cadenas de texto (`"texto"`) se convierten a su valor ASCII según la [tabla ASCII utilizada por VonSim](/docs/reference/ascii/).

Nótese que hay una diferencia entre las etiquetas de una directiva `DB` o `DW` y las etiquetas de una instrucción o `EQU`. Las segundas pueden ser utilizadas como un reemplazo textual de sus valores. Es decir:

```vonsim
org 1000h
str db "Hola, Mundo!"
str_fin db ?

str_fin db offset str_fin - offset str ; == 100Ch - 1000h == Ch == 12

; ---

org 2000h
mov ax, str_fin ; == mov ax, 12
loop: jmp loop  ; == jmp 2004h
end
```

En cambio, las etiquetas de una directiva `DB` o `DW` pueden ser utilizadas como un reemplazo textual de sus valores solo cuando se les agrega el operador `offset` (como se nota en el ejemplo anterior). Cuando aparecen sin el operador `offset`, hacen referencia al "valor almacenado en la dirección de memoria de la etiqueta", como se denota en ["Direcciones de memoria"](#direcciones-de-memoria).

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
