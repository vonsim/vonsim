/**
 * Printer with PIO
 *
 * Devices:
 * - PIO
 * - Printer
 *
 * Ports:
 * - PA (30h): printer data
 * - PB (31h): character to be printed
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
 *
 * --------------------------------
 * About the printer
 * @see /docs/como-usar/dispositivos/impresora.md for more details
 *
 * The printer control register (PA) has the following bits:
 * XXXX XXSB
 * Where S is the Strobe bit and B is the Busy bit
 *
 * The character to be printed is stored in the PB register
 */

import { Ok } from "rust-optionals";

import { bit } from "@/helpers";
import type { SimulatorResult } from "@/simulator/common";

import { BaseDevices, BaseDevicesOptions } from "./base";
import { PIO } from "./devices/pio";
import { Printer } from "./devices/printer";

export type PrinterWithPIOOptions = BaseDevicesOptions & { printerSpeed: number };

export class PrinterWithPIO extends BaseDevices {
  #pio = new PIO();
  #printer = new Printer();

  readonly id = "printer-with-pio" as const;

  get devices() {
    return {
      ...super.devices,
      id: this.id,
      pio: this.#pio,
      printer: this.#printer,
    };
  }

  reset({ mode, printerSpeed }: PrinterWithPIOOptions) {
    super.reset({ mode });
    this.#pio.reset({ mode });
    this.#printer.reset({ speed: printerSpeed });

    // Set busy bit to 0, since the buffer always starts empty
    const PA = this.#pio.getRegister(PIO.PA).unwrap() & ~1;
    this.#pio.setRegister(PIO.PA, PA);
  }

  getRegister(address: number): SimulatorResult<number> {
    const pio = this.#pio.getRegister(address);
    if (pio.isSome()) return Ok(pio.unwrap());

    return super.getRegister(address);
  }

  setRegister(address: number, value: number): SimulatorResult<void> {
    if (address === PIO.PA) {
      const oldValue = this.#pio.getRegister(PIO.PA).unwrap();

      // Update register
      this.#pio.setRegister(address, value);

      // Check if the strobe bit changed
      const prev = bit(oldValue, 1);
      const next = bit(value, 1);
      if (prev === false && next === true) {
        // Strobe is rising edge

        let char = this.#pio.getRegister(PIO.PB).unwrap();
        for (let i = 0; i < 8; i++) {
          // Filter out non-output bits
          if (this.#pio.bitMode("B", i) === "output") continue;
          char &= ~(1 << i);
        }

        this.#printer.addToBuffer(char);
      }
    } else {
      const pio = this.#pio.setRegister(address, value);
      if (pio.isNone()) return super.setRegister(address, value);
    }

    return Ok();
  }

  get nextTick() {
    return Math.min(super.nextTick, this.#printer.nextTick);
  }

  tick(currentTime: number) {
    super.tick(currentTime);
    this.#printer.tick(currentTime);
    // it's generally safe to update the busy bit here,
    // since this function will always be called between CPU ticks
    this.#updateBusy();
  }

  #updateBusy() {
    // Don't update the busy bit if it's an output
    if (this.#pio.bitMode("A", 0) !== "input") return;

    const PA = this.#pio.getRegister(PIO.PA).unwrap();
    if (this.#printer.busy) this.#pio.setRegister(PIO.PA, PA | 1);
    else this.#pio.setRegister(PIO.PA, PA & ~1);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      id: this.id,
      pio: this.#pio.toJSON(),
      printer: this.#printer.toJSON(),
    };
  }
}
