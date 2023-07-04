import type { JsonValue } from "type-fest";

import type { Computer, ComputerOptions, DevicesConfiguration } from "./computer";

export type { DevicesConfiguration };

export type ComponentInit = { computer: Computer } & ComputerOptions;

export abstract class Component {
  protected computer: Computer;

  constructor(options: ComponentInit) {
    this.computer = options.computer;
  }

  abstract toJSON(): JsonValue;
}
