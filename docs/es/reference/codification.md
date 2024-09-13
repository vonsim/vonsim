# Codificación

Aquí se denota la codificación en binario de cada una de las instrucciones del simulador. Pese a que el set de instrucciones esté basado en el de Intel 8088, la codificación se simplificado con fines prácticos y didácticos.

A lo largo de la codificación se usan las siguientes abreviaturas:

- `w`: indica el tamaño de los operandos.

  | `w` | Tamaño  |
  | :-: | :------ |
  | `0` | 8 bits  |
  | `1` | 16 bits |

- `rrr` o `RRR`: referencian registros, y dependen de `w`.

  | `rrr` | `w=0` | `w=1` |
  | :---: | :---: | :---: |
  | `000` | `AL`  | `AX`  |
  | `001` | `CL`  | `CX`  |
  | `010` | `DL`  | `DX`  |
  | `011` | `BL`  | `BX`  |
  | `100` | `AH`  | `SP`  |
  | `101` | `CH`  |   —   |
  | `110` | `DH`  |   —   |
  | `111` | `BH`  |   —   |

- **dato** se refiere al byte/word de un dato inmediato. Para instrucciones con `w=0`, **dato-high** es obviado.
- **desp** se refiere al word de un desplazamiento (siempre en Ca2).
- **dir** se refiere al word de una dirección.
- **xxx-low** se refiere a la parte menos significativa (LSB) de un word o a un byte.
- **xxx-high** se refiere a la marte más significativa (MSB) de un word.

---

| Instrucción |    Opcode    |
| :---------: | :----------: |
|    `MOV`    | `100 0000 w` |
|    `AND`    | `100 0001 w` |
|    `OR`     | `100 0010 w` |
|    `XOR`    | `100 0011 w` |
|    `ADD`    | `100 0100 w` |
|    `ADC`    | `100 0101 w` |
|    `SUB`    | `100 0110 w` |
|    `SBB`    | `100 0111 w` |
|   `TEST`    | `101 0001 w` |
|    `CMP`    | `101 0110 w` |

Estas instrucciones reciben dos operandos y soportan varios modos de direccionamiento. Esta información está codificada en el bit `d` y el segundo byte de la instrucción según la siguiente tabla:

| Destino                                | Fuente                                 | Segundo byte | Bytes siguientes                         |
| :------------------------------------- | :------------------------------------- | :----------: | :--------------------------------------- |
| Registro                               | Registro                               |  `00RRRrrr`  | —                                        |
| Registro                               | Memoria (directo)                      |  `01000rrr`  | dir-low, dir-high                        |
| Registro                               | Memoria (indirecto)                    |  `01010rrr`  | —                                        |
| Registro                               | Memoria (indirecto con desplazamiento) |  `01100rrr`  | desp-low, desp-high                      |
| Registro                               | Inmediato                              |  `01001rrr`  | dato-low, dato-high                      |
| Memoria (directo)                      | Registro                               |  `11000rrr`  | dir-low, dir-high                        |
| Memoria (indirecto)                    | Registro                               |  `11010rrr`  | —                                        |
| Memoria (indirecto con desplazamiento) | Registro                               |  `11100rrr`  | desp-low, desp-high                      |
| Memoria (directo)                      | Inmediato                              |  `11001000`  | dir-low, dir-high, dato-low, dato-high   |
| Memoria (indirecto)                    | Inmediato                              |  `11011000`  | dato-low, dato-high                      |
| Memoria (indirecto con desplazamiento) | Inmediato                              |  `11101000`  | desp-low, desp-high, dato-low, dato-high |

Para las instrucciones con un registro como operando, `rrr` codifica este registro. En el caso registro a registro, `RRR` codifica el registro fuente y `rrr` el registro destino.

---

| Instrucción |    Opcode    |
| :---------: | :----------: |
|    `NOT`    | `0100 000 w` |
|    `NEG`    | `0100 001 w` |
|    `INC`    | `0100 010 w` |
|    `DEC`    | `0100 011 w` |

Estas instrucciones reciben un operando y soportan varios modos de direccionamiento. Esta información está codificada el segundo byte de la instrucción según la siguiente tabla:

| Destino                                | Segundo byte | Bytes siguientes    |
| :------------------------------------- | :----------: | :------------------ |
| Registro                               |  `00000rrr`  | —                   |
| Memoria (directo)                      |  `11000000`  | dir-low, dir-high   |
| Memoria (indirecto)                    |  `11010000`  | —                   |
| Memoria (indirecto con desplazamiento) |  `11100000`  | desp-low, desp-high |

---

| Instrucción |    Opcode    |
| :---------: | :----------: |
|    `IN`     | `0101 00 pw` |
|    `OUT`    | `0101 01 pw` |

El bit `p` codifica

- si el puerto es fijo (`p=0`), el cual se tendrá que proveer en el siguiente byte (puerto máximo: 255),
- o si el puerto es variable (`p=1`), caso en el cual se usará el valor almacenado en el registro `DX` como puerto.

---

| Instrucción |   Opcode    |
| :---------: | :---------: |
|   `PUSH`    | `0110 0rrr` |
|    `POP`    | `0110 1rrr` |
|   `PUSHF`   | `0111 0000` |
|   `POPF`    | `0111 1000` |

`rrr` siempre representa un registro de 16 bits.

---

| Instrucción |   Opcode    |
| :---------: | :---------: |
|    `JC`     | `0010 0000` |
|    `JNC`    | `0010 0001` |
|    `JZ`     | `0010 0010` |
|    `JNZ`    | `0010 0011` |
|    `JS`     | `0010 0100` |
|    `JNS`    | `0010 0101` |
|    `JO`     | `0010 0110` |
|    `JNO`    | `0010 0111` |
|    `JMP`    | `0011 0000` |
|   `CALL`    | `0011 0001` |
|    `RET`    | `0011 0011` |

Luego del opcode, estas instrucciones (salvo `RET`) reciben una dirección absoluta de memoria (que ocupa dos bytes).

---

| Instrucción |   Opcode    |
| :---------: | :---------: |
|    `CLI`    | `0001 1000` |
|    `STI`    | `0001 1001` |
|    `INT`    | `0001 1010` |
|   `IRET`    | `0001 1011` |

Luego del opcode, `INT` recibe el número de instrucción (ocupa un byte).

---

| Instrucción |   Opcode    |
| :---------: | :---------: |
|    `NOP`    | `0001 0000` |
|    `HLT`    | `0001 0001` |
