          ORG 1000h
          len EQU 5
          a DW 25, 4, 77, 32, 6
          b DW 4, 89, 32, 55, 1
          res DW ?, ?, ?, ?, ?

          ORG 2000h
          MOV CX, len ; CX = índice
          ADD CX, len
          SUB CX, 2
          JS fin
          JZ fin
    suma: MOV BX, OFFSET a
          ADD BX, CX
          MOV AX, [BX]
          MOV BX, OFFSET b
          ADD BX, CX
          ADD AX, [BX]
          MOV BX, OFFSET res
          ADD BX, CX
          MOV [BX], AX
          SUB CX, 2
          JNS suma
     fin: HLT
          END