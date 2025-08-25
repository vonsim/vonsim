# `@vonsim/assembler`

This package contains the assembler: a tool that converts a program written in plain text to a list of instructions that can be executed by the simulator. You can read more about the assembly language [here](https://vonsim.github.io/en/computer/assembly).

## Usage

To assemble a program, just call `assemble`:

```ts
import { assemble } from "@vonsim/assembler";

const program = `
  org 2000h
  mov al, 1
  add al, 2
  hlt
  end
`;

const result = assemble(program);

// This result will be either an error
type AssembleResultError = {
  success: false;
  errors: AssemblerError[];
};

// or a list of Data and Instructions statements
type AssembleResultSuccess = {
  success: true;
  program: {
    data: Data[];
    instructions: InstructionStatement[];
  },
  metadata: Metadata
};
```

You can read more about [`Data`](./src/statements/data-directive/types/data.ts) and [`Instruction`](./src/statements/instructions/statement.ts) statements in their respective files.

## How it works

First, the assembler reads the program from a file and converts it to a list of tokens. That's the [Lexer](./src/lexer/scanner.ts).

Then, it [parses](./src/parser.ts) the list of tokens into a list of _statements_. Each statement can be:

- An origin change (`ORG`)
- The end of the program (`END`)
- A data directive (`DB`, `DW`, `EQU`)
- An instruction.

Now, since the program may have labels that can be referenced anywhere, the parser needs to pass multiple times through the list of statements. It will:

1. resolve the labels and assign them a type (constant, variable, instruction);
2. it will validate the statements and compute the size of each one;
3. it will compute the address of each label and statement;
4. it will compute each memory address and immediate value used as an operand.

More reasoning about that can be found inside

- [`src/statements/data-directive/statement.ts`](./src/statements/data-directive/statement.ts),
- [`src/statements/instructions/statement.ts`](./src/statements/instructions/statement.ts),
- and [`src/global-store.ts`](./src/global-store.ts).

Finally, if everything is valid, the assembler will return the list of statements, which can then be converted to a list of instructions and data to be loaded into the simulator's memory. Also, it will return some extra metadata given by the user -- hints for the simulator. These take the form of comments in the assembly code, like this:

```asm
;; devices = false
```

More about that in [`src/metadata.ts`](./src/metadata.ts).
