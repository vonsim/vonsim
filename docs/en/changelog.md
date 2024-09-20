# Release Notes

### September 20, 2024

- The [`TEST`](./computer/instructions/test) instruction has been added.
- Indirect memory access with offset has been added. For example, `mov al, [bx+8]`.

### July 31, 2024

The method for adding devices has been changed. Users no longer choose configurations but can select devices arbitrarily.

### September 10, 2023

The interrupt vector addresses used by the system are now protected. If a user attempts to write to these addresses, an error will occur.

### August 22, 2023

Launch of the new version of VonSim! Compared to the previous version, this release includes:

- animations for microinstructions;
- support for mobile phones and tablets;
- documentation accessible from within the application;
- offline mode (PWA);
- more advanced text editor, with support for opening and saving files;

Many internal changes were made to VonSim's architecture. The most significant for users are:

- smarter assembler that detects syntax and semantic errors, providing clearer and more specific error messages;
- support for direct memory access, such as `mov al, [1234h]`;
- support for character literals, such as `cmp al, '0'`;

### 2019

Input/output functionality was added to the simulator.

### 2017

First version of VonSim. Currently stored in the [`legacy`](https://github.com/vonsim/vonsim/tree/legacy) branch. Compared to MSX88, this version:

- is web-based, requiring no installation and is cross-platform;
- has a more modern graphical interface;
- features an integrated text editor with syntax highlighting.

### 1988

Rubén de Diego Martínez releases the MSX88 simulator for the Universidad Politécnica de Madrid.
