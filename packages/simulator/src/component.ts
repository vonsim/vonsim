import type { JsonValue } from "type-fest";

import type { Computer, ComputerOptions, DevicesConfiguration } from "./computer";

export type { DevicesConfiguration };

export type ComponentInit = { computer: Computer } & ComputerOptions;

/**
 * This is the base class for all components.
 * A "component" is a part of the computer that can be interacted with.
 */
export abstract class Component {
  protected readonly computer: Computer;

  constructor(options: ComponentInit) {
    this.computer = options.computer;
  }

  abstract toJSON(): JsonValue;
}
