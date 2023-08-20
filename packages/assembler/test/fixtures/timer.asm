; Escribir un programa que implemente un conteo regresivo a partir de un valor
; ingresado desde el teclado. El conteo debe comenzar al presionarse la tecla
; F10. El tiempo transcurrido debe mostrarse en pantalla, actualizándose el
; valor cada segundo.


EOI   equ 20h
IMR   equ 21h
IRR   equ 22h
INT0  equ 24h
INT1  equ 25h

CONT  equ 10h
COMP  equ 11h

n_f10 equ 10
      org 40 ; 10 * 4
      dw handle_f10

n_clk equ 11
      org 44 ; 11 * 4
      dw handle_clk


          org 1000h
input_msj db 12, "Ingrese un tiempo (máx 99 seg): "
err_msj   db 10, "Número inválido"

disp      db 8, 8 ; 2 backspaces
seg_h     db '0'
seg_l     db '0'
count     db 00h ; booleano. 00h = false

input_len equ offset err_msj - offset input_msj
err_len   equ offset disp - offset err_msj
disp_len  equ offset count - offset disp


                org 3000h
                ; Recibe el caracter por referencia en BX
                ; Retorna FFh si el caracter es un número
                ;         y 00h si no lo es en AL.
es_num:         mov al, [bx]
                cmp al, '0'
                js es_num_F
                cmp al, '9'+1
                jns es_num_F
                mov al, 0FFh
                jmp es_num_ret
es_num_F:       mov al, 00h
es_num_ret:     ret

                ; Manejador de interrupción de F10
                ; Activa la cuenta regresiva
handle_f10:     push ax
                mov count, 0FFh
                in al, IMR
                xor al, 00000001b
                out IMR, al
                mov al, EOI
                out EOI, al
                pop ax
                iret

                ; Manejador de interrupción del reloj
                ; Se ejecuta cada segundo y actualiza el disp
handle_clk:     push ax
                push bx
                cmp count, 0
                jz handle_clk_end ; Si count = 00h, no contar
                dec seg_l
                cmp seg_l, '0'
                jns handle_clk_end
                mov seg_l, '9'
                dec seg_h
handle_clk_end: mov bx, offset disp
                mov al, disp_len
                int 7
                in al, COMP ; reset timer
                inc al
                out COMP, al
                mov al, EOI
                out EOI, al
                pop bx
                pop ax
                iret


        org 2000h
        mov bx, offset input_msj
        mov al, input_len
        int 7
        mov bx, offset seg_h
        int 6
        call es_num
        cmp al, 00h
        jz error
        mov bx, offset seg_l
        int 6
        call es_num
        cmp al, 00h
        jz error

        cli
        mov al, 1
        out COMP, al
        mov al, 0
        out CONT, al
        mov al, 11111100b
        out IMR, al
        mov al, n_f10
        out INT0, al
        mov al, n_clk
        out INT1, al
        sti

loop:   cmp seg_h, '0'
        jnz loop
        cmp seg_l, '0'
        jnz loop
        jmp fin

error:  mov bx, offset err_msj
        mov al, err_len
        int 7
fin:    int 0
        end
