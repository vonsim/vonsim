; Welcome to VonSim!
; This is an example program that calculates the first
; n numbers of the Fibonacci sequence, and stores them
; starting at memory position 1000h.

     n  equ 10    ; Calculate the first 10 numbers

        org 1000h
start   db 1

        org 2000h
        mov bx, offset start + 1
        mov al, 0
        mov ah, start

loop:   cmp bx, offset start + n
        jns finish
        mov cl, ah
        add cl, al
        mov al, ah
        mov ah, cl
        mov [bx], cl
        inc bx
        jmp loop
finish: hlt
        end

;; name = Fibonacci