;; name    = Ahorcado secuencial
;; author  = Juan Martín Seery
;; date    = 2026-09-03
;; devices = screen, keyboard

org 1000h
car db ?
palabra_len db ?
intentos db 50

        org 1100h
msj1    db  "Ingresá la palabra a adivinar: "
msj2    db  12, "Comenzá a adivinar! "
msj3    db  10, "Ganaste!"
msj4    db  10, "Perdiste, el string era "
palabra db  ?


        org 3000h
        ; Guardar la palabra en [bx]
        ; Retorna longitud por cl
leer_str:
        push ax
        mov cl, 0
        mov al, 1
leer_str_loop:
        int 6
        cmp byte ptr [bx], '.'
        jz leer_str_fin
        int 7
        inc cl
        inc bx
        jmp leer_str_loop
leer_str_fin:
        pop ax
        ret

        org 3100h
fase1:
        mov bx, offset msj1
        mov al, offset msj2 - offset msj1
        int 7
        mov bx, offset palabra
        call leer_str
        mov palabra_len, cl
        ret

        org 3200h
fase2:
        mov bx, offset msj2
        mov al, offset msj3 - offset msj2
        int 7
        mov cl, 0                ; índice de la palabra
        mov al, 1
intentar:
        mov bx, offset car
        int 6
        mov ah, [bx]            ; caracter leído en ah
        mov bx, offset palabra 
        add bl, cl              ; computa [palabra + cl]
        adc bh, 0
        cmp [bx], ah
        jz correcto
          dec intentos
          jnz intentar          ; si intentos = 0, perdió
          mov bx, offset msj4
          mov al, offset palabra - offset msj4
          add al, palabra_len
          int 7
        jmp fin
correcto:
        int 7
        inc cl
        cmp cl, palabra_len
        jnz intentar            ; si cl != palabra_len, faltan letras
          mov bx, offset msj3
          mov al, offset msj4 - offset msj3
          int 7
fin:
        ret

        org 2000h
        call fase1
        call fase2
        int 0
        end
