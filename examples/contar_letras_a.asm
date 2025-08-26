;; name    = Contar letras
;; author  = Facundo Quiroga
;; date    = 2025-08-25
;; devices = none

; Escribir un programa que declare un string 
; llamado MENSAJE, almacenado en la memoria 
; de datos, cuente la cantidad de veces que
; la letra ‘a’ (minúscula) aparece en MENSAJE 
; y lo almacene en la variable CANT. 
; Por ejemplo, si MENSAJE contiene 
; “Hola, Buenas Tardes”, entonces CANT debe valer 3.



ORG 1000h
MENSAJE db "Hola, Buenas Tardes"
CANT db 0

ORG 2000h
mov bx, offset MENSAJE
mov cl, offset CANT - offset MENSAJE
mov dl, 0
loop: cmp cl, 0
      jz fin
      dec cl
      mov al, [bx]
      cmp al, 'a'
      jnz seguir
      inc dl
seguir: inc bx
      jmp loop
fin:  mov CANT, dl
      hlt
END
