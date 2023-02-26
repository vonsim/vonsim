/**
 * Switches and LEDs
 *
 * Devices:
 * - PIO
 * - 8 switches
 * - 8 LEDs
 *
 * Ports:
 * - PA (30h): switches
 * - PB (31h): LEDs
 * - CA (31h): PA control
 * - CB (32h): PB control
 *
 * --------------------------------
 * About the PIO
 * @see /docs/como-usar/dispositivos/pio.md for more details
 *
 * CA and CB are the control registers, which determine whether the corresponding bit in PA/PB is an input or output
 *
 * When a bit of CX is 0, the corresponding bit in PX is the output value
 * When a bit of CX is 1, the corresponding bit in PX is the input value
 */

import { Ok } from "rust-optionals";

import type { SimulatorResult } from "@/simulator/common";

import { BaseDevices, BaseDevicesOptions } from "./base";
import { Leds } from "./devices/leds";
import { PIO } from "./devices/pio";
import { Switches } from "./devices/switches";

export type SwitchesAndLedsOptions = BaseDevicesOptions;

export class SwitchesAndLeds extends BaseDevices {
  #pio = new PIO();
  #switches = new Switches(this.#pio);
  #leds = new Leds(this.#pio);

  readonly id = "switches-and-leds" as const;

  get devices() {
    return {
      ...super.devices,
      id: this.id,
      pio: this.#pio,
      switches: this.#switches,
      leds: this.#leds,
    };
  }

  reset({ mode }: SwitchesAndLedsOptions) {
    super.reset({ mode });
    this.#pio.reset({ mode });
    this.#switches.reset({ mode });
    this.#leds.reset();
  }

  getRegister(address: number): SimulatorResult<number> {
    const pio = this.#pio.getRegister(address);
    if (pio.isSome()) return Ok(pio.unwrap());

    return super.getRegister(address);
  }

  setRegister(address: number, value: number): SimulatorResult<void> {
    if (address === PIO.PA) this.#switches.syncPIO();
    else if (address === PIO.PB || address === PIO.CB) this.#leds.syncPIO();

    const pio = this.#pio.setRegister(address, value);
    if (pio.isNone()) return super.setRegister(address, value);
    else return Ok();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      id: this.id,
      pio: this.#pio.toJSON(),
      switches: this.#switches.toJSON(),
      leds: this.#leds.toJSON(),
    };
  }
}
