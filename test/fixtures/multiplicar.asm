          ORG 1000h
          a DW 25
          b DW 4
          res DW ?

          ORG 2000h
          MOV AX, 0
          MOV BX, b
          CMP BX, 0
          JZ fin
   sumar: ADD AX,a
          DEC b
          JNZ sumar
     fin: MOV res, AX
          HLT
          END