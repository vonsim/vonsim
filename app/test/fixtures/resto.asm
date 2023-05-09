           ORG 1000H
           N DW 255
           M DW 2
           R DW ?

           ORG 3000H
           ; AX almacena el valor del dividendo
           ; BX almacena el valor del divisor
           ; AX almacena el resto
    RESTO: CMP AX,BX
           JS RETORNO

           SUB AX,BX
           JMP RESTO

  RETORNO: RET

           ORG 2000H
           MOV AX, N
           MOV BX, M
           CALL RESTO
           HLT
           END
