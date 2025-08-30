<p align="center">
  <img src="app/public/favicon.svg" height="128px" align="center" alt="VonSim logo" />
  <h1 align="center">VonSim</h1>
  <p align="center">
    ✨ <a href="https://vonsim.github.io">https://vonsim.github.io</a> ✨
    <br/>
    A 8088-like Assembly Simulator
  </p>
</p>

<br/>

# VonSim

VonSim is a tool designed for teaching and learning computer architecture. It consists of an environment for developing programs in assembly language and a simulator for them.

It is based on the Intel 8088 processor and features:

- four 16-bit general-purpose registers;
- a main memory of 32 kB;
- a 16-bit address bus and an 8-bit data bus;
- software interrupts (such as keyboard input and screen output);
- hardware interrupts with a PIC (Programmable Interrupt Controller);
- multiple devices: clock, switches, LEDs, and a Centronics printer.

These devices are inspired by their counterparts specified in Intel's iAPX 88 (or 8088 family). These are a set of devices designed by Intel to work seamlessly with the 8088 processor. More details can be found in the [iAPX 88 User's Manual (1981)](http://www.bitsavers.org/components/intel/8086/1981_iAPX_86_88_Users_Manual.pdf).

> [!WARNING]
> This simulator is not intended to be a faithful emulator of the 8088. On the contrary, it aims to be a tool for teaching computer architecture. Therefore, multiple simplifications have been made compared to the 8088 that would make it difficult to use in a real environment. Likewise, the instruction set is much smaller than that of the 8088, and its encoding is simpler.

## How to contribute

VonSim is coded entirely in [TypeScript](https://www.typescriptlang.org/), a superset of JavaScript that adds type-checking and auto-completion. Also, the project is divided in multiple packages, each one with its own `package.json` ([learn more](https://turbo.build/repo/docs/core-concepts/monorepos) about monorepos).

To get started, you'll need [Node.js v22](https://nodejs.org/) and [pnpm v10](https://pnpm.io). Once you have them installed, you can run the following inside the repo:

```bash
$ pnpm install  # only the first time, install the dependencies
$ pnpm dev      # start the app dev server
$ pnpm docs:dev # start the docs dev server
$ pnpm build    # build for production
```

These are the packages inside the repo, all of them with their own `README.md` where you can learn more:

- [`@vonsim/assembler`](./packages/assembler/): All the logic to assemble a program from plain text assembly.
- [`@vonsim/simulator`](./packages/simulator/): All the logic run an assembled program.
- [`@vonsim/app`](./app/): The web app itself. It has all the UI and uses the simulator to run the program.

Also, there some support packages that are used by the packages above:

- [`@vonsim/common`](./packages/common/): Some common utilities.
- [`eslint-config-vonsim`](./packages/eslint-config-vonsim/): ESLint configuration for this project.
- [`@vonsim/scripts`](./packages/scripts/): Scripts for development and building.
- [`@vonsim/tsconfig`](./packages/tsconfig/): The TypeScript configuration for this project.

Finally, the [documentation](https://vonsim.github.io/en/) is inside [`@vonsim/docs`](./docs/).

### Visual Studio Code Extension

When using [Visual Studio Code](https://code.visualstudio.com/), you can use the [recommended extensions](./.vscode/extensions.json) to get the best experience. Some extensions might have trouble finding the `main.css` file for auto-completion and linting. This can be solved by creating a `.vscode/settings.json` file with the following content:

```json
{
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "tailwindCSS.experimental.configFile": "./app/src/styles/main.css"
}
```

## To-do list

- Welcome tour (with mentions to downloadable PWA)
- Add Printer w/CDMA
- Add Printer w/USART
- Add I/O modules for screen and keyboard

## License

This project is licensed under the [GNU Affero General Public License v3.0](./LICENSE) license.

&copy; 2017-present Facundo Quiroga, Manuel Bustos Berrondo y Juan Martín Seery ([III-LIDI](https://weblidi.info.unlp.edu.ar/), [Facultad de Informática](https://info.unlp.edu.ar/), [UNLP](https://unlp.edu.ar/)).
