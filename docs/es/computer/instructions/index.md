# Set de instrucciones

Aquí se listan todas las instrucciones que soporta el simulador. Cada instrucción tiene una breve descripción, una tabla con los flags que modifica. Si hay un "0" o un "1", significa que el flag se modifica a `0` o `1` respectivamente. Si hay una "X", significa que lo modifica según corresponda. Si no hay nada, significa que el flag no se modifica.

### Instrucciones de transferencia de datos

| Instrucción                 | Comentario                                       | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :-------------------------- | :----------------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`MOV dest, fuente`](./mov) | Copia _fuente_ en _dest_                         |  --  |  --  |  --  |  --  |  --  |
| [`PUSH fuente`](./push)     | Carga _fuente_ en el tope de la pila             |  --  |  --  |  --  |  --  |  --  |
| [`POP dest`](./pop)         | Desapila el tope de la pila y lo carga en _dest_ |  --  |  --  |  --  |  --  |  --  |
| [`PUSHF`](./pushf)          | Apila `FLAGS`                                    |  --  |  --  |  --  |  --  |  --  |
| [`POPF`](./popf)            | Desapila `FLAGS`                                 |  X   |  X   |  X   |  X   |  X   |
| [`IN dest, fuente`](./in)   | Carga el valor en el puerto _fuente_ en _dest_   |  --  |  --  |  --  |  --  |  --  |
| [`OUT dest, fuente`](./out) | Carga en el puerto _dest_ el valor en _fuente_   |  --  |  --  |  --  |  --  |  --  |

### Instrucciones aritméticas

| Instrucción                 | Comentario                     | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :-------------------------- | :----------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`ADD dest, fuente`](./add) | Suma _fuente_ a _dest_         |  X   |  X   |  X   |  --  |  X   |
| [`ADC dest, fuente`](./adc) | Suma _fuente_ y `CF` a _dest_  |  X   |  X   |  X   |  --  |  X   |
| [`SUB dest, fuente`](./sub) | Resta _fuente_ a _dest_        |  X   |  X   |  X   |  --  |  X   |
| [`SBB dest, fuente`](./sbb) | Resta _fuente_ y `CF` a _dest_ |  X   |  X   |  X   |  --  |  X   |
| [`CMP dest, fuente`](./cmp) | Compara _fuente_ con _dest_    |  X   |  X   |  X   |  --  |  X   |
| [`NEG dest`](./neg)         | Negativo de _dest_             |  X   |  X   |  X   |  --  |  X   |
| [`INC dest`](./inc)         | Incrementa _dest_              |  X   |  X   |  X   |  --  |  X   |
| [`DEC dest`](./dec)         | Decrementa _dest_              |  X   |  X   |  X   |  --  |  X   |

### Instrucciones lógicas

| Instrucción                   | Comentario                                          | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :---------------------------- | :-------------------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`AND dest, fuente`](./and)   | Operación _dest_ AND _fuente_ bit a bit             |  0   |  X   |  X   |  --  |  0   |
| [`OR dest, fuente`](./or)     | Operación _dest_ OR _fuente_ bit a bit              |  0   |  X   |  X   |  --  |  0   |
| [`XOR dest, fuente`](./xor)   | Operación _dest_ XOR _fuente_ bit a bit             |  0   |  X   |  X   |  --  |  0   |
| [`TEST dest, fuente`](./test) | Operación _dest_ AND _fuente_ bit a bit, solo flags |  0   |  X   |  X   |  --  |  0   |
| [`NOT dest`](./not)           | Operación NOT _dest_ bit a bit                      |  0   |  X   |  X   |  --  |  0   |

### Instrucciones de transferencia de control

| Instrucción               | Comentario                                  | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------------------ | :------------------------------------------ | :--: | :--: | :--: | :--: | :--: |
| [`CALL etiqueta`](./call) | Llama a subrutina cuyo inicio es _etiqueta_ |  --  |  --  |  --  |  --  |  --  |
| [`RET`](./ret)            | Retorna de la subrutina                     |  --  |  --  |  --  |  --  |  --  |
| [`JC etiqueta`](./jc)     | Salta a _etiqueta_ si `CF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNC etiqueta`](./jnc)   | Salta a _etiqueta_ si `CF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JZ etiqueta`](./jz)     | Salta a _etiqueta_ si `ZF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNZ etiqueta`](./jnz)   | Salta a _etiqueta_ si `ZF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JS etiqueta`](./js)     | Salta a _etiqueta_ si `SF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNS etiqueta`](./jns)   | Salta a _etiqueta_ si `SF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JO etiqueta`](./jo)     | Salta a _etiqueta_ si `OF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNO etiqueta`](./jno)   | Salta a _etiqueta_ si `OF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JMP etiqueta`](./jmp)   | Salta incondicionalmente a _etiqueta_       |  --  |  --  |  --  |  --  |  --  |

### Instrucciones de manejo de interrupciones

| Instrucción      | Comentario                               | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :--------------- | :--------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`INT N`](./int) | Ejecuta la interrupción por software _N_ |  --  |  --  |  --  |  0   |  --  |
| [`IRET`](./iret) | Retorna de la rutina de interrupción     |  X   |  X   |  X   |  X   |  X   |
| [`CLI`](./cli)   | Inhabilita interrupciones enmascarables  |  --  |  --  |  --  |  0   |  --  |
| [`STI`](./sti)   | Habilita interrupciones enmascarables    |  --  |  --  |  --  |  1   |  --  |

### Instrucciones de control

| Instrucción    | Comentario           | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------- | :------------------- | :--: | :--: | :--: | :--: | :--: |
| [`NOP`](./nop) | No hace nada         |  --  |  --  |  --  |  --  |  --  |
| [`HLT`](./hlt) | Detiene la ejecución |  --  |  --  |  --  |  --  |  --  |
