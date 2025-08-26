;; name    = Leer string y contar
;; author  = Facundo Quiroga
;; date    = 2025-08-25
;; devices = none

; Escribir un programa que lea carácteres hasta
; que se ingrese el carácter “.” (punto). 
; Contar la cantidad de carácteres 
; ingresados y guardarla en la variable CANT.



ORG 1000h
CANT db 0
CANTA db 0
str db ?

ORG 2000h
mov bx, offset str
mov cl, 0
loop: int 6
      cmp byte ptr [bx], '.'
      jz fin
      inc bx
      inc cl
      jmp loop
fin: mov CANT, cl

mov bx, offset str
loop2:  cmp cl,0
        jz fin2
        cmp byte ptr [bx], 'a'
        jnz seguir
        inc CANTA
seguir: inc bx
        dec cl
        jmp loop2
fin2: mov bx, offset str
      mov al, CANT
      int 7
      
hlt
      
END
