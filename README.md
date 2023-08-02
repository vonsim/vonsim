<a href="https://vonsim.github.io/preview" target="_blank" rel="noopener">
  <img src="./assets/github_banner.png" alt="VonSim - A 8088-like Assembly Simulator" />
</a>

<div align="center">
  <br/>
  <h3><a href="https://vonsim.github.io/preview" target="_blank" rel="noopener"><strong>Try it now</strong></a></h3>
  <br/>
  <img src="./assets/demo.gif" alt="Demo" />
  <br/>
</div>

## About this project

VonSim was made entirely in [TypeScript](https://www.typescriptlang.org/), a superset of JavaScript that adds type-checking and auto-completion. Also, the project is divided in multiple packages, each one with its own `package.json` ([learn more](https://turbo.build/repo/docs/core-concepts/monorepos) about monorepos).

To get started, you'll need [Node.js v18](https://nodejs.org/) and [pnpm v8](https://pnpm.io). Once you have them installed, you can run the following inside the repo:

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

Finally, the [documentation](https://vonsim.github.io/docs/) is inside [`@vonsim/docs`](./docs/).

## To-do list

- [ ] Add ✨ animations ✨
  - [x] Rethink the simulator
  - [ ] Add animated diagrams
  - [ ] [Support mobile](https://github.com/prc5/react-zoom-pan-pinch)
- [ ] Add usage documentation (maybe with LaTeX or [Typst](https://typst.app/))
- [ ] Add internal documentation (maybe with [TypeDoc](https://typedoc.org/) or [documentation.js](https://documentation.js.org/))
- [ ] Add Printer w/CDMA
- [ ] Dark mode everywhere
- [ ] Perf measurements
- [ ] Add advanced filesave support
- [ ] Support indirect access with offset (maybe revisit the codification)
- [ ] Support calling a custom interrupt with `INT`
- [ ] Support adding an offset to a memory label

  ```asm
  letras db "abcd"
  mov al, letras     ; copies "a"
  mov al, letras + 1 ; copies "b"
  mov al, letras + 2 ; copies "c"
  ```
