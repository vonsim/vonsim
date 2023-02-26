/**
 * Printer with Handshake
 *
 * Devices:
 * - Handshake
 * - Printer
 *
 * Ports:
 * - DATA (40h): printer data
 * - STATE (41h): printer control
 *
 * --------------------------------
 * About the Handshake
 * @see /docs/como-usar/dispositivos/handshake.md for more details
 *
 * About the printer
 * @see /docs/como-usar/dispositivos/impresora.md for more details
 */

import { Ok } from "rust-optionals";

import type { SimulatorResult } from "@/simulator/common";

import { BaseDevices, BaseDevicesOptions } from "./base";
import { Handshake } from "./devices/handshake";
import { Printer } from "./devices/printer";

export type PrinterWithHandshakeOptions = BaseDevicesOptions & { printerSpeed: number };

export class PrinterWithHandshake extends BaseDevices {
  #printer = new Printer();
  #handshake = new Handshake(this.#printer);

  readonly id = "printer-with-handshake" as const;

  get devices() {
    return {
      ...super.devices,
      id: this.id,
      handshake: this.#handshake,
      printer: this.#printer,
    };
  }

  reset({ mode, printerSpeed }: PrinterWithHandshakeOptions) {
    super.reset({ mode });
    this.#printer.reset({ speed: printerSpeed });
    this.#handshake.reset();
  }

  getRegister(address: number): SimulatorResult<number> {
    const handshake = this.#handshake.getRegister(address);
    if (handshake.isSome()) return Ok(handshake.unwrap());

    return super.getRegister(address);
  }

  setRegister(address: number, value: number): SimulatorResult<void> {
    const handshake = this.#handshake.setRegister(address, value);
    if (handshake.isNone()) return super.setRegister(address, value);
    else return Ok();
  }

  get nextTick() {
    return Math.min(super.nextTick, this.#printer.nextTick);
  }

  tick(currentTime: number) {
    super.tick(currentTime);
    this.#printer.tick(currentTime);

    // it's generally safe to update the busy bit here,
    // since this function will always be called between CPU ticks
    this.#handshake.updateBusy();

    // Check for interrupts
    if (!this.#handshake.interrupts) return;

    // Hanshaked is linked to INT2
    if (this.#printer.busy) super.devices.pic.cancel(2);
    else super.devices.pic.request(2);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      id: this.id,
      handshake: this.#handshake.toJSON(),
      printer: this.#printer.toJSON(),
    };
  }
}
