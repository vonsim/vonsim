# `@vonsim/simulator`

This package contains all the logic of the simulator. Given an assembled program (see `@vonsim/assembler`), it executes it. The computer simulated has a [CPU](./src/cpu/index.ts), [memory](./src/memory.ts) and [I/O devices](./src/io/configurations/index.ts) (specs [here](https://vonsim.github.io/docs/)).

## Simulation and events

Once initialized, the simulation can be _advanced_ one step at a time. Each _advance_ returns a [`SimulatorEvent`](./src/events.ts). These events can be from any device. Examples of events are:

- `{ type: "cpu:cycle.start", ... }`
- `{ type: "cpu:register.copy", ... }`
- `{ type: "memory:read.ok", ... }`
- `{ type: "clock:tick", ... }`

These events are minimal and can be used to update the UI. For example, the `cpu:register.copy` event contains the source and destination register, and the value that was copied. This can be used to update the UI with the new value.

Now, the simulation can be _advanced_ from multiple sources. The main one is given by `Simulator#startCPU()`. This method returns a generator of `SimulatorEvent`. Each `next()` emulates a tick from clock connected to the CPU. It will emit events related to the instruction cycle (like `cpu:cycle.start`) along other events from any devices. For instance, when executing an `IN` instruction, the (reduced) list of events will be:

- `cpu:cycle.start` (instruction cycle start)
- `cpu:memory.read` (fetch instruction)
- `cpu:decode` (decodes)
- (... more fetching and decoding)
- `pic:read` (read from PIC)
- `cpu:register.copy` (copy value to register)
- `cpu:cycle.end` (instruction cycle end)

As you can see, the full sequence of events will be returned by each consecutive `next()` call. When `next()` is called is up to the UI. This lets the app set the speed of the simulation and (even better) set a custom speed for each operation. For example, the UI can set the speed of the `cpu:register.copy` event to 1, followed by a quick animation and then set the speed of the `cpu:memory.read` event to 10, so the user can see the instruction being fetched from memory slowly, experiencing the delay of the memory.

In a similar fashion, there are other way to trigger events. There are the ones exposed by `Simulator#devices`. For example, `Simulator#devices.f10.press()` should be triggered when the user presses the F10 key. This will trigger a `f10:press` event, followed by others events, like the update of the PIC. The same goes for the other devices.

One caveat is that the simulation should stop when the generator given by `Simulator#startCPU()` finished. That's not the case for the other generators. After a generator created by `Simulator#devices` finishes, it should be descarted and the simulation should continue. If the user want to trigger the same event again, a new generator should be created.

> [!IMPORTANT]\
> Since it's a very interconnected package, all methods should have a note (in JSDoc) about what they do and from where it will be called. This will help to understand the flow of the program.
