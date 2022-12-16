# Modos de direccionamiento

Varias instrucciones constan de mover datos de un lugar para otro: ya sea copiarlos o pasarlos por la ALU para obtener algún resultado. Las distintas maneras que ofrece el simulador para _direccionar_ estos datos son los llamados **modos de direccionamiento**.

El más simple es el **direccionamiento inmediato**. En este caso, se utiliza un valor **fijo** al momento de compilación que no depende de las operaciones realizadas.

```asm
; Escribir 1000h en AX
MOV AX, 1000h

; Realizar la operación 1000h + 2 al momento de compilación
; y guardar el resultado en AX al momento de ejecución
MOV AX, 1000h + 2

; Guardar la dirección de memoria de 'dato' (definida al
; momento de compilar) y guardar el resultado en AX al momento
; de ejecución
MOV BX, OFFSET dato
```

A continuación, se describe el **direccionamiento directo**. En vez de escribir el valor literal que queremos ejecutar, se escribe la dirección de memoria (o registro) donde se encuentra el valor.

```asm
; Copia el contenido de BX en AX
MOV AX, BX

; Copia el contenido de 'dato' en AX
MOV AX, dato

; Copia el contenido de BX en la dirección de memoria 1020h
MOV [1020h], BX

; Estas dos líneas son equivalentes
MOV AX, dato
MOV AX, [OFFSET dato]
```

Finalmente, el **direccionamiento indirecto** se utiliza cuando no sabemos de antemano la dirección de memoria que queremos utilizar. La única forma de utilizarlo es con `[BX]` (y con ningún otro registro).

```asm
; Guardar el valor de CX en la dirección a la
; que apunta el valor guardado en BX
MOV [BX], CX

; Copiar el valor que se almacena en la dirección
; de memoria a la que apunta BX a AL
MOV AL, [BX]
```

En algunos casos, el compilador puede detectar cuando la dirección a la que apunta `BX` debe tratarse como un byte o como un word. En otros, hay que explicitar:

```asm
; el compilador entiende que se trata de un byte
MOV [BX], AL

; el compilador no sabe si se trata de un byte
; o de un word, así que hay que especificarlo
MOV BYTE PTR [BX], 10h ; guardará 10h
MOV WORD PTR [BX], 10h ; guardará 0010h

; el compilador entiende que se trata de un word
MOV AX, [BX]
```

Un ejemplo práctico de este concepto es un programa suma 1 a todos los valores de un arreglo.

```asm
          ; 1, 2, 3 pasa a ser 2, 3, 4
          ORG 1000h
          lista DB 1, 2, 3
          len DB 3

          ORG 2000h
          MOV BX, OFFSET lista
          MOV CL, len
    loop: INC BYTE PTR [BX]
          DEC CL
          JZ loop_end
          INC BX
          JMP loop
loop_end: HLT
          END
```


## Combinaciones _dest_,_fuente_

Combinaciones de operandos para las instrucciones `MOV`, `ADD`, `ADC`, `SUB`, `SBB`, `CMP`, `AND`, `OR` y `XOR`.

|   _dest_   |       _fuente_        |
| :--------: | :-------------------: |
| _registro_ |      _registro_       |
| _registro_ |       _memoria_       |
| _registro_ | _operación inmediata_ |
| _memoria_  |      _registro_       |
| _registro_ | _operación inmediata_ |

## Combinaciones _dest_

Tipos de operando para las instrucciones `NEG`, `INC`, `DEC` y `NOT`.

|   _dest_   |       _fuente_        |
| :--------: | :-------------------: |
| _registro_ |      _registro_       |
| _registro_ |       _memoria_       |
| _registro_ | _operación inmediata_ |
| _memoria_  |      _registro_       |
| _registro_ | _operación inmediata_ |