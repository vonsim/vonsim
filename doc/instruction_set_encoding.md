# Instruction set design

## Instructions

* binary (11) : `add,adc,sub,sbb,cmp,mov,or,xor,and,in,out`

* unary (17): `inc,dec,not,net,call,jmp,jc,jnc,jz,jnz,jo,jno,js,jns`

* zeroary (8): `pushf,popf,ret,iret,nop,hlt,cli,sti`

## General format

`| Op code (1 byte) | addressing mode (optional) | operands (1+ bytes)|`

(Note: each | denotes byte separation)

Op code format: `CCCCCCCC`  (8-bit operation Code)

* Zeroary
  * all instructions: `| CCCCCCCC |`

* Unary
  * jump instructions:   `| CCCCCCCC | address (2 bytes) |`
  * alu instructions:    `| CCCCCCCC | S-----MM | operand (register, direct or indirect mem address) |`
  * stack instructions:  `| CCCCCCCC | operand (1 byte) |`

  * Where:
    * `CCCCCCCC` = A 8-bit operation Code
    * `MM` = A 2-bit addresing Mode code
    * `S` = A bit indicating if the operand's Size is 1 byte or 2 bytes (0 => 1 byte, 1 => 2 bytes).

* Binary:
  * IO binary:  `| CCCCCCCC | RRRRRRRR | AAAAAAAA
  * Where:
    * `CCCCCCCC` = A 8-bit operation Code
    * `RRRRRRRR` = 8-bit register code (see below)
    * `AAAAAAAA` = 8-bit IO address
  * Other binary:  `| CCCCCCCC | S----MMM | operand (1 or 2 bytes) | operand (1 or 2 bytes) |`
  * Where:
    * `CCCCCCCC` = A 8-bit operation Code
    *`MMM` = A 3-bit addressing Mode code
    * `S` = A bit indicating if the operands' Sizes are 1 byte or 2 bytes (0 => 1 byte, 1 => 2 bytes).

Note: Many combinations of op codes, addressing codes and operands are illegal, for example those that encode binary operations between 16 bit and 8 bit registers. 

## Operands

There are three types of operands:

### Register Operands

1 byte with the code for the register

Format: `0000 HLRR`
* `RR`: a 2-byte code for the register, (`00 -> A, 01 -> B, 10 -> C, 11 -> D`)
* `H`: a bit indicating if accessing only the high part of the register 
* `L`: a bit indicating if accessing only the low  part of the register 
* `H` and `L` are mutually exclusive.

```
AX  0000 0000
BX  0000 0001
CX  0000 0010
DX  0000 0011
AL  0000 0100
BL  0000 0101
CL  0000 0110
DL  0000 0111
AH  0000 1000
BH  0000 1001
CH  0000 1010
DH  0000 1011
```

### Memory Operands
Format: `LLLLLLLL HHHHHHHH`

* Two bytes indicating the memory address of the value to use/update.
* `L` LSB of the address
* `H` MSB of the address

### Immediate Operands

Format: `LLLLLLLL` or `LLLLLLLL HHHHHHHH`

* One or two bytes with the value of the immediate operand.
* `L` LSB of the address
* `H` MSB of the address



## Binary Instructions

### Binary  operations
Format: `00 00 CCCC`

Where `CCCC` is a 4-bit instruction code.

```
add 00 00 0000
adc 00 00 0001
sub 00 00 0010
sbb 00 00 0011
or  00 00 0100
and 00 00 0101
xor 00 00 0110
cmp 00 00 0111
mov 00 00 1000
```


### Binary addressing Modes (16 -> 4 bits):
Format: `S000 0MMM`

`S` can be 0 or 1 (0 => 1-byte operands, 1 => 2 bytes operands)

```
reg,reg S000 0000
reg,im  S000 0001
reg,mem S000 0010
reg,ind S000 0011

mem,reg S000 0100
mem,im  S000 0101
ind,reg S000 0110
ind,im  S000 0111
```

Where:
* ind: indirect operand
* im:  immediate operand
* reg: register operand
* mem: memory operand

Notes:
* The operands must agree with the addressing modes; ie, if `S=0`, then operands must refer to 8-bit registers and 8 bit immediate operands.

## Binary IO Operations

Format: `00 00 10C1`

Where `C` is a single bit indicating the direction (`in` or `out`)

```
in  00 00 1001
out 00 00 1011
```
Notes:
* Since `reg, 8 bit im` is the only valid addressing mode for `in` and `out` instructions, there is no addresing mode byte

## Unary instructions (17)
General Format: `00 CCCCCC`

### ALU operations
Format: `00 01 CCCC`

```
inc 00 01 0001
dec 00 01 0010
not 00 01 0011
neg 00 01 0100
```

### Unary ALU operation addressing modes (MMS):
Format: `S000 00MM`
`S` can be 0 or 1 (0 => 1-byte operands, 1 => 2 bytes operands)

```
reg S000 0000
mem S000 0001
ind S000 0010
```


Notes:
* The operand must agree with the addressing mode; ie, if `S=0`, then the operands must refer to a 8-bit register or an 8 bit immediate operand.

### Int N and Stack instructions
Format: 00 10 00CC

```
push 00 10 0000
pop  00 10 0001
int  00 10 0010
```

### Jump instructions

Format: 00 11 CCCC

```
jc    00 11 0000
jnc   00 11 0001
jz    00 11 0010
jnz   00 11 0011
jo    00 11 0100
jno   00 11 0101
js    00 11 0110
jns   00 11 0111
jmp   00 11 1000
call  00 11 1001
```

## Zeroary instructions (8)

Format: `01 00 CCCC`
```
pushf 01 00 0000
popf  01 00 0001
ret   01 00 0010
iret  01 00 0011
nop   01 00 0100
hlt   01 00 0101
cli   01 00 0110
sti   01 00 0111
```


## Sample instruction sizes
```
6 bytes = binary op (1 byte) + addressing mode (1 byte) + mem address (2 bytes) + immediate (2 bytes)
5 bytes = binary op (1 byte) + addressing mode (1 byte) + mem address (2 bytes) + immediate (1 byte )
4 bytes = binary op (1 byte) + addressing mode (1 byte) + register    (1 byte ) + immediate (1 byte )
4 bytes = unary  op (1 byte) + addressing mode (1 byte) + mem address (2 bytes)
3 bytes = unary  op (1 byte) + addressing mode (1 byte) + register    (1 byte )
```

## Sample instruction encodings

```
Sample 1:
mov ax,bx = 00001000  00000001 00000000 00000001
   00001000 = mov
   10000000 = reg / reg addresing modes, 16 bit operands
   00000000 = AX register
   00000001 = BX register
   
Sample 2:
mov ax,5 = 00001000  00000011 00000000 00000000 00000101
   00001000 = mov
   10000001 = reg / immediate addresing modes, 16 bit operands
   00000000 = AX register
   00000000 00000101 = value 5 encoded in 16 bits BSS

Sample 3:
org 100h   = Not an executable statement
var: db 7  = Not an executable statement
org 2000h  = Not an executable statement
add al,var = 00000000 00000100 00000100 00000001 00000000
   00000000 = add
   00000010 = reg / mem addresing modes, 8 bit operands
   00000100 = AL register
   00000001 00000000 = address 100h encoded in 16 bits BSS

Sample 4:
inc cx  = 00010001  00000011 00000010
   00010001 = inc
   10000000 = reg addresing mode, 16 bit operand
   00000010 = CX register
   
Sample 5: 
ret = 01000011

Sample 6:
push dx  = 00100000  00000010
   00100000 = push
   00000011 = DX register
   
```
