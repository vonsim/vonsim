# VonSim docs

## Project structure

VonSim consists of three separate parts:

* A Compiler, that takes a String and produces Instructions and additional info ready to be loaded into the Simulator. This part depends only on the Simulator, and is found in package `vonsim.assembly`
* A Simulator, that loads a compiled program into memory and executes it. The simulator's code is in package `vonsim.simulator`
* A web app, that contains a code editor and an UI that shows the state of the simulator, and allows the user to write a program, compile it, load it into the simulator, and watch and control the execution. This part depends on both the Simulator and the Compiler. The app's code is in package `vonsim.webapp`.

All the code is written in Scala, but compiles to Javascript via the excelent [ScalaJS project.](https://www.scala-js.org/). ScalaJS supports all Scala constructs except some types of reflection, produces fast and compact code (though it's not very readable), and is really easy to use.


## Dependencies

The project is built via [SBT](http://www.scala-sbt.org/), the standard Scala build tool, using the [ScalaJS sbt plugin](http://www.scala-js.org/doc/sbt-plugin.html).

Tests are written with [ScalaTest for ScalaJS](http://www.scalatest.org/user_guide/using_scalajs) and run via sbt.

The webapp uses the [Ace Editor](https://ace.c9.io/) as a code editor and [Clusterize.js](https://github.com/NeXTs/Clusterize.js/) to display the memory as a big table. [Bootstrap](getbootstrap.com), [Bootstrap Languages](http://usrz.github.io/bootstrap-languages/) [IcoMoon](https://icomoon.io/) and [FontAwesome](http://fontawesome.io/) are also used for the UI.

The Compiler uses Scala's [Parser Combinators API](https://github.com/scala/scala-parser-combinators) to parse the assembly code.


## Compiler

The compiler has a 3 stage pipeline: the Lexer, Parser, and then the Compiler. First, the input code is split by lines and each line is processed independently by the Lexer and the Parser. Throughout the compiling stages, the result of the processing of a line is an Option[Error,Result].

Lines that produce an error are ignored in subsequent stages, ie, the compiler tries to fail as late as possible, so as to provide information about the parts of the program that do compile correctly.

The stages are as follows:
* First, a Lexer is applied to each line, converting each to a list of Tokens. The result of the Lexer is therefore a list of Option[LexerError,List[Token]]

* Then, the Parser is applied to each line (list of tokens), converting each to an Option[ParserError,parser.Instruction]. Those lines that previously produced a LexerError are converted to a ParserError directly. The result of the Parser is therefore a list of Option[ParserError,parser.Instruction].

* Finally, a Compiler is applied to the whole list of instructions.
  * First, a number of semantic checks are made:
    * The last line should be an END, and there should be only one END in the code.
    * All labels referenced must be defined (jump labels, variable lables, EQU labels)
    * There should be no repeated labels
    * There should be an ORG before the first executable instruction
  * Instructions that didn't pass the previous checks are converted to CompilerError, or generate a GlobalError as in when there isn't an END statement.
  * Instructions that did pass are converted to simulator.Instruction, and their memory address is computed.
  * Those lines that previously produced a ParserError or LexerError are ignored. The result of the Compiler is therefore a list of Option[CompilerError,simulator.Instruction], along with a Map[MemoryAddress,simulator.Instruction] that specifies how to load the program into the memory, a list of GlobalError and a list of Warnings (warning examples: no HLT found in the program).

## Simulator

The Simulator stores the state of the simulated computer and contains all the logic for executing programs, which are just lists of simulator.Instruction objects. The execution can be done instruction by instruction (already implemented) or cycle-by-cycle (not yet implemented). 

## Webapp

The webapp is coded in scalajs using scalatags to generate the HTML elements, along with regular css that uses a lot of flexbox containers.

The design could be improved a lot, but for now basically there is a HTMLUI abstract base class defined that forces child classes to expose a root:HTMLElement member.

Then, the MainUI is the base of the UI, and acts as a controller for most of its child components, centralizing event handling. The UI has two main parts: the editor and the mainboard.

The editor uses the Ace.js library to provide a nice editing experience, and display errors in the gutter. We chose Ace.js because along with CodeMirror and Monaco, it seems the most mature project, and it already had a scalajs facade. The editor has a timer event that periodically compiles the code to get information about each line, and displays that in the gutter, along with an error icon for incorrectly compiled lines.

The mainboard has several child components: the CPU, the Memory, and in the future the IOMemory and Devices. Each of these devices is responsible for updating themselves when there is a Simulator event. There are two types of updates possible: full updates (re-read all info from the Simulator) or instruction-updates (look at what an instruction does and reproduce that change in the UI).
