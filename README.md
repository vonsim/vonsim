<a href="https://vonsim.github.io/preview" target="_blank" rel="noopener">
  <img src="./public/github_banner.png" alt="VonSim - A 8088-like Assembly Simulator" />
</a>

<div align="center">
  <br/>
  <h3><a href="https://vonsim.github.io/preview" target="_blank" rel="noopener"><strong>Try it now</strong></a></h3>
  <br/>
  <img src="./public/demo.gif" alt="Demo" />
  <br/>
</div>

## To-do list

- [ ] Add ✨ animations ✨
  - [ ] Rethink the simulator
  - [ ] Add animated diagrams
  - [ ] [Support mobile](https://github.com/prc5/react-zoom-pan-pinch)
- [ ] Add Printer w/CDMA
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

- [ ] Fix escape multicursor in editor
- [ ] Add custom VonSim syntax to docs
- [ ] Dark mode everywhere
- [ ] Fix flags on Windows

More suggestions: https://github.com/vonsim/vonsim/issues/26

## Development setup

You'll need [Node.js v18](https://nodejs.org/) and [pnpm v8](https://pnpm.io). Once you have them installed, you can run the following inside the repo:

```bash
$ pnpm install # only the first time, install the dependencies
$ pnpm dev     # starts the development server
```

More info about this project in [CONTRIBUTING.md](CONTRIBUTING.md)
