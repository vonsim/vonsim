# Codificación

Aquí se denota la codificación a binario de todas las instrucciones. **No es la misma que usa el Intel 8088**, más información [aquí](/diferencias-con-la-realidad).

## Instrucciones

Todas las instrucciones tienen un opcode de 8 bits y pueden estar seguidas de [operandos](#operandos). Para mejor organización, se separaron las instrucciones según cómo se codifican.

- [Instrucciones binarias](#instrucciones-binarias): `MOV`, `AND`, `OR`, `XOR`, `ADD`, `ADC`, `SUB`, `SBB`, `CMP`
- [Instrucciones unarias](#instrucciones-unarias): `NOT`, `INC`, `DEC`, `NEG`
- [Pila](#pila): `PUSH`, `POP`, `PUSHF`, `POPF`
- [I/O](#i-o): `IN`, `OUT`
- [Saltos](#saltos): `JMP`, `CALL`, `RET`, `JZ`, `JNZ`, `JS`, `JNS`, `JC`, `JNC`, `JO`, `JNO`
- [Otras](#otras): `INT`, `IRET`, `CLI`, `STI`, `NOP`, `HLT`

### Instrucciones binarias

Son instrucciones que requieren dos operandos ([más info aquí](/como-usar/modos-de-direccionamiento#combinaciones-dest-fuente)).

| Instrucción |   Opcode    |
| :---------: | :---------: |
|    `MOV`    | `0000 DDDW` |
|    `AND`    | `0001 DDDW` |
|    `OR`     | `0010 DDDW` |
|    `XOR`    | `0011 DDDW` |
|    `ADD`    | `0100 DDDW` |
|    `ADC`    | `0101 DDDW` |
|    `SUB`    | `0110 DDDW` |
|    `SBB`    | `0111 DDDW` |
|    `CMP`    | `1000 DDDW` |

_DDD_ indica el modo de direccionamiento. A continuación se detalla qué significa cada valor de _DDD_ y los operandos que requiere.

| Descripción                     | _DDD_ | [Operandos](#operandos)      |
| :------------------------------ | :---: | :--------------------------- |
| Registro a registro             | `000` | _reg_ dest + _reg_ fuente    |
| Memoria (directo) a registro    | `001` | _reg_ dest + _mem_ fuente    |
| Memoria (indirecto) a registro  | `010` | _reg_ dest                   |
| Inmediato a registro            | `011` | _reg_ dest + _op.inm_ fuente |
| Registro a memoria (directo)    | `100` | _mem_ dest + _reg_ fuente    |
| Registro a memoria (indirecto)  | `101` | _reg_ fuente                 |
| Inmediato a memoria (directo)   | `110` | _mem_ dest + _op.inm_ fuente |
| Inmediato a memoria (indirecto) | `111` | _op.inm_ fuente              |

_W_ indica si la operación es de tipo byte (`W=0`) o de tipo word (`W=1`).

### Instrucciones unarias

Son instrucciones que requieren un operando ([más info aquí](/como-usar/modos-de-direccionamiento#combinaciones-dest)).

| Instrucción |    Opcode    |
| :---------: | :----------: |
|    `NOT`    | `101 00 DDW` |
|    `INC`    | `101 01 DDW` |
|    `DEC`    | `101 10 DDW` |
|    `NEG`    | `101 11 DDW` |

_DD_ indica el modo de direccionamiento. A continuación se detalla qué significa cada valor de _DD_ y los operandos que requiere.

| Descripción         | _DD_  | [Operandos](#operandos) |
| :------------------ | :---: | :---------------------- |
| Registro            | `00`  | _reg_ dest              |
| Memoria (directo)   | `01`  | _mem_ dest              |
| Memoria (indirecto) | `10`  |                         |

_W_ indica si la operación es de tipo byte (`W=0`) o de tipo word (`W=1`).

### Pila

| Instrucción |   Opcode    |
| :---------: | :---------: |
|   `PUSH`    | `1100 0000` |
|    `POP`    | `1100 0001` |
|   `PUSHF`   | `1100 0010` |
|   `POPF`    | `1100 0011` |

Los primeros dos requieren un registro _reg_ de 16 bit. Los otros dos no reciben operandos.

### I/O

| Instrucción |   Opcode    |
| :---------: | :---------: |
|    `IN`     | `1101 0PPW` |
|    `OUT`    | `1101 1PPW` |

_PP_ indica si fuente o destino (según si es `IN` o `OUT` respectivamente). A continuación se detalla qué significa cada valor de _PP_ y los operandos que requiere.

| Descripción               | _PP_  | [Operandos](#operandos)  |
| :------------------------ | :---: | :----------------------- |
| Puerto fijo               | `00`  | _op.inm_ puerto (1 byte) |
| Puerto alojado en memoria | `01`  | _mem_ puerto             |
| `DX`                      | `10`  |                          |

_W_ indica si la operación es de tipo byte (`W=0`) o de tipo word (`W=1`).

### Saltos

Aquí se definen todas las operaciones relacionadas con saltar (también llamadas "transferencias de control").

| Instrucción |   Opcode    |
| :---------: | :---------: |
|    `JMP`    | `1110 0000` |
|   `CALL`    | `1110 0001` |
|    `RET`    | `1110 0010` |
|    `JZ`     | `1110 1110` |
|    `JNZ`    | `1110 1111` |
|    `JS`     | `1110 1100` |
|    `JNS`    | `1110 1101` |
|    `JC`     | `1110 1000` |
|    `JNC`    | `1110 1001` |
|    `JO`     | `1110 1010` |
|    `JNO`    | `1110 1011` |

Todas estas instrucciones (salvo `RET`) reciben un operando: la dirección de memoria [_mem_](#operandos) a donde se debe saltar.

A modo de ayuda memoria:
- todos los saltos comienzan con `1110`;
- los saltos condicionales siguen el formato `1110 1FFN`, donde `FF` es la [flag](#flags) y `N` es si es la operación es negada.

### Otras

| Instrucción |   Opcode    |
| :---------: | :---------: |
|    `INT`    | `1111 1010` |
|   `IRET`    | `1111 1011` |
|    `CLI`    | `1111 1100` |
|    `STI`    | `1111 1101` |
|    `NOP`    | `1111 1110` |
|    `HLT`    | `1111 1111` |

`INT` necesita, además, el número de interrupción (1 byte, entero sin signo). El resto de instrucciones no reciben operandos.

## Operandos

Los operandos se escriben inmediatamente después de la instrucción según corresponda.

Las direcciones de memoria (_mem_) ocupan dos bytes de memoria según en formato little-endian. Por ejemplo, la dirección `1234h` se escribiría `00110100 00010010`.

De manera similar se escriben las operaciones inmediatas (_op.inm_). Para datos de tipo byte, se ocupa solo un byte (`89h` &rarr; `10001001`), y para los datos de tipo word se ocupan dos bytes en formato little-endian (`1234h` &rarr; `00110100 00010010`).

Los registros (_reg_) se denotan en binario de la siguiente manera:

| Nombre |  Binario   |
| :----: | :--------: |
|  `AL`  | `00000000` |
|  `BL`  | `00000001` |
|  `CL`  | `00000010` |
|  `DL`  | `00000011` |
|  `AH`  | `01000000` |
|  `BH`  | `01000001` |
|  `CH`  | `01000010` |
|  `DH`  | `01000011` |
|  `DH`  | `01000011` |
|  `AX`  | `10000000` |
|  `BX`  | `10000001` |
|  `CX`  | `10000010` |
|  `DX`  | `10000011` |
|  `IP`  | `10100000` |
|  `SP`  | `10100001` |
|  `IR`  | `10100010` |
| `MAR`  | `10100011` |
| `MAB`  | `10100100` |

A modo de ayuda memoria:
- si empieza con `0`, es de tipo byte, y si empieza con `1`, es de tipo word;
- si empieza con `101`, es un registro especial;
- si no es un registro especial, los últimos números representan si es `A`, `B`, `C` o `D`;
- si empieza con `00`, es la parte low registro general, y si empieza con `01`, es la parte high.


## Flags

Internamente, las flags de `C` (carry), `O` (overflow), `S` (sign) y `Z` (zero) se representan como `00`, `01`, `10` y `11` respectivamente. Eso explica la numeración de los jumps y la razón detrás de que `PUSHF` apile `COSZ`.