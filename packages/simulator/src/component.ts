import type { Program } from "@vonsim/assembler";
import type { JsonValue } from "type-fest";

import type { Computer } from "./computer";

export type ComponentOptions = {
  computer: Computer;
};

export type ComponentReset = {
  program: Program;
  memory: "unchanged" | "clean" | "randomize";
  devices: "pio-switches" | "pio-printer" | "handshake";
};

export abstract class Component {
  protected computer: Computer;

  constructor(options: ComponentOptions) {
    this.computer = options.computer;
  }

  /**
   * Resets the component. It's better than having to
   * re-instance it, because all references to it don't
   * have to be updated.
   * @param options Some parameters about the new program/config
   */
  abstract reset(options: ComponentReset): void;

  abstract toJSON(): JsonValue;
}
