# VonSim

VonSim is a simulator for the x8088 Intel processor in the spirit of the good old [MSX88](http://e-spacio.uned.es/fez/eserv/taee:congreso-1994-1055/S2C05.pdf), widely used for teaching in various spanish-speaking universities.

The goal of the project is to provide a replacement for the MSX88 in terms of instruction set syntax and semantics (so that current teaching slides, homework sets, etc., do not need to be modified) while providing an improved encoding of the instructions and more specially an updated user interface that is:

* more consistent with current programming practices: shorter write-compile-run cycles, integrated editor, clearer error messages.
* better suited for freshmen cs/ee students: a web app with a modern interface, no installs, no need to usethe command line.

In the same way that, for pedagogic reasons, the MSX88 deviated from the original 8088 instructions set, VonSim deviates from MSX88 in that it provides a user interface more focused on the *programming* aspect of using the simulator. In particular, it does away with the animations and simply provides a step-by-step visual debugger for assembly programs with lots of help.

You can demo the [beta version of vonsim](http://vonsim.github.io/).


The language reference can be accessed reading the [old msx88 manual](http://weblidi.info.unlp.edu.ar/catedras/organiza/descargas/Manual-MSX88.pdf), [instruction set](http://weblidi.info.unlp.edu.ar/catedras/organiza/descargas/set-instr-MSX88.PDF) and checking out the [samples folder](https://github.com/vonsim/vonsim/tree/master/assets/samples).

## Instruction set support

As of `2019/11/4`, all of the MSX88 instruction set is supported except for:
* DUP definitions
* IN and OUT instructions

## Roadmap

The project has finished its beta milestone. There are two more planed [milestones](https://github.com/vonsim/vonsim/milestones). We have no deadlines set:

1. **Beta version (finished)**: A fully working compiler/simulator (*without* support for devices or interruptions), with batch or instruction-by-instruction execution, and inspection of the program state.
2. **Devices (current)**: Adds support for communication with devices as per the MSX88 specification, as well as using both software and hardware interrupts.
3. **Polish**: Adds bells and whistles so that learning and programming is easier
  * Explanation of instruction semantics
  * Highlightning of instructions in memory, explanation of their encoding
  * Highlightning of defined variables in memory, explanation of their encoding
  * Cycle-by-cycle execution model (and UI to execute in that way). Every cycle an 8-bit word can be retrieved from memory. In this mode, you can observe how internal registers change, how data is fetched from memory, etc.
  * Highlightning/"scroll to" of memory cells/registers that change during both cycle-by-cycle and instruction-by-instruction execution.
  * File management for the editor (ie, save/load files to local/cloud storage)
  * Integrated instruction set cheat-sheet
  * Autocomplete for instructions (or at least keywords)


## Contributing
You can check the [development docs](doc/index.md) to get a general idea of the project structure and the [how to contribute page](CONTRIBUTING.md) to get your development environment set up.
