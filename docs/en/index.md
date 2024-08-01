---
title: What is VonSim?
---

# {{ $frontmatter.title }}

VonSim is a tool designed for teaching and learning computer architecture and organization. It consists of an environment for developing programs in [assembly language](./computer/assembly) and a simulator for them.

It is [based](./computer/cpu) on the Intel 8088 processor and features:

- four 16-bit general-purpose registers;
- a [main memory](./computer/memory) of 32 kB;
- a 16-bit address bus and an 8-bit data bus;
- software interrupts (such as keyboard input and screen output);
- hardware interrupts with a [PIC](./io/modules/pic) (Programmable Interrupt Controller);
- multiple [devices](./io/devices/index): clock, switches, LEDs, and a Centronics printer.

These devices are inspired by their counterparts specified in Intel's iAPX 88 (or 8088 family). These are a set of devices designed by Intel to work seamlessly with the 8088 processor. More details can be found in the [iAPX 88 User's Manual (1981)](http://www.bitsavers.org/components/intel/8086/1981_iAPX_86_88_Users_Manual.pdf).

::: warning Simplifications
This simulator is not intended to be a faithful emulator of the 8088. On the contrary, it aims to be a tool for teaching computer architecture. Therefore, multiple simplifications have been made compared to the 8088 that would make it difficult to use in a real environment. Likewise, the instruction set is much smaller than that of the 8088, and its encoding is simpler.
:::

## Credits

This simulator was created by

- [Facundo Quiroga](http://facundoq.github.io/),
- [Manuel Bustos Berrondo](https://github.com/manuelbb)
- and [Juan Martín Seery](https://juanm04.com),

with assistance from

- [Andoni Zubimendi](https://github.com/AndoniZubimendi)
- and [César Estrebou](https://github.com/cesarares)

for the courses of

- [Computer Organization](http://weblidi.info.unlp.edu.ar/catedras/organiza/),
- [Computer Architecture](http://weblidi.info.unlp.edu.ar/catedras/arquitecturaP2003/),
- [Concepts of Computer Architecture](http://weblidi.info.unlp.edu.ar/catedras/ConArqCom/),

among others at the [Faculty of Computer Science](https://info.unlp.edu.ar/) of the [National University of La Plata](https://www.unlp.edu.ar/).

### Acknowledgments

VonSim is based on the previous work of Rubén de Diego Martínez for the Polytechnic University of Madrid. The original simulator was called MSX88 and was developed in 1988. Some references:

- [MSX88 User Manual (v3.0)](/msx88/Manual-MSX88-v3.pdf)
- [MSX88 User Manual (v4.0)](/msx88/Manual-MSX88-v4.pdf)
- [MSX88 Instruction Set](/msx88/set-instr-MSX88.PDF)
- [MSX88 Presentation Paper](/msx88/msx88-original-paper.pdf)
- [MSX88 v3.1 (with DOSBox)](/msx88/MSX88Portable.zip)
- [MSX88 v4.0 (ported)](/msx88/msx88_2017.rar){target="_self"}
- [Notes on interrupts](/msx88/apunte-interrupciones.pdf)

### License

All content is licensed under the [GNU Affero General Public License v3.0](https://github.com/vonsim/vonsim/blob/main/LICENSE) and its source code is available on [GitHub](https://github.com/vonsim/vonsim).

Copyright &copy; 2017-present Facundo Quiroga, Manuel Bustos Berrondo, and Juan Martín Seery ([III-LIDI](https://weblidi.info.unlp.edu.ar/), [Faculty of Computer Science](https://info.unlp.edu.ar/), [UNLP](https://unlp.edu.ar/)).

This documentation is under the [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) license, unless otherwise stated.
