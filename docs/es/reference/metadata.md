# Metadatos

Los metadatos son comentarios especiales en el código fuente ensamblador que proporcionan información adicional sobre el programa. Se pueden usar para especificar propiedades como el nombre del programa, autor, descripción y otros atributos personalizados.

Por ejemplo, el siguiente código ensamblador incluye comentarios de metadatos:

```vonsim
;; name    = Escribir mayúsculas
;; author  = Facundo Quiroga
;; date    = 2025-08-25
;; devices = screen

; Escribir un programa que muestre en 
; pantalla las letras mayúsculas (“A” a la “Z”). 

LETRA_INICIO equ 'A'
LETRA_FIN equ 'Z'

ORG 1000h
letra db "A"
ORG 2000h
mov letra, LETRA_INICIO
mov bx, offset letra
mov al, 1

loop: int 7
  inc letra
  cmp letra, LETRA_FIN+1
  jnz loop
END
```

Después de `;;` al comienzo de la línea se puede escribir cualquier cosa, pero solo algunas claves son utilizadas por la aplicación web.

## Claves de Metadatos

| Clave     | Descripción                                                                            | Ejemplo                        |
| --------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| `name`    | El nombre del programa.                                                                | `Secuencia Fibonacci`          |
| `author`  | El autor del programa.                                                                 | `Juan Pérez`                   |
| `date`    | La fecha de creación (ISO 8601).                                                       | `2024-08-25`                   |
| `url`     | Una URL relacionada al programa.                                                       | `https://youtu.be/dQw4w9WgXcQ` |
| `devices` | Lista separada por comas de los dispositivos requeridos. Ver [dispositivos](#devices). | `keyboard, screen`             |

### `devices`

La clave `devices` especifica los dispositivos de hardware que el programa requiere para ejecutarse. Se escribe como una lista separada por comas de nombres de dispositivos. Los dispositivos soportados son:

- `keyboard`
- `screen`
- `pic`
- `switches-pio`
- `leds-pio`
- `printer-pio`
- `printer-handshake`

Si dos dispositivos no son compativles (como `printer-pio, printer-handshake`), el último tendrá prioridad. Si el usuario tenía otros dispositivos habilitados, estos permanecerán habilitados.

Además, para forzar que _no_ haya dispositivos, se puede escribir `devices = none`.