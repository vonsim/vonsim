---
title: Set de instrucciones
head:
  - tag: meta
    attrs: { property: og:image, content: https://vonsim.github.io/docs/og/cpu/instructions.png }
---

Aquí se listan todas las instrucciones que soporta el simulador. Cada instrucción tiene una breve descripción, una tabla con los flags que modifica. Si hay un "0" o un "1", significa que el flag se modifica a `0` o `1` respectivamente. Si hay una "X", significa que lo modifica según corresponda. Si no hay nada, significa que el flag no se modifica.

### Instrucciones de transferencia de datos

| Instrucción                                       | Comentario                                       | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------------------------------------------ | :----------------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`MOV dest, fuente`](/docs/cpu/instructions/mov/) | Copia _fuente_ en _dest_                         |  --  |  --  |  --  |  --  |  --  |
| [`PUSH fuente`](/docs/cpu/instructions/push/)     | Carga _fuente_ en el tope de la pila             |  --  |  --  |  --  |  --  |  --  |
| [`POP dest`](/docs/cpu/instructions/pop/)         | Desapila el tope de la pila y lo carga en _dest_ |  --  |  --  |  --  |  --  |  --  |
| [`PUSHF`](/docs/cpu/instructions/pushf/)          | Apila `FLAGS`                                    |  --  |  --  |  --  |  --  |  --  |
| [`POPF`](/docs/cpu/instructions/popf/)            | Desapila `FLAGS`                                 |  X   |  X   |  X   |  X   |  X   |
| [`IN dest, fuente`](/docs/cpu/instructions/in/)   | Carga el valor en el puerto _fuente_ en _dest_   |  --  |  --  |  --  |  --  |  --  |
| [`OUT dest, fuente`](/docs/cpu/instructions/out/) | Carga en el puerto _dest_ el valor en _fuente_   |  --  |  --  |  --  |  --  |  --  |

### Instrucciones aritméticas

| Instrucción                                       | Comentario                     | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------------------------------------------ | :----------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`ADD dest, fuente`](/docs/cpu/instructions/add/) | Suma _fuente_ a _dest_         |  X   |  X   |  X   |  --  |  X   |
| [`ADC dest, fuente`](/docs/cpu/instructions/adc/) | Suma _fuente_ y `CF` a _dest_  |  X   |  X   |  X   |  --  |  X   |
| [`SUB dest, fuente`](/docs/cpu/instructions/sub/) | Resta _fuente_ a _dest_        |  X   |  X   |  X   |  --  |  X   |
| [`SBB dest, fuente`](/docs/cpu/instructions/sbb/) | Resta _fuente_ y `CF` a _dest_ |  X   |  X   |  X   |  --  |  X   |
| [`CMP dest, fuente`](/docs/cpu/instructions/cmp/) | Compara _fuente_ con _dest_    |  X   |  X   |  X   |  --  |  X   |
| [`NEG dest`](/docs/cpu/instructions/neg/)         | Negativo de _dest_             |  X   |  X   |  X   |  --  |  X   |
| [`INC dest`](/docs/cpu/instructions/inc/)         | Incrementa _dest_              |  X   |  X   |  X   |  --  |  X   |
| [`DEC dest`](/docs/cpu/instructions/dec/)         | Decrementa _dest_              |  X   |  X   |  X   |  --  |  X   |

### Instrucciones lógicas

| Instrucción                                       | Comentario                              | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------------------------------------------ | :-------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`AND dest, fuente`](/docs/cpu/instructions/and/) | Operación _dest_ AND _fuente_ bit a bit |  0   |  X   |  X   |  --  |  0   |
| [`OR dest, fuente`](/docs/cpu/instructions/or/)   | Operación _dest_ OR _fuente_ bit a bit  |  0   |  X   |  X   |  --  |  0   |
| [`XOR dest, fuente`](/docs/cpu/instructions/xor/) | Operación _dest_ XOR _fuente_ bit a bit |  0   |  X   |  X   |  --  |  0   |
| [`NOT dest`](/docs/cpu/instructions/not/)         | Operación NOT _dest_ bit a bit          |  0   |  X   |  X   |  --  |  0   |

### Instrucciones de transferencia de control

| Instrucción                                     | Comentario                                  | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :---------------------------------------------- | :------------------------------------------ | :--: | :--: | :--: | :--: | :--: |
| [`CALL etiqueta`](/docs/cpu/instructions/call/) | Llama a subrutina cuyo inicio es _etiqueta_ |  --  |  --  |  --  |  --  |  --  |
| [`RET`](/docs/cpu/instructions/ret/)            | Retorna de la subrutina                     |  --  |  --  |  --  |  --  |  --  |
| [`JC etiqueta`](/docs/cpu/instructions/jc/)     | Salta a _etiqueta_ si `CF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNC etiqueta`](/docs/cpu/instructions/jnc/)   | Salta a _etiqueta_ si `CF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JZ etiqueta`](/docs/cpu/instructions/jz/)     | Salta a _etiqueta_ si `ZF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNZ etiqueta`](/docs/cpu/instructions/jnz/)   | Salta a _etiqueta_ si `ZF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JS etiqueta`](/docs/cpu/instructions/js/)     | Salta a _etiqueta_ si `SF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNS etiqueta`](/docs/cpu/instructions/jns/)   | Salta a _etiqueta_ si `SF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JO etiqueta`](/docs/cpu/instructions/jo/)     | Salta a _etiqueta_ si `OF=1`                |  --  |  --  |  --  |  --  |  --  |
| [`JNO etiqueta`](/docs/cpu/instructions/jno/)   | Salta a _etiqueta_ si `OF=0`                |  --  |  --  |  --  |  --  |  --  |
| [`JMP etiqueta`](/docs/cpu/instructions/jmp/)   | Salta incondicionalmente a _etiqueta_       |  --  |  --  |  --  |  --  |  --  |

### Instrucciones de manejo de interrupciones

| Instrucción                            | Comentario                               | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------------------------------- | :--------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`INT N`](/docs/cpu/instructions/int/) | Ejecuta la interrupción por software _N_ |  --  |  --  |  --  |  0   |  --  |
| [`IRET`](/docs/cpu/instructions/iret/) | Retorna de la rutina de interrupción     |  X   |  X   |  X   |  X   |  X   |
| [`CLI`](/docs/cpu/instructions/cli/)   | Inhabilita interrupciones enmascarables  |  --  |  --  |  --  |  0   |  --  |
| [`STI`](/docs/cpu/instructions/sti/)   | Habilita interrupciones enmascarables    |  --  |  --  |  --  |  1   |  --  |

### Instrucciones de control

| Instrucción                          | Comentario           | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :----------------------------------- | :------------------- | :--: | :--: | :--: | :--: | :--: |
| [`NOP`](/docs/cpu/instructions/nop/) | No hace nada         |  --  |  --  |  --  |  --  |  --  |
| [`HLT`](/docs/cpu/instructions/hlt/) | Detiene la ejecución |  --  |  --  |  --  |  --  |  --  |

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
