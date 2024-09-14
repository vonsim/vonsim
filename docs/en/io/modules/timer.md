# Timer

The _timer_ is a module that consists of two internal registers:

- the `CONT` register (address `10h` in the [I/O memory](./index)),
- and the `COMP` register (address `11h` in the [I/O memory](./index)).

When the [clock](../devices/clock) ticks, the `CONT` register increments by one. When the `CONT` register matches the `COMP` register, an interrupt is triggered via the `INT1` line of the [PIC](./pic).

It is based on Intel's 8253 PIT, but with some modifications to simplify its operation.
