
# Assembly Language

The assembly language (or _assembly_) used by the simulator is written as follows:

```vonsim
; This is a comment
; It starts with a semicolon and ends at the end of the line

; All directives and mnemonics can be written in uppercase
; or lowercase (ORG, org, Org, ...).

org 1000h ; The ORG directive indicates the memory address where the
          ; program begins. In this case, 1000h.

db 24     ; DB is the directive to write a byte in memory.
          ; In this case, the byte 24 is written at address 1000h.

db 24h    ; Hexadecimal numbers are written with an h suffix.
          ; In this case, the byte 24h (36) is written at address 1001h.

db 10b    ; Binary numbers are written with a b suffix.
          ; In this case, the byte 10b (2) is written at address 1002h.

db '0'    ; Characters are written in single quotes.
          ; In this case, the byte 30h (48) is written at address 1003h.

dw 5      ; DW is the directive to write a word (2 bytes) in memory.
          ; In this case, the word 5 is written at address 1004h.
          ; The byte 05h remains at address 1004h and 00h at 1005h.

etq dw 7  ; 'etq' is a label. It is used to reference a memory address.

dw ?      ; The symbol ? indicates that the value of the word is unknown. In
          ; this case, nothing is written at addresses 1008h and 1009h.

str db "Hello, World!" ; Text strings can also be written in ASCII,
                      ; (H=48h, o=6Fh, l=6Ch, a=61h, ...). In this case, the
                      ; string will be stored starting from address 100Ah.
                      ; 48h will be at 100Ah, 6Fh at 100Bh, 6Ch at 100Ch, etc.
                      ; Strings can only be written with the DB directive.

db 1, 2, 3, 4 ; Multiple bytes can be written on the same line.

cinco equ 5 ; EQU is the equivalence directive. It is used to define
            ; constants. In this case, the constant 'cinco' is defined with
            ; the value 5. No memory is reserved for this constant.

org 2000h ; All programs start, by convention, at address 2000h.

mov al, bl ; Instructions are written with mnemonics. In this case, it
           ; copies the content of register BL into register AL.
           ; Operands are separated by commas.

inst: mov ax, 5 ; Labels can be used to reference an instruction. The label
                ; 'inst' can be used to reference the memory location of this MOV.

jmp inst        ; Here it jumps to the address 'inst'.

END

; The END directive indicates the end of the file, not the end of the program.
; It indicates that the assembler should not continue reading the file.
; The main program may or may not end with an END, but
; it should end with a HLT or INT 0.
```

## Operands

Instructions can receive various types of operands.

### Registers

The user-accessible 16-bit registers are `AX`, `BX`, `CX`, `DX`, and `SP`. The user-accessible 8-bit registers are `AL`, `AH`, `BL`, `BH`, `CL`, `CH`, `DL`, and `DH`. When using any of these registers, the assembler can automatically infer whether it will be an 8-bit or 16-bit operation.

### Memory Addresses

Memory addresses can be expressed in several ways:

```vonsim
[1234h] ; Direct memory address
[bx]    ; Indirect memory address
```

::: tip Note
The indirect addressing mode with displacement has not yet been implemented.
:::

In the first case, it accesses the memory address `1234h` directly. In the second case, it accesses the memory address stored in `BX`. For the indirect addressing mode, only the `BX` register can be used. Note that the assembler cannot always infer whether the operation will be 8 or 16 bits. For example:

```vonsim
mov [bx], 6h ; Is it intended to write 06h or 0006h?
```

In this case, the size of the operation must be specified:

```vonsim
mov byte ptr [bx], 6h ; Writes 06h
mov word ptr [bx], 6h ; Writes 0006h
```

A special case of memory addressing is when a label is used that references a `DB` or `DW`:

```vonsim
org 1000h
foo db ?

org 2000h
mov foo, 6h
; Equivalent to
; mov byte ptr [1000h], 6h
mov foo+1, 6h
; Equivalent to
; mov byte ptr [1001h], 6h
```

In this case, the label `foo` refers to the memory address `1000h`. Therefore, `foo+1` refers to the memory address `1001h`. This will work as long as the operand is of the form `label +/- constant`. For example, `foo+bx` will not work, but `foo - 6*8 + offset otra_etiqueta` will (though it is not recommended; it is advisable to use `label +/- number` for better readability and understanding of the code).

### Immediate Values

Immediate values are values that can be determined at the time of assembling the program. For example, in `mov ax, 5`, it is known that the number `5` should be copied into `AX`, so the number `5` is an immediate value that is stored in memory. In contrast, in `mov ax, [bx]`, it is not known what value should be copied into `AX`, as it depends on the content of `BX`. Therefore, `[bx]` is not an immediate value.

These immediate values are numbers that can be written as follows:

```vonsim
24      ; Decimal
18h     ; Hexadecimal
11000b  ; Binary
'0'     ; ASCII Character

0FFh    ; If the number starts with a letter,
        ; a 0 must be written before.

13 + 8h       ; Arithmetic operations
13 * (7 - 2)
'A' + 5

cinco   ; Constants defined with the EQU directive and labels to instructions
offset etq ; Memory address of the label 'etq' (which defines a DB or DW)

offset str + 4 ; Memory address of the string 'str' + 4
```

Both characters (`'a'`) and text strings (`"text"`) are converted to their ASCII value according to the [ASCII table used by VonSim](../reference/ascii).

Note that there is a difference between labels of a `DB` or `DW` directive and labels of an instruction or `EQU`. The latter can be used as a textual replacement for their values. That is:

```vonsim
org 1000h
str db "Hello, World!"
str_fin db ?

str_fin db offset str_fin - offset str ; == 100Ch - 1000h == Ch == 12

; ---

org 2000h
mov ax, str_fin ; == mov ax, 12
loop: jmp loop  ; == jmp 2004h
end
```

On the other hand, labels of a `DB` or `DW` directive can only be used as a textual replacement for their values when the `offset` operator is added (as noted in the previous example). When they appear without the `offset` operator, they refer to the "value stored at the memory address of the label," as indicated in ["Memory Addresses"](#memory-addresses).
