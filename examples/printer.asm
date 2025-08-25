;; name = Impresora con F10
;; pic = yes
;; pio = printer

PA EQU 30h
PB EQU 31h
CA EQU 32h
CB EQU 33h

IMR EQU 21h
EOI EQU 20h
INT0 EQU 24h
N_F10 EQU 10

ORG 40
DW RUT_F10

ORG 1000h
FIN_LEER DB 0
LARGO DB 0
CADENA DB ?

ORG 3200h
RUT_F10: PUSH AX  
         MOV AL, 0FFh
         OUT IMR, AL
         MOV FIN_LEER, 1
         MOV AL, EOI
         OUT EOI, AL
         POP AX
         IRET
         
ORG 3000h
LEE_CADENA: CLI
            MOV AL, 0FEh
            OUT IMR, AL
            MOV AL, N_F10
            OUT INT0, AL
            STI
            MOV BX, OFFSET CADENA
            MOV LARGO, 0
     SIGUE: INT 6
            INC BX
            INC LARGO
            CMP FIN_LEER, 0
            JZ SIGUE
            RET


ORG 2000h
		CALL LEE_CADENA
		MOV AL, 0FDh ; strobe salida (0), busy entrada (1)
		OUT CA, AL
		MOV AL, 0   ; puerto de datos todo salida
		OUT CB, AL

		; inicializo strobe en 0
		IN AL, PA
    		AND AL, 11111101b
   		OUT PA, AL

		MOV CL, LARGO
    		MOV BX, OFFSET CADENA
        	; espero que busy=0
  POLL: 	IN  AL, PA
        	AND AL, 01h ; 1000 0000
        	JNZ POLL
        	; se que busy es 0, mandar caracer
        	MOV AL, [BX]
        	OUT PB, AL
        	; mandar flanco ascendente de strobe
        	IN AL, PA
        	OR AL, 00000010b
        	OUT PA, AL
        	; strobe en 0
        	IN  AL, PA
        	AND AL, 11111101b
        	OUT PA, AL

        	INC BX
        	DEC CL
        	JNZ POLL
    		INT 0

END
