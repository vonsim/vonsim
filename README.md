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

### Notes for developers

When using [Visual Studio Code](https://code.visualstudio.com/), you can use the [recommended extensions](./.vscode/extensions.json) to get the best experience. Some extensions might have trouble finding the `tailwind.config.ts` file for auto-completion and linting. This can be solved by creating a `.vscode/settings.json` file with the following content:

```json
{
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "tailwindCSS.experimental.configFile": "./app/tailwind.config.ts"
}
```

## To-do list

- Welcome tour (with mentions to downloadable PWA)
- Add Printer w/CDMA
- Add Printer w/USART
- Add I/O modules for screen and keyboard
- Implement indirect access with offset

## License

This project is licensed under the [ GNU Affero General Public License v3.0](./LICENSE) license.

&copy; 2017-present Facundo Quiroga, Manuel Bustos Berrondo y Juan Martín Seery ([III-LIDI](https://weblidi.info.unlp.edu.ar/), [Facultad de Informática](https://info.unlp.edu.ar/), [UNLP](https://unlp.edu.ar/)).
