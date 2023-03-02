# Contributing

- [Contributing](#contributing)
  - [About this project](#about-this-project)
    - [The compiler](#the-compiler)
    - [The simulator](#the-simulator)
    - [The UI](#the-ui)
    - [Internationalization](#internationalization)
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

Once the code has been compiled, it need to be executed. Under `src/simulator` there is all the logic related to running a program. The state of the simulator is encapsulated in a class (`Simulator`), with multiple subclasses representing the CPU, the memory, all the devices and the links between them.

You'll have informatation about the inner workings as comments, specially in `src/simulator/index.ts`.

### The UI

Given the abstractions made before, this is the "dumb" part of the app. Here you'll find, mostly, [**React**](https://reactjs.org/) components. If you want to make any change that involves anything visual, you should know the basics of React, hooks and JSX.

Here, the connection to the simulator is made inside `src/ui/lib/simulator.ts`. You'll find useful information there. Every component listens to changes via the `useSimulator` hook. Also, there are some user settings (see `src/ui/lib/settings.ts`) saved in Local Storage.

Furthermore, for the styles we use [**Tailwind CSS**](https://tailwindcss.com/), a utility-first CSS framework. It's similar to doing inline CSS, but not quite. [Here is a good reading](https://tailwindcss.com/docs/utility-first) in case you've never used Tailwind.

Finally, all the JavaScript and CSS files are generated with [Vite](https://vitejs.dev/). You shouldn't worry to much about it — just run `pnpm dev` and `pnpm build`.

### Internationalization

Although this simulator was first thought as a learning tool for the [Facultad de Informática de la UNLP](https://info.unlp.edu.ar) in Argentina, we want to make it as accessible as possible.

We support both Spanish and English languages, declared inside `src/i18n/locales/`. There you'll find nested JSON-ish objects with literals (and some functions to make those literals more generic). You can add a new as deep as you want and then access it with.dot.notation. Also, when adding new keys, you may first add them to `en.ts` and then to the rest of locales - because TypeScript looks at that file when generating the autocompletion.

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

Right now, we are depolying to GitHub Pages ([repo](https://github.com/vonsim/vonsim.github.io)) as a preview. The app is meant to be built like this:

```bash
$ pnpm build # build the app
$ pnpm docs:build # build the docs
$ mv docs/.vitepress/dist dist/docs # merge app and docs
```
