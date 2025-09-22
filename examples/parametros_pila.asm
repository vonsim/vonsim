;; name    = Parámetros por referencia por pila
;; author  = Érica Padovani
;; date    = 2025-09-22
;; devices = none

; Escriba una subrutina que reciba 3 numeros
; (de 8 bits) A, B y C por referencia a través
; de la pila, realice A + B - C y devuelva su
; resultado por registro y por valor 

org 1000h
A db 8
B db 5
C db 4
D db ?

org 3500h
subrutina:
  push bx
  mov  bx, sp
  mov  bx, [bx + 8]
  mov  dl, [bx]
  mov  bx, sp
  mov  bx, [bx + 6]
  add  dl, [bx]
  mov  bx, sp
  mov  bx, [bx + 4]
  sub  dl, [bx]
  pop  bx
  ret

org 2000h
mov  ax, offset A
push ax
mov  ax, offset B
push ax
mov  ax, offset C
push ax
call subrutina
mov  D, dl
pop  ax
pop  ax
pop  ax
int  0
end