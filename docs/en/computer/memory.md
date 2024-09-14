# Main Memory

The simulator has a main storage memory. This memory covers the address space from `0000h` to `FFFFh`. The lower half (`0000h` to `7FFFh`) is reserved for the user: programs and data are stored here. The upper half (`8000h` to `FFFFh`) is reserved for a very simple operating system (called _monitor_) that allows the user to interact with various devices (see [system calls](./cpu#system-calls)).

Note that, unlike the Intel 8088 processor, the main memory is not divided into segments. Therefore, the programmer must be careful not to exceed the memory limits or allow other programs to overwrite their code or data.
