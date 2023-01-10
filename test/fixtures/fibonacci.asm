; ¡Bienvenido a VonSim!
; Este es un ejemplo de código que calcula los primeros
; n números de la sucesión de Fibonacci, y se guardan a
; partir de la posición 1000h de la memoria.

     n EQU 10    ; Calcula los primeros 10 números

       ORG 1000h
inicio DB 1

       ORG 2000h
       MOV BX, OFFSET inicio + 1
       MOV AL, 0
       MOV AH, inicio

BUCLE: CMP BX, OFFSET inicio + n
       JNS FIN
       MOV CL, AH
       ADD CL, AL
       MOV AL, AH
       MOV AH, CL
       MOV [BX], CL
       INC BX
       JMP BUCLE
  FIN: HLT
       END
