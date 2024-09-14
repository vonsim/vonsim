# PIC

The _programmable interrupt controller_ (PIC) is a module located between devices that issue [interrupts](../../computer/cpu#interrupts) and the CPU. Since the CPU has only one input line, this device is responsible for receiving interrupts from multiple devices and multiplexing their requests into this single line.

It is based on Intel's 8259A PIC, but with some modifications to simplify its operation.

## Lines

The PIC has 8 lines: from `INT0` to `INT7` (not all are used). Each line has an associated 8-bit register in the I/O memory. The `INT0` line is mapped to address `24h`, the `INT1` line to address `25h`, and so on until `INT7`, which is mapped to address `2Bh`. In each of these registers, the interrupt number corresponding to each line is stored.

When one of the modules/devices wants to interrupt the CPU, the interrupt number the PIC will send is the one stored in the register corresponding to the line that was triggered, thus decoupling the interrupt number from the line number.

The lines are connected to the following devices:

|  Line  | Module/Device             |
| :----: | :------------------------ |
| `INT0` | [F10 Key](../devices/f10) |
| `INT1` | [Timer](./timer)          |
| `INT2` | [Handshake](./handshake)  |
| `INT3` | --                        |
| `INT4` | --                        |
| `INT5` | --                        |
| `INT6` | --                        |
| `INT7` | --                        |

## Control

The PIC has three additional control registers. In these registers, each bit corresponds to an interrupt line: the least significant bit corresponds to the `INT0` line, and the most significant bit corresponds to the `INT7` line.

The `IMR` or _interrupt mask register_ (address `21h` in the [I/O memory](./index)) is used to mask (or "disable") interrupt lines. If the bit corresponding to a line is set to `1`, that line is masked, and its interrupt will not be sent to the CPU. If the bit is set to `0`, the line is enabled, and its interrupt will be sent to the CPU. This register can be modified by the CPU.

The `IRR` or _interrupt request register_ (address `22h` in the [I/O memory](./index)) indicates pending interrupts. If the bit corresponding to a line is `1`, that line has a pending interrupt. If the bit is `0`, there are no pending interrupts. This register is modified by the PIC and is read-only for the CPU.

The `ISR` or _in-service register_ (address `23h` in the [I/O memory](./index)) indicates which interrupt is currently being serviced. If the bit corresponding to a line is `1`, that line is being serviced. If the bit is `0`, it is not being serviced. This register is modified by the PIC and is read-only for the CPU.

## Operation

When an interrupt line is triggered, the PIC queues it in the `IRR` register. If the line is not masked and there is no other interrupt being serviced (i.e., `ISR = 00h`), the PIC sends the interrupt signal to the CPU by activating the `INTR` line.

When the CPU is ready to handle the interrupt, it initiates the _interrupt acknowledge_ cycle.

1. The CPU responds to the `INTR` by sending a pulse on the `INTA` line.
2. Upon receiving the signal, the PIC marks the line as _in-service_ in the `ISR` register and removes it from the queue in the `IRR` register.
3. The PIC sends the interrupt number corresponding to the serviced line over the data bus.
4. The CPU sends another pulse on the `INTA` line.
5. The PIC deactivates the `INTR` line.

To inform the PIC that the interrupt routine has finished, the CPU writes the end-of-interrupt byte or `EOI`, which is coincidentally `20h`, to the `20h` address in the [I/O memory](./index). Upon reading this byte, the PIC unmarks the line as _in-service_ in the `ISR` register. If there are pending interrupts, the PIC activates the `INTR` line again, repeating the process.

::: tip Note
This PIC does not support nested interrupts. If an interrupt occurs while another is being serviced, the second one will be queued in the `IRR` register and will be handled once the first one finishes, regardless of its priority.
:::

### Priorities

When there is more than one pending interrupt, the PIC services the one with the highest priority first. The priority of each line is determined by its interrupt number. Lines with lower interrupt numbers have higher priority. For example, the `INT0` line has higher priority than the `INT1` line.
