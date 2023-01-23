# Contributing

- [Contributing](#contributing)
  - [About this project](#about-this-project)
    - [The compiler](#the-compiler)
    - [The simulator](#the-simulator)
    - [The UI](#the-ui)
  - [Setup the development environment](#setup-the-development-environment)
  - [Deployment](#deployment)

## About this project

Welcome to the VonSim source code! Here is some key info about the project for anyone wanting to contribute.

First of all, the entirety of the simulator is written in [**TypeScript**](https://www.typescriptlang.org/): it's JavaScript with types. It allows you to hover over any variable and know its type, or any function and know what it needs and what it returns. Also, when converting to JavaScript, it will tell you if there is any type mismatch, preventing _lots_ of possible bugs.

At its core, VonSim has three parts: the `compiler`, the `simulator` and the `ui`. They are all (kind of) independent of each other.

### The compiler

Under `src/compiler/index.ts` you'll find a function that recieves some text and returns some JSON: that's the compiler. Here, you'll find all the code that interprets the source assembly code and converts it into a more computer-friendly form.

It has three parts: a lexer, which converts text to tokens; a parser, which converts tokens to statements; and an analyzer, which process these statements and where most of the errors are catched.

You'll find pretty much every where the [`ts-pattern`](https://github.com/gvergnaud/ts-pattern) library. It lets us use pattern matching, like in Rust or Scala, since JavaScript doesn't have native pattern matching [yet](https://github.com/tc39/proposal-pattern-matching).

### The simulator

Once the code has been compiled, it need to be executed. Under `src/simulator` there is all the logic related to running a program. The state of the simulator is managed with [zustand](https://github.com/pmndrs/zustand), a simple library that will later allows us to react to changes.

Interesting bits of the simulator:

- `program.ts` has `loadProgram`, which load the program return by the compiler into the simulator;
- `execute.ts` has the logic behind each instruction;
- `devices/*` has each one of the devices.

### The UI

Given the abstractions made before, this is the "dumb" part of the app. Here you'll find, mostly, [**React**](https://reactjs.org/) components. If you want to make any change that involves anything visual, you should know the basics of React, hooks and JSX.

Here, the connection to the simulator is made via two ways.

- One is the `useSimulator` hook: components can use it to listen to changes of state (e.g. register values, LEDs on/off).
- The other is `src/ui/runner.ts`, which makes the simulator _alive_ — it has control over the clocks an execution cycles. It's here and not inside `simulator` because it mostly handles interactions with the user.

Furthermore, for the styles we use [**Tailwind CSS**](https://tailwindcss.com/), a utility-first CSS framework. It's similar to doing inline CSS, but not quite. [Here is a good reading](https://tailwindcss.com/docs/utility-first) in case you've never used Tailwind.

Finally, all the JavaScript and CSS files are generated with [Vite](https://vitejs.dev/). You shouldn't worry to much about it — just run `pnpm dev` and `pnpm build`.

## Setup the development environment

You'll need [Node.js v18](https://nodejs.org/) and [pnpm v7](https://pnpm.io). Once you have them installed, you can run the following inside the repo:

```bash
$ pnpm install # only the first time, install the dependencies
$ pnpm dev     # starts the development server
```

The documentation is under `docs/`, and you can start the development documentation server by running

```bash
$ pnpm docs:dev
```

## Deployment

Right now, we are depolying to Vercel. We have a custom build script to merge the app and the documentation under the same domain. Because of that, when setting up the Vercel project, make sure to set its preset to **Other** ([learn how to change it](https://vercel.com/docs/concepts/deployments/configure-a-build#build-&-development-settings)).
