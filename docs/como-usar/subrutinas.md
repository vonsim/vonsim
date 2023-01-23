# Subrutinas

Las subrutinas en esencia son similares a las funciones, métodos o procedimientos de otros lenguages de programación.

En el simulador, las subrutinas no son más que una porción de código que terminan con la instrucción [`RET`](./instrucciones/transferencia-de-control#ret). Por ejemplo:

```asm
ORG 1000h
num DB 4
res DB ?

ORG 3000h
espar: MOV AX, num
       AND AX, 1
       JZ par
       MOV res, 00h
       JMP fin
par:   MOV res, 0FFh
fin:   RET
```

Para llamar a una subrutina, se utiliza la instrucción [`CALL`](./instrucciones/transferencia-de-control#call):

```asm
ORG 2000h
CALL espar
HLT
END
```

Internamente, `CALL` es similar a hacer

```asm
; Este código es didáctico, no corre en VonSim

PUSH OFFSET sig   ; Apila la instrucción siguiente al CALL
MOV IP, etiqueta  ; Asigna la dirección de la subrutina al Instruction Pointer
sig: ...          ; instrucción siguiente al CALL
```

y `RET` es similar a hacer

```asm
; Este código es didáctico, no corre en VonSim

; Desapila la instrucción apilada por CALL en el
; Instruction Pointer, es decir, el IP ahora apunta
; a la instrucción siguiente al CALL
POP IP
```
