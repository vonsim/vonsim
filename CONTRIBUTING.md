# Contributing

- [Contributing](#contributing)
  - [About this project](#about-this-project)
    - [The compiler](#the-compiler)
    - [The simulator](#the-simulator)
    - [The UI](#the-ui)
  - [Setup the development environment](#setup-the-development-environment)

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
- `runner.ts` has the event loop which executes each instruction;
- `devices/*` has each one of the devices.

There is more info about the how each instruction is executed inside `runner.ts`.

### The UI

Given the abstractions made before, this is the "dumb" part of the app. Here you'll find, mostly, [**React**](https://reactjs.org/) components. If you want to make any change that involves anything visual, you should know the basics of React, hooks and JSX.

These components can listen to changes in the simulator state by calling `useSimulator`.

Furthermore, for the styles we use [**Tailwind CSS**](https://tailwindcss.com/), a utility-first CSS framework. It's similar to doing inline CSS, but not quite. [Here is a good reading](https://tailwindcss.com/docs/utility-first) in case you've never used Tailwind.

Finally, all the JavaScript and CSS files are generated with [Vite](https://vitejs.dev/). You shouldn't worry to much about it — just run `pnpm dev` and `pnpm build`.

## Setup the development environment

You'll need [Node.js v18](https://nodejs.org/) and [pnpm v7](https://pnpm.io). Once you have them installed, you can run the following inside the repo:

```bash
$ pnpm install # only the first time, install the dependencies
$ pnpm dev     # starts the development server
```