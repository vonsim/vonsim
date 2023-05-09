# Codificación

Aquí se denota la codificación en binario de cada una de las instrucciones del simulador. Está basada en los códigos de máquina del Inte 8086/8088.

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
- **desp** se refiere al word de un desplazamiento.
- **dir** se refiere al word de una dirección.
- **xxx-low** se refiere a la parte menos significativa (LSB) de un word o a un byte.
- **xxx-high** se refiere a la marte más significativa (MSB) de un word.

Además, las instrucciones que referencian al registro `FLAGS` utilizan el siguiente dato de 16 bits:

| Bit # | Abreviatura | Descripción                |    Implementada    |
| :---: | :---------: | :------------------------- | :----------------: |
|   0   |    `CF`     | _Flag_ de acarreo          | :white_check_mark: |
|   2   |    `PF`     | _Flag_ de paridad          |        :x:         |
|   4   |    `AF`     | _Flag_ de acarreo auxiliar |        :x:         |
|   6   |    `ZF`     | _Flag_ de cero             | :white_check_mark: |
|   7   |    `SF`     | _Flag_ de signo            | :white_check_mark: |
|   8   |    `TF`     | _Trap flag_                |        :x:         |
|   9   |    `IF`     | _Flag_ de interrupción     | :white_check_mark: |
|  10   |    `DF`     | _Flag_ de dirección        |        :x:         |
|  11   |    `OF`     | _Flag_ de overflow         | :white_check_mark: |

El resto de bits están reservados / no se utilizan.

<!--

NOTAS:
  d = 0 => desde registro
  d = 1 => hacia registro

  mod = 00 => no hay disp-low ni disp-high
  mod = 01 => disp-low es sign-extended, no hay disp-high
  mod = 10 => hay disp-low y disp-high
  mod = 11 => r/m es reg

  mod = 00 && r/m = 110 => EA = disp-low, disp-high

  r/m = 111 => EA = (BX) + disp

  importante:
    disp siempre se cuentra luego del 2do byte

  sw = 01 => dato inmediato de 16 bits
  sw = 11 => dato inmediato de 8 bits sign-extended a 16 bits

 -->

## Instrucciones de transferencia de datos

`MOV` registro, REGISTRO

- `1000101w`, `11rrrRRR`

`MOV` registro, memoria

- Dir. directo: `1000101w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `1000101w`, `00rrr111`
- Dir. indirecto con desp.: `1000101w`, `10rrr111`, desp-low, desp-high

`MOV` registro, inmediato

- `1011wrrr`, dato-low, dato-high

`MOV` memoria, registro

- Dir. directo: `1000100w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `1000100w`, `00rrr111`
- Dir. indirecto con desp.: `1000100w`, `10rrr111`, desp-low, desp-high

`MOV` memoria, inmediato

- Dir. directo: `1100011w`, `00000110`, dir-low, dir-high, dato-low, dato-high
- Dir. indirecto: `1100011w`, `00000111`, dato-low, dato-high
- Dir. indirecto con desp.: `1100011w`, `10000111`, desp-low, desp-high, dato-low, dato-high

---

`PUSH` registro

- `01010rrr`

`POP` registro

- `01011rrr`

`PUSHF`

- `10011100`

`POPF`

- `10011101`

---

`IN` AL/AX, puerto

- Puerto fijo: `1110010w`, puerto
- Puerto variable (DX): `1110110w`

`OUT` puerto, AL/AX

- Puerto fijo: `1110011w`, puerto
- Puerto variable (DX): `1110111w`

## Instrucciones aritméticas

`ADD` registro, REGISTRO

- `0000001w`, `11rrrRRR`

`ADD` registro, memoria

- Dir. directo: `0000001w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0000001w`, `00rrr111`
- Dir. indirecto con desp.: `0000001w`, `10rrr111`, desp-low, desp-high

`ADD` registro, inmediato

- `1000000w`, `11000rrr`, dato-low, dato-high

`ADD` memoria, registro

- Dir. directo: `0000000w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0000000w`, `00rrr111`
- Dir. indirecto con desp.: `0000000w`, `10rrr111`, desp-low, desp-high

`ADD` memoria, inmediato

- Dir. directo: `1000000w`, `00000110`, dir-low, dir-high, dato-low, dato-high
- Dir. indirecto: `1000000w`, `00000111`, dato-low, dato-high
- Dir. indirecto con desp.: `1000000w`, `10000111`, desp-low, desp-high, dato-low, dato-high

