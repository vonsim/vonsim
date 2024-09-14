# Instruction Set

Here is a list of all the instructions supported by the simulator. Each instruction includes a brief description and a table showing the flags it modifies. If there is a "0" or "1," it means the flag is set to `0` or `1` respectively. If there is an "X," it means the flag is modified accordingly. If there is nothing, the flag is not modified.

### Data Transfer Instructions

| Instruction                 | Description                                        | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :-------------------------- | :------------------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`MOV dest, source`](./mov) | Copies _source_ to _dest_                          |  --  |  --  |  --  |  --  |  --  |
| [`PUSH source`](./push)     | Pushes _source_ onto the stack                     |  --  |  --  |  --  |  --  |  --  |
| [`POP dest`](./pop)         | Pops the top of the stack and loads it into _dest_ |  --  |  --  |  --  |  --  |  --  |
| [`PUSHF`](./pushf)          | Pushes `FLAGS` onto the stack                      |  --  |  --  |  --  |  --  |  --  |
| [`POPF`](./popf)            | Pops `FLAGS` from the stack                        |  X   |  X   |  X   |  X   |  X   |
| [`IN dest, source`](./in)   | Loads the value from port _source_ into _dest_     |  --  |  --  |  --  |  --  |  --  |
| [`OUT dest, source`](./out) | Loads the value from _source_ into port _dest_     |  --  |  --  |  --  |  --  |  --  |

### Arithmetic Instructions

| Instruction                 | Description                             | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :-------------------------- | :-------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`ADD dest, source`](./add) | Adds _source_ to _dest_                 |  X   |  X   |  X   |  --  |  X   |
| [`ADC dest, source`](./adc) | Adds _source_ and `CF` to _dest_        |  X   |  X   |  X   |  --  |  X   |
| [`SUB dest, source`](./sub) | Subtracts _source_ from _dest_          |  X   |  X   |  X   |  --  |  X   |
| [`SBB dest, source`](./sbb) | Subtracts _source_ and `CF` from _dest_ |  X   |  X   |  X   |  --  |  X   |
| [`CMP dest, source`](./cmp) | Compares _source_ with _dest_           |  X   |  X   |  X   |  --  |  X   |
| [`NEG dest`](./neg)         | Negates _dest_                          |  X   |  X   |  X   |  --  |  X   |
| [`INC dest`](./inc)         | Increments _dest_                       |  X   |  X   |  X   |  --  |  X   |
| [`DEC dest`](./dec)         | Decrements _dest_                       |  X   |  X   |  X   |  --  |  X   |

### Logical Instructions

| Instruction                   | Description                                                  | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :---------------------------- | :----------------------------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`AND dest, source`](./and)   | Performs bitwise AND between _dest_ and _source_             |  0   |  X   |  X   |  --  |  0   |
| [`OR dest, source`](./or)     | Performs bitwise OR between _dest_ and _source_              |  0   |  X   |  X   |  --  |  0   |
| [`XOR dest, source`](./xor)   | Performs bitwise XOR between _dest_ and _source_             |  0   |  X   |  X   |  --  |  0   |
| [`TEST dest, fuente`](./test) | Performs bitwise AND between _dest_ and _source_, only flags |  0   |  X   |  X   |  --  |  0   |
| [`NOT dest`](./not)           | Performs bitwise NOT on _dest_                               |  0   |  X   |  X   |  --  |  0   |

### Control Transfer Instructions

| Instruction            | Description                            | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :--------------------- | :------------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`CALL label`](./call) | Calls a subroutine starting at _label_ |  --  |  --  |  --  |  --  |  --  |
| [`RET`](./ret)         | Returns from the subroutine            |  --  |  --  |  --  |  --  |  --  |
| [`JC label`](./jc)     | Jumps to _label_ if `CF=1`             |  --  |  --  |  --  |  --  |  --  |
| [`JNC label`](./jnc)   | Jumps to _label_ if `CF=0`             |  --  |  --  |  --  |  --  |  --  |
| [`JZ label`](./jz)     | Jumps to _label_ if `ZF=1`             |  --  |  --  |  --  |  --  |  --  |
| [`JNZ label`](./jnz)   | Jumps to _label_ if `ZF=0`             |  --  |  --  |  --  |  --  |  --  |
| [`JS label`](./js)     | Jumps to _label_ if `SF=1`             |  --  |  --  |  --  |  --  |  --  |
| [`JNS label`](./jns)   | Jumps to _label_ if `SF=0`             |  --  |  --  |  --  |  --  |  --  |
| [`JO label`](./jo)     | Jumps to _label_ if `OF=1`             |  --  |  --  |  --  |  --  |  --  |
| [`JNO label`](./jno)   | Jumps to _label_ if `OF=0`             |  --  |  --  |  --  |  --  |  --  |
| [`JMP label`](./jmp)   | Unconditionally jumps to _label_       |  --  |  --  |  --  |  --  |  --  |

### Interrupt Handling Instructions

| Instruction      | Description                        | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :--------------- | :--------------------------------- | :--: | :--: | :--: | :--: | :--: |
| [`INT N`](./int) | Executes software interrupt _N_    |  --  |  --  |  --  |  0   |  --  |
| [`IRET`](./iret) | Returns from the interrupt routine |  X   |  X   |  X   |  X   |  X   |
| [`CLI`](./cli)   | Disables maskable interrupts       |  --  |  --  |  --  |  0   |  --  |
| [`STI`](./sti)   | Enables maskable interrupts        |  --  |  --  |  --  |  1   |  --  |

### Control Instructions

| Instruction    | Description     | `CF` | `ZF` | `SF` | `IF` | `OF` |
| :------------- | :-------------- | :--: | :--: | :--: | :--: | :--: |
| [`NOP`](./nop) | Does nothing    |  --  |  --  |  --  |  --  |  --  |
| [`HLT`](./hlt) | Halts execution |  --  |  --  |  --  |  --  |  --  |
