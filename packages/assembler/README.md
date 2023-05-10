# `@vonsim/assembler`

This package contains the assembler: a tool that converts a program written in plain text to a list of instructions that can be executed by the simulator.

First, the assembler reads the program from a file and converts it to a list of tokens. That's the Lexer.

Then, it parses the list of tokens into a list of _statements_. Each statement can be:

- An origin change (`ORG`)
- The end of the program (`END`)
- A data directive (`DB`, `DW`, `EQU`)
- An instruction.

Now, since the program may have labels that can be referenced anywhere, the parser needs to pass multiple times through the list of statements. It will:

1. resolve the labels and assign them a type (constant, variable, instruction);
2. it will validate the statements and compute the size of each one;
3. it will compute the address of each label and statement;
4. it will compute each memory address and immediate value used as an operand.

More reasoning about that can be found inside `src/statements/instructions/statement.ts` and `src/global-store.ts`.
