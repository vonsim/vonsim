# CPU

The processor used in this simulation environment is based on the **Intel 8088**. You can see more about its original architecture in its [specification sheet](https://www.ceibo.com/eng/datasheets/Intel-8088-Data-Sheet.pdf).

It is mainly characterized by its ability to perform 8 and 16-bit operations, with the latter being of the _little-endian_ type.

## Ports

The processor has the following ports:

- 16 bits of memory addresses (address bus, with its respective _buffer_ `MAR`)
- 8 bits of data (data bus, with its respective _buffer_ `MBR`)
- 1 bit for the read signal (`RD`)
- 1 bit for the write signal (`WR`)
- 1 bit to indicate if the write is to [main memory](./memory) or to an [input/output](../io/modules/index) module (`IO/M`, with `1` for I/O)
- 1 bit for interrupt request (`INTR`)
- 1 bit for interrupt acknowledge signal (`INTA`)

## Registers

The processor has four 16-bit general-purpose registers: `AX`, `BX`, `CX`, and `DX`. These can also be partially accessed as 8-bit registers: `AH`, `AL`, `BH`, `BL`, `CH`, `CL`, `DH`, and `DL`.

Additionally, for the operation of the [stack](#stack), it has a 16-bit `SP` (stack pointer) register. Also, there is a 16-bit `BP` (base pointer) register which can be used for indirect addressing. These registers can be accessed by the user.

Among the internal registers that cannot be accessed by the user, there is the [`FLAGS`](#flags) register (16 bits), the `IP` (instruction pointer, 16 bits) that stores the address of the next instruction to be executed, the `IR` (instruction register, 8 bits) that stores the byte of the instruction being analyzed/decoded at a given moment, and the `MAR` (memory address register, 16 bits) that stores the memory address to be propagated through the address bus, and the `MBR` (memory buffer register, 8 bits) that stores the byte to be propagated or received through the data bus.

There are also some internal registers that serve as intermediaries to execute instructions, such as `ri` to store a temporary address, `id` to store temporary data, or `left`, `right`, and `result` that store the operands and result of an arithmetic or logical operation respectively.

## ALU

The ALU (Arithmetic Logic Unit) allows performing 8 and 16-bit arithmetic and logical operations. The available operations are: [`ADD`](./instructions/add), [`ADC`](./instructions/adc), [`INC`](./instructions/inc), [`SUB`](./instructions/sub), [`SBB`](./instructions/sbb), [`DEC`](./instructions/dec), [`NEG`](./instructions/neg), [`NOT`](./instructions/not), [`AND`](./instructions/and), and [`OR`](./instructions/or). All these operations modify the `FLAGS` register.

### Flags

The `FLAGS` register is a 16-bit register that contains the flags shown in the following table. This register is not directly accessible by the user, but can be modified by ALU operations and conditional jumps can be made based on its values.

| Bit # | Abbreviation | Description    |
| :---: | :----------: | :------------- |
|   0   |     `CF`     | Carry flag     |
|   6   |     `ZF`     | Zero flag      |
|   7   |     `SF`     | Sign flag      |
|   9   |     `IF`     | Interrupt flag |
|  11   |     `OF`     | Overflow flag  |

The rest of the bits are reserved / not used.

## Stack

The processor implements the stack as a storage method accessible by the user and by the CPU itself for its correct operation. This is a Last In, First Out (LIFO) style, meaning the last element to enter is the first to exit. The stack is located in the main memory, starting at its highest address (`8000h`) and growing towards lower addresses (`7FFEh`, `7FFCh`, etc.). The top of the stack is stored in the `SP` register. All stack elements are 16 bits.

## Subroutines

The processor also implements subroutines. These are small code fragments that can be called from any part of the program. For this, the [`CALL`](./instructions/call) instruction is used. This instruction stores the `IP` in the [stack](#stack), and then jumps to the address of the subroutine, modifying the `IP` so that it points to the first instruction of the subroutine. To return from the subroutine, the [`RET`](./instructions/ret) instruction is used, which pops the address previously pushed by `CALL` and restores the `IP`, returning to the execution point after the subroutine call.

Example of a subroutine:

```vonsim
      org 3000h
      ; sum ax, bx and cx
sum3: add ax, bx
      add ax, cx
      ret

      org 2000h
      mov ax, 1
      mov bx, 2
      mov cx, 3
      call sum3
      ; ax = 6
      hlt
      end
```

## Interrupts

The processor supports hardware and software interrupts, which can be issued by the [PIC](../io/modules/pic) or by the [`INT`](./instructions/int) instruction respectively. To execute hardware interrupts, the processor must be enabled to receive interrupts. That is, `IF=1` (the interrupt flag activated).

Both interrupts must provide an interrupt number. In the case of software interrupts, this is given by the operand of the `INT` instruction ([see more](./instructions/int)). In the case of hardware interrupts, this is given by the PIC ([see how it's obtained](../io/modules/pic#operation)). The interrupt number must be a number between `0` and `255`.

Once interrupted, the processor will execute the interrupt routine associated with that interrupt number. The starting address of this routine will be stored in the interrupt vector. This vector occupies cells `0000h` to `03FFh` of the main memory, and each vector element is 4 bytes long -- the first element is at `0h`, the second at `4h`, the third at `8h`, and so on. Each element corresponds to the start address of the interrupt routine.

Specifically, the processor:

1. obtains the interrupt number (0-255),
2. pushes the [`FLAGS`](#flags) register,
3. disables interrupts (`IF=0`),
4. pushes the `IP` register,
5. obtains the address of the interrupt routine from the interrupt vector,
6. modifies the `IP` to point to the address of the interrupt routine.

And thus begins to execute the interrupt routine. These have the same format as a [subroutine](#subroutines) except that they end in [`IRET`](./instructions/iret) instead of [`RET`](./instructions/ret).

### System Calls

The simulator allows system calls or _syscalls_. In the simulator, these calls are made identically to interrupts. Thus, to make a _syscall_, it's enough to interrupt the CPU with the corresponding interrupt number. These numbers are:

- `INT 0`: terminates the program execution, equivalent to the [`HLT`](./instructions/hlt) instruction;
- `INT 3`: starts debugging mode (_breakpoint_);
- `INT 6`: reads a character from the [keyboard](../io/devices/keyboard);
- `INT 7`: writes a string of characters to the [screen](../io/devices/screen).

The interrupt vector addresses associated with these numbers are protected by the system, preventing the user from modifying them.

The content of these routines is stored in the [system monitor](./memory) at addresses `A000h`, `A300h`, `A600h`, and `A700h` respectively.
