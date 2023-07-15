---
title: Set de instrucciones
---

Aquí se listan todas las instrucciones que soporta el simulador. Cada instrucción tiene una breve descripción, una tabla con los flags que modifica. Si hay un "0" o un "1", significa que el flag se modifica a `0` o `1` respectivamente. Si hay una "X", significa que lo modifica según corresponda. Si no hay nada, significa que el flag no se modifica.

### Instrucciones de transferencia de datos

| Instrucción                                  | Comentario                                       | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------------------------------------- | :----------------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`MOV dest, fuente`](/cpu/instructions/mov/) | Copia _fuente_ en _dest_                         |  --  |  --  |  --  |  --  |  --  |
| [`PUSH fuente`](/cpu/instructions/push/)     | Carga _fuente_ en el tope de la pila             |  --  |  --  |  --  |  --  |  --  |
| [`POP dest`](/cpu/instructions/pop/)         | Desapila el tope de la pila y lo carga en _dest_ |  --  |  --  |  --  |  --  |  --  |
| [`PUSHF`](/cpu/instructions/pushf/)          | Apila `FLAGS`                                    |  --  |  --  |  --  |  --  |  --  |
| [`POPF`](/cpu/instructions/popf/)            | Desapila `FLAGS`                                 |  X   |  X   |  X   |  X   |  X   |
| [`IN dest, fuente`](/cpu/instructions/in/)   | Carga el valor en el puerto _fuente_ en _dest_   |  --  |  --  |  --  |  --  |  --  |
| [`OUT dest, fuente`](/cpu/instructions/out/) | Carga en el puerto _dest_ el valor en _fuente_   |  --  |  --  |  --  |  --  |  --  |

### Instrucciones aritméticas

| Instrucción                                  | Comentario                     | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------------------------------------- | :----------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`ADD dest, fuente`](/cpu/instructions/add/) | Suma _fuente_ a _dest_         |  X   |  X   |  X   |  --  |  X   |
| [`ADC dest, fuente`](/cpu/instructions/adc/) | Suma _fuente_ y `CF` a _dest_  |  X   |  X   |  X   |  --  |  X   |
| [`SUB dest, fuente`](/cpu/instructions/sub/) | Resta _fuente_ a _dest_        |  X   |  X   |  X   |  --  |  X   |
| [`SBB dest, fuente`](/cpu/instructions/sbb/) | Resta _fuente_ y `CF` a _dest_ |  X   |  X   |  X   |  --  |  X   |
| [`CMP dest, fuente`](/cpu/instructions/cmp/) | Compara _fuente_ con _dest_    |  X   |  X   |  X   |  --  |  X   |
| [`NEG dest`](/cpu/instructions/neg/)         | Negativo de _dest_             |  X   |  X   |  X   |  --  |  X   |
| [`INC dest`](/cpu/instructions/inc/)         | Incrementa _dest_              |  X   |  X   |  X   |  --  |  X   |
| [`DEC dest`](/cpu/instructions/dec/)         | Decrementa _dest_              |  X   |  X   |  X   |  --  |  X   |

### Instrucciones lógicas

| Instrucción                                  | Comentario                              | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------------------------------------- | :-------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`AND dest, fuente`](/cpu/instructions/and/) | Operación _dest_ AND _fuente_ bit a bit |  0   |  X   |  X   |  --  |  0   |
| [`OR dest, fuente`](/cpu/instructions/or/)   | Operación _dest_ OR _fuente_ bit a bit  |  0   |  X   |  X   |  --  |  0   |
| [`XOR dest, fuente`](/cpu/instructions/xor/) | Operación _dest_ XOR _fuente_ bit a bit |  0   |  X   |  X   |  --  |  0   |
| [`NOT dest`](/cpu/instructions/not/)         | Operación NOT _dest_ bit a bit          |  0   |  X   |  X   |  --  |  0   |

### Instrucciones de transferencia de control

| Instrucción                                | Comentario                                  | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :----------------------------------------- | :------------------------------------------ | :--: | :--: | :--: | :--: | :--: |
| [`CALL etiqueta`](/cpu/instructions/call/) | Llama a subrutina cuyo inicio es _etiqueta_ |  --  |  --  |  --  |  --  |  --  |
| [`RET`](/cpu/instructions/ret/)            | Retorna de la subrutina                     |  --  |  --  |  --  |  --  |  --  |
| [`JC etiqueta`](/cpu/instructions/jc/)     | Salta a _etiqueta_ si `CF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNC etiqueta`](/cpu/instructions/jnc/)   | Salta a _etiqueta_ si `CF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JZ etiqueta`](/cpu/instructions/jz/)     | Salta a _etiqueta_ si `ZF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNZ etiqueta`](/cpu/instructions/jnz/)   | Salta a _etiqueta_ si `ZF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JS etiqueta`](/cpu/instructions/js/)     | Salta a _etiqueta_ si `SF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNS etiqueta`](/cpu/instructions/jns/)   | Salta a _etiqueta_ si `SF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JO etiqueta`](/cpu/instructions/jo/)     | Salta a _etiqueta_ si `OF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNO etiqueta`](/cpu/instructions/jno/)   | Salta a _etiqueta_ si `OF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JMP etiqueta`](/cpu/instructions/jmp/)   | Salta incondicionalmente a _etiqueta_       |  --  |  --  |  --  |  --  |  --  |

### Instrucciones de manejo de interrupciones

| Instrucción                       | Comentario                               | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :-------------------------------- | :--------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`INT N`](/cpu/instructions/int/) | Ejecuta la interrupción por software _N_ |  --  |  --  |  --  |  0   |  --  |
| [`IRET`](/cpu/instructions/iret/) | Retorna de la rutina de interrupción     |  X   |  X   |  X   |  X   |  X   |
| [`CLI`](/cpu/instructions/cli/)   | Inhabilita interrupciones enmascarables  |  --  |  --  |  --  |  0   |  --  |
| [`STI`](/cpu/instructions/sti/)   | Habilita interrupciones enmascarables    |  --  |  --  |  --  |  1   |  --  |

### Instrucciones de control

| Instrucción                     | Comentario           | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------------------------ | :------------------- | :--: | :--: | :--: | :--: | :--: |
| [`NOP`](/cpu/instructions/nop/) | No hace nada         |  --  |  --  |  --  |  --  |  --  |
| [`HLT`](/cpu/instructions/hlt/) | Detiene la ejecución |  --  |  --  |  --  |  --  |  --  |

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