---

`ADC` registro, REGISTRO

- `0001001w`, `11rrrRRR`

`ADC` registro, memoria

- Dir. directo: `0001001w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0001001w`, `00rrr111`
- Dir. indirecto con desp.: `0001001w`, `10rrr111`, desp-low, desp-high

`ADC` registro, inmediato

- `1000000w`, `11010rrr`, dato-low, dato-high

`ADC` memoria, registro

- Dir. directo: `0001000w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0001000w`, `00rrr111`
- Dir. indirecto con desp.: `0001000w`, `10rrr111`, desp-low, desp-high

`ADC` memoria, inmediato

- Dir. directo: `1000000w`, `00010110`, dir-low, dir-high, dato-low, dato-high
- Dir. indirecto: `1000000w`, `00010111`, dato-low, dato-high
- Dir. indirecto con desp.: `1000000w`, `10010111`, desp-low, desp-high, dato-low, dato-high

---

`SUB` registro, REGISTRO

- `0010101w`, `11rrrRRR`

`SUB` registro, memoria

- Dir. directo: `0010101w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0010101w`, `00rrr111`
- Dir. indirecto con desp.: `0010101w`, `10rrr111`, desp-low, desp-high

`SUB` registro, inmediato

- `1000000w`, `11101rrr`, dato-low, dato-high

`SUB` memoria, registro

- Dir. directo: `0010100w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0010100w`, `00rrr111`
- Dir. indirecto con desp.: `0010100w`, `10rrr111`, desp-low, desp-high

`SUB` memoria, inmediato

- Dir. directo: `1000000w`, `00101110`, dir-low, dir-high, dato-low, dato-high
- Dir. indirecto: `1000000w`, `00101111`, dato-low, dato-high
- Dir. indirecto con desp.: `1000000w`, `10101111`, desp-low, desp-high, dato-low, dato-high

---

`SBB` registro, REGISTRO

- `0001101w`, `11rrrRRR`

`SBB` registro, memoria

- Dir. directo: `0001101w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0001101w`, `00rrr111`
- Dir. indirecto con desp.: `0001101w`, `10rrr111`, desp-low, desp-high

`SBB` registro, inmediato

- `1000000w`, `11011rrr`, dato-low, dato-high

`SBB` memoria, registro

- Dir. directo: `0001100w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0001100w`, `00rrr111`
- Dir. indirecto con desp.: `0001100w`, `10rrr111`, desp-low, desp-high

`SBB` memoria, inmediato

- Dir. directo: `1000000w`, `00011110`, dir-low, dir-high, dato-low, dato-high
- Dir. indirecto: `1000000w`, `00011111`, dato-low, dato-high
- Dir. indirecto con desp.: `1000000w`, `10011111`, desp-low, desp-high, dato-low, dato-high

---

`CMP` registro, REGISTRO

- `0011101w`, `11rrrRRR`

`CMP` registro, memoria

- Dir. directo: `0011101w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0011101w`, `00rrr111`
- Dir. indirecto con desp.: `0011101w`, `10rrr111`, desp-low, desp-high

`CMP` registro, inmediato

- `1000000w`, `11111rrr`, dato-low, dato-high

`CMP` memoria, registro

- Dir. directo: `0011100w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0011100w`, `00rrr111`
- Dir. indirecto con desp.: `0011100w`, `10rrr111`, desp-low, desp-high

`CMP` memoria, inmediato

- Dir. directo: `1000000w`, `00111110`, dir-low, dir-high, dato-low, dato-high
- Dir. indirecto: `1000000w`, `00111111`, dato-low, dato-high
- Dir. indirecto con desp.: `1000000w`, `10111111`, desp-low, desp-high, dato-low, dato-high

---

`NEG` registro

- `1111011w`, `11011rrr`

`NEG` memoria

- Dir. directo: `1111011w`, `00011110`, dir-low, dir-high
- Dir. indirecto: `1111011w`, `00011111`
- Dir. indirecto con desp.: `1111011w`, `10011111`, desp-low, desp-high

---

`INC` registro

- `01000rrr`

`INC` memoria

- Dir. directo: `1111111w`, `00000110`, dir-low, dir-high
- Dir. indirecto: `1111111w`, `00000111`
- Dir. indirecto con desp.: `1111111w`, `10000111`, desp-low, desp-high

---

`DEC` registro

- `01001rrr`

`DEC` memoria

