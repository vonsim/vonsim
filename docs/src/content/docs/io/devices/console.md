---
title: Consola
---

El simulador cuenta con una consola para escribir y leer caracteres. Esta es un dispositivo y el CPU puede comunicarse con la misma únicamente mediante interrupciones. Esto es así por simplicidad, ya que una consola real es mucho más compleja. Por eso, en la interfaz gráfica del simulador, esta no se encuentra conectada a ningún módulo.

Dentro de las interrupciones reservadas, se encuentran las interrupciones `INT 6` e `INT 7` para escribir y leer caracteres, respectivamente.

Con `INT 6` se detiene la ejecución del código hasta que se escriba un carácter en la consola. El carácter que se escriba será guardado en la dirección de memoria almacenada en `BX` según su representación en ASCII.

```vonsim
org 1000h
car db ?

org 2000h
mov bx, offset car
int 6
; El usuario escribe un carácter
int 0
end

; El carácter escrito se almacenó en 'car'.
; Por ejemplo, si el usuario presionó la tecla 'a', entonces
; se almacena el valor 61h en 'car'.
```

Con `INT 7` se escribe una cadena de caracteres en la consola. Recibe dos parámetros:

- `AL`: longitud de la cadena a imprimir
- `BX`: dirección de memoria donde empieza la cadena

```vonsim
org 1000h
cadena db "Hola!"

org 2000h
mov bx, offset cadena
mov al, 5
int 7
; Se imprime "Hola!" (sin las comillas) en la consola.
int 0
end
```

Hay tres caracteres especiales:

- el carácter de retroceso (`BS`, 8 en decimal) borra el carácter previo;
- el carácter de salto de línea (`LF`, 10 en decimal) imprime, en efecto, un salto de línea — útil para no imprimir todo en una sola línea;
- el carácter de _form feed_ (`FF`, 12 en decimal) limpia la consola.

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
