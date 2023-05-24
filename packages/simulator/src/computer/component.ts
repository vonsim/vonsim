import type { JsonValue } from "type-fest";

import type { Computer } from ".";

export type ComponentOptions = {
  computer: Computer;
};

export abstract class Component {
  protected computer: Computer;

  protected constructor(options: ComponentOptions) {
    this.computer = options.computer;
  }

  abstract toJSON(): JsonValue;
}
