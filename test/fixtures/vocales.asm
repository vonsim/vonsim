               ORG 1000h
               vocales DB "AEIOUaeiou"
               fin_vocales DB ?
               texto DB "Piruleta."
               fin_texto DB ?

               ORG 3000h
               ; Caracter en AL
               ; Si es vocal, AH=FFh; de lo contrario, AH=00h
ES_VOCAL:      MOV BX, OFFSET vocales - 1
               MOV AH, 00h
ES_VOCAL_LOOP: INC BX
               CMP BX, OFFSET fin_vocales
               JZ ES_VOCAL_FIN
               CMP AL, [BX]
               JNZ ES_VOCAL_LOOP
               MOV AH, 0FFh
ES_VOCAL_FIN:  RET

                   ; BX es la referencia a la cadena
                   ; CX es la longitud de la cadena
                   ; DX almacena la cantidad de vocales
CANT_VOCALES:      MOV DX, 0
CANT_VOCALES_LOOP: DEC CX
                   JS CANT_VOCALES_FIN
                   MOV AL,[BX]
                   PUSH BX
                   CALL ES_VOCAL
                   POP BX
                   INC BX
                   CMP AH,0
                   JZ CANT_VOCALES_LOOP
                   INC DX
                   JMP CANT_VOCALES_LOOP
CANT_VOCALES_FIN:  RET

               ORG 2000h
               MOV BX, OFFSET texto
               MOV CX, OFFSET fin_texto - OFFSET texto
               CALL CANT_VOCALES
               HLT
               END
