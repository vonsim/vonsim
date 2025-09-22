;; name    = F10 y Timer
;; author  = Juan Martín Seery
;; date    = 2025-09-22
;; devices = screen, keyboard, pic

; Escribir un programa que implemente un conteo
; regresivo a partir de un valor (de 1 a 9)
; ingresado desde el teclado.
; El conteo debe comenzar al presionarse la
; tecla F10. El tiempo transcurrido debe mostrarse
; en pantalla, actualizándose el valor cada segundo.
; 
; Por ejemplo, si se ingresa el valor 7, cuando se
; apreta F10 debe mostrarse en pantalla
; “7 6 5 4 3 2 1 0” en los 7 segundos siguientes.

CONT equ 10h
COMP equ 11h
EOI  equ 20h
IMR  equ 21h
INT0 equ 24h
INT1 equ 25h

N_F10   equ 10
N_TIMER equ 11

; #==========# Vector de interrupciones #==========#
org 40
dw handler_F10
org 44
dw handler_timer

; #==================# Memoria #===================#
org 1000h
msj db ?, ' '
fin db 0

; #=======# Manejadores de interrupciones #========#
org 4000h
handler_F10:
  push ax
  ; Habilito el TIMER e inhabilito F10
  mov al, 0FDh
  out IMR, al
  ; Reinicio el timer
  call reset_timer
  ; Fin del manejador
  mov al, EOI
  out EOI, al
  pop ax
  iret

org 4100h
handler_timer:
  push ax
  push bx
  ; Imprimo el mensaje en pantalla
  mov al, offset fin - offset msj
  mov bx, offset msj
  int 7
  ; Si es 0, termino
  cmp msj, '0'
  jz handler_timer_terminar
  ; Si no es 0, decremento y reseteo el timer
  dec msj
  call reset_timer
  jmp handler_timer_seguir
handler_timer_terminar:
  ; Inhabilito el timer
  mov al, 0FFh
  out IMR, al
  ; Levanto flag de fin
  mov fin, 1
handler_timer_seguir:
  ; Fin del manejador
  pop bx
  mov al, EOI
  out EOI, al
  pop ax
  iret

; #=================# Subrutinas #=================#
org 3000h
init_devices:
  cli
  ; Inicialización del PIC
  mov al, N_F10
  out INT0, al
  mov al, N_TIMER
  out INT1, al
  mov al, 0FFh ; Enmascaro todas las interrupciones
  out IMR, al
  ; Inicialización del TIMER - contar cada segundo
  mov al, 1
  out COMP, al
  sti
  ret

org 3100h
reset_timer:
  ; Reinicio el contador del timer
  mov al, 0
  out CONT, al
  ret

org 3200h
read_number:
  ; Lee un número del teclado y lo
  ; almacena en [BX], validándolo
  int 6
  cmp byte ptr [bx], '1'
  js read_number
  cmp byte ptr [bx], '9'+1
  jns read_number
  ret

; #=============# Programa principal #=============#
org 2000h
call init_devices
; Leer número
mov bx, offset msj
call read_number
; Habilitar F10
mov al, 0FEh
out IMR, al
; Esperar hasta el fin
wait:
  cmp fin, 0
  jz wait
int 0
end