- Dir. directo: `1111111w`, `00001110`, dir-low, dir-high
- Dir. indirecto: `1111111w`, `00001111`
- Dir. indirecto con desp.: `1111111w`, `10001111`, desp-low, desp-high

## Instrucciones lógicas

`AND` registro, REGISTRO

- `0010001w`, `11rrrRRR`

`AND` registro, memoria

- Dir. directo: `0010001w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0010001w`, `00rrr111`
- Dir. indirecto con desp.: `0010001w`, `10rrr111`, desp-low, desp-high

`AND` registro, inmediato

- `1000000w`, `11100rrr`, dato-low, dato-high

`AND` memoria, registro

- Dir. directo: `0010000w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0010000w`, `00rrr111`
- Dir. indirecto con desp.: `0010000w`, `10rrr111`, desp-low, desp-high

`AND` memoria, inmediato

- Dir. directo: `1000000w`, `00100110`, dir-low, dir-high, dato-low, dato-high
- Dir. indirecto: `1000000w`, `00100111`, dato-low, dato-high
- Dir. indirecto con desp.: `1000000w`, `10100111`, desp-low, desp-high, dato-low, dato-high

---

`OR` registro, REGISTRO

- `0000101w`, `11rrrRRR`

`OR` registro, memoria

- Dir. directo: `0000101w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0000101w`, `00rrr111`
- Dir. indirecto con desp.: `0000101w`, `10rrr111`, desp-low, desp-high

`OR` registro, inmediato

- `1000000w`, `11001rrr`, dato-low, dato-high

`OR` memoria, registro

- Dir. directo: `0000100w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0000100w`, `00rrr111`
- Dir. indirecto con desp.: `0000100w`, `10rrr111`, desp-low, desp-high

`OR` memoria, inmediato

- Dir. directo: `1000000w`, `00001110`, dir-low, dir-high, dato-low, dato-high
- Dir. indirecto: `1000000w`, `00001111`, dato-low, dato-high
- Dir. indirecto con desp.: `1000000w`, `10001111`, desp-low, desp-high, dato-low, dato-high

---

`XOR` registro, REGISTRO

- `0011001w`, `11rrrRRR`

`XOR` registro, memoria

- Dir. directo: `0011001w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0011001w`, `00rrr111`
- Dir. indirecto con desp.: `0011001w`, `10rrr111`, desp-low, desp-high

`XOR` registro, inmediato

- `1000000w`, `11110rrr`, dato-low, dato-high

`XOR` memoria, registro

- Dir. directo: `0011000w`, `00rrr110`, dir-low, dir-high
- Dir. indirecto: `0011000w`, `00rrr111`
- Dir. indirecto con desp.: `0011000w`, `10rrr111`, desp-low, desp-high

`XOR` memoria, inmediato

- Dir. directo: `1000000w`, `00110110`, dir-low, dir-high, dato-low, dato-high
- Dir. indirecto: `1000000w`, `00110111`, dato-low, dato-high
- Dir. indirecto con desp.: `1000000w`, `10110111`, desp-low, desp-high, dato-low, dato-high

---

`NOT` registro

- `1111011w`, `11010rrr`

`NOT` memoria

- Dir. directo: `1111011w`, `00001110`, dir-low, dir-high
- Dir. indirecto: `1111011w`, `00001111`
- Dir. indirecto con desp.: `1111011w`, `10001111`, desp-low, desp-high

## Instrucciones de transferencia de control

:::tip
Todos los desplazamientos son relativos al _program counter_. Específicamente, a la dirección de la próxima instrucción.
:::

`CALL`

- `11101000`, desp-low, desp-low

`RET`

- `11000011`

`JMP`

- `11101001`, desp-low, desp-low

:::warning
Todos los saltos condicionales tienen un desplazamiento de un byte.
:::

`JC`

- `01110010`, desp

`JNC`

- `01110011`, desp

:::info
En las mnemotécnicas de Intel, `JC` figura como `JB`.
:::

`JZ`

- `01110100`, desp

`JNZ`

- `01110101`, desp

`JS`

- `01111000`, desp

`JNS`

- `01111001`, desp

`JO`

- `01110000`, desp

`JNO`

- `01110001`, desp

## Instrucciones de manejo de interrupciones

`INT`, N

- `11001100`, N (1 byte)

`IRET`

- `11001111`

`CLI`

- `11111010`

`STI`

- `11111011`

## Instrucciones de control

`NOP`

- `10010000`

`HLT`

- `11110100`
