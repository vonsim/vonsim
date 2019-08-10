org 5
n dw 7 
sum dw ?

org 2000h
mov ax,n
mov dx,0
loop: add dx,ax
     dec ax
     jnz loop

mov sum,dx

hlt
end