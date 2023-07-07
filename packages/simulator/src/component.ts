import type { JsonValue } from "type-fest";

import type { Computer, ComputerOptions, DevicesConfiguration } from "./computer";

export type { DevicesConfiguration };

export type ComponentInit<TDevices extends DevicesConfiguration = DevicesConfiguration> = {
  computer: Computer<TDevices>;
} & ComputerOptions<TDevices>;

export abstract class Component<TDevices extends DevicesConfiguration = DevicesConfiguration> {
  protected computer: Computer<TDevices>;

  constructor(options: ComponentInit<TDevices>) {
    this.computer = options.computer;
  }

  abstract toJSON(): JsonValue;
}
