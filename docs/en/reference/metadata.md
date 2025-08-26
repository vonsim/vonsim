# Metadata

Metadata are special comments in the assembly source code that provide additional information about the program. They can be used to specify properties such as the program's name, author, description, and other custom attributes.

For example, the following assembly code includes metadata comments:

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

Anything can be written after the `;;` at the beginning of the line, but only a few keys are used by the web application.

## Metadata Keys

| Key       | Description                                                                       | Example                        |
| --------- | --------------------------------------------------------------------------------- | ------------------------------ |
| `name`    | The name of the program.                                                          | `Fibonacci sequence`           |
| `author`  | The author of the program.                                                        | `John Doe`                     |
| `date`    | The date of creation (ISO 8601).                                                  | `2024-08-25`                   |
| `url`     | A URL related to the program.                                                     | `https://youtu.be/dQw4w9WgXcQ` |
| `devices` | Comma-separated list of devices required by the program. See [devices](#devices). | `keyboard, screen`             |

### `devices`

The `devices` key specifies the hardware devices that the program requires to run. It's written as a comma-separated list of device names. The supported devices are:

- `keyboard`
- `screen`
- `pic`
- `switches-pio`
- `leds-pio`
- `printer-pio`
- `printer-handshake`

If two devices aren't compatible (like `printer-pio, printer-handshake`), the last one will take precedence. If the user had other devices enabled, they will remain enabled.

Also, to force _no_ devices at all, write `devices = none`.