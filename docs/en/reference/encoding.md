# Encoding

This section describes the binary encoding of each of the simulator's instructions. Although the instruction set is based on that of the Intel 8088, the encoding has been simplified for practical and educational purposes.

## Acronyms and abbreviations

Throughout the encoding, the following abbreviations are used:

- `w`: indicates the size of the operands.

  |  `w`  | Size    |
  | :---: | :------ |
  |  `0`  | 8 bits  |
  |  `1`  | 16 bits |

- `rrr` or `RRR`: reference registers, and depend on `w`.

  | `rrr` | `w=0` | `w=1` |
  | :---: | :---: | :---: |
  | `000` | `AL`  | `AX`  |
  | `001` | `CL`  | `CX`  |
  | `010` | `DL`  | `DX`  |
  | `011` | `BL`  | `BX`  |
  | `100` | `AH`  | `SP`  |
  | `101` | `CH`  | `BP`  |
  | `110` | `DH`  |   —   |
  | `111` | `BH`  |   —   |

- **data** refers to the byte/word of immediate data. For instructions where `w=0`, **data-high** is ignored.
- **disp** refers to the word of a offset/displacement (always in 2's complement).
- **addr** refers to the word of an address.
- **xxx-low** refers to the least significant part (LSB) of a word or a byte.
- **xxx-high** refers to the most significant part (MSB) of a word.

## ALU Binary Instructions

| Instruction |    Opcode    |
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

These instructions receive two operands and support various addressing modes. This information is encoded in the `d` bit and the second byte of the instruction according to the following table:

| Destination                   | Source                        | Second byte | Following bytes                          |
| :---------------------------- | :---------------------------- | :---------: | :--------------------------------------- |
| Register                      | Register                      | `00RRRrrr`  | —                                        |
| Register                      | Memory (direct)               | `01000rrr`  | addr-low, addr-high                      |
| Register                      | Memory (indirect)             | `0110Brrr`  | —                                        |
| Register                      | Memory (indirect with offset) | `0111Brrr`  | disp-low, disp-high                      |
| Register                      | Immediate                     | `01001rrr`  | data-low, data-high                      |
| Memory (direct)               | Register                      | `10000rrr`  | addr-low, addr-high                      |
| Memory (indirect)             | Register                      | `1010Brrr`  | —                                        |
| Memory (indirect with offset) | Register                      | `1011Brrr`  | disp-low, disp-high                      |
| Memory (direct)               | Immediate                     | `11000000`  | addr-low, addr-high, data-low, data-high |
| Memory (indirect)             | Immediate                     | `1110B000`  | data-low, data-high                      |
| Memory (indirect with offset) | Immediate                     | `1111B000`  | disp-low, disp-high, data-low, data-high |

For instructions with a register as an operand, `rrr` encodes this register. In the case of register to register, `RRR` encodes the source register and `rrr` the destination register. `B` indicates the register for indirect addressing: `B=0` for `BP` and `B=1` for `BX`.

## ALU Unary Instructions

| Instruction |    Opcode    |
| :---------: | :----------: |
|    `NOT`    | `0100 000 w` |
|    `NEG`    | `0100 001 w` |
|    `INC`    | `0100 010 w` |
|    `DEC`    | `0100 011 w` |

These instructions receive one operand and support various addressing modes. This information is encoded in the second byte of the instruction according to the following table:

| Destination                   | Second byte | Following bytes     |
| :---------------------------- | :---------: | :------------------ |
| Register                      | `00000rrr`  | —                   |
| Memory (direct)               | `11000000`  | addr-low, addr-high |
| Memory (indirect)             | `1110B000`  | —                   |
| Memory (indirect with offset) | `1111B000`  | disp-low, disp-high |

## I/O Instructions

| Instruction |    Opcode    |
| :---------: | :----------: |
|    `IN`     | `0101 00 pw` |
|    `OUT`    | `0101 01 pw` |

The `p` bit encodes

- if the port is fixed (`p=0`), which will have to be provided in the next byte (maximum port: 255),
- or if the port is variable (`p=1`), in which case the value stored in the `DX` register will be used as the port.

## Stack Instructions

| Instruction |   Opcode    |
| :---------: | :---------: |
|   `PUSH`    | `0110 0rrr` |
|    `POP`    | `0110 1rrr` |
|   `PUSHF`   | `0111 0000` |
|   `POPF`    | `0111 1000` |

`rrr` always represents a 16-bit register.

## Jump Instructions

| Instruction |   Opcode    |
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

After the opcode, these instructions (except `RET`) receive an absolute memory address (which occupies two bytes).

## Interrupt Related Instructions

| Instruction |   Opcode    |
| :---------: | :---------: |
|    `CLI`    | `0001 1000` |
|    `STI`    | `0001 1001` |
|    `INT`    | `0001 1010` |
|   `IRET`    | `0001 1011` |

After the opcode, `INT` receives the instruction number (occupies one byte).

## Misc Instructions

| Instruction |   Opcode    |
| :---------: | :---------: |
|    `NOP`    | `0001 0000` |
|    `HLT`    | `0001 0001` |
