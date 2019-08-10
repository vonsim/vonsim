
org 1000h
asd db "hola"
zzz db "chau"
intlist db 1,2,3,4
intlist2 dw 1,2,3,4
complex db 10000000B,2,34h,4
uninitialized db ?
uninitialized2 dW ?

vardb db 1
vardw dw 2


    org 2000h
mov ax, bx
    MOV ax, bx
    mov  AX, bX
    mov  CX, Dx
    mov  ax, bx
    mov  ax, bx   
    mov     ax, bx
    mov  ax   , bx
    mov  ax,bx
hola: mov ax, bx
    mov [bx],ax
    mov ax, 2
    mov ax, -25
HOLA:    mov ax, 25AH
    mov ax, 25Ah
    mov ax, 10001111B
    not ax
    add ax, bx
    add ax, 3
    add ax, 26h
    adc ax, 26h
    xor ax, 26h
    cmp ax, 26h
    mov ax,sp
    mov vardb,1
    mov al,vardb
    mov ax,vardw
    mov vardw,4
;    in al,PIC ; not implemented yet!
;    in al,123 ; not implemented yet!
;    out ax,dx ; not implemented yet!
    jc hola
org 1000


JMP HOLA
JC HOLA
CALL HOLA
RET
NOP
HLT
CLI
StI
ret
pushf
popf
push ax
pop bx
pop cx
int 4
END