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
 
