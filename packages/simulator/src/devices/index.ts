import { JsonValue } from "type-fest";

import { Component, ComponentOptions, ComponentReset, DevicesConfiguration } from "../component";
import { Clock } from "./clocks";
import { Console } from "./console";
import { F10 } from "./f10";
import { Leds } from "./leds";
import { Printer } from "./printer";
import { Switches } from "./switches";

export class Devices extends Component {
  #config: DevicesConfiguration = "pio-switches-and-leds";

  #clock: Clock;
  #console: Console;
  #f10: F10;
  #leds: Leds;
  #printer: Printer;
  #switches: Switches;

  constructor(options: ComponentOptions) {
    super(options);
    this.#clock = new Clock(options);
    this.#console = new Console(options);
    this.#f10 = new F10(options);
    this.#leds = new Leds(options);
    this.#printer = new Printer(options);
    this.#switches = new Switches(options);
  }

  get clock() {
    return this.#clock;
  }

  get console() {
    return this.#console;
  }

  get f10() {
    return this.#f10;
  }

  get leds() {
    if (this.#config === "pio-switches-and-leds") return this.#leds;
    else return null;
  }

  get printer() {
    if (this.#config === "pio-printer" || this.#config === "handshake") return this.#printer;
    else return null;
  }

  get switches() {
    if (this.#config === "pio-switches-and-leds") return this.#switches;
    else return null;
  }

  reset(options: ComponentReset): void {
    this.#config = options.devices;
    this.#clock.reset();
    this.#console.reset(options);
    this.#f10.reset();
    this.#leds.reset(options);
    this.#printer.reset(options);
    this.#switches.reset(options);
  }

  toJSON(): JsonValue {
    return {
      clock: this.clock.toJSON(),
      console: this.console.toJSON(),
      f10: this.f10.toJSON(),
      leds: this.leds?.toJSON() || null,
      printer: this.printer?.toJSON() || null,
      switches: this.switches?.toJSON() || null,
    };
  }
}
