import type { Jsonable, SimulatorResult } from "@/simulator/common";

import { PrinterWithHandshake, PrinterWithHandshakeOptions } from "./printer-with-handshake";
import { PrinterWithPIO, PrinterWithPIOOptions } from "./printer-with-pio";
import { SwitchesAndLeds, SwitchesAndLedsOptions } from "./switches-and-leds";

export type Devices = SwitchesAndLeds | PrinterWithPIO | PrinterWithHandshake;
export type DevicesId = Devices["id"];

export type DevicesOptions = SwitchesAndLedsOptions &
  PrinterWithPIOOptions &
  PrinterWithHandshakeOptions;

export class IOInterface implements Jsonable {
  #devices: Devices = new SwitchesAndLeds();

  get devices() {
    return this.#devices.devices;
  }

  reset(options: DevicesOptions) {
    this.#devices.reset(options);
  }

  switchDevices(id: DevicesId) {
    if (this.#devices.id === id) return;
    this.#devices =
      id === "printer-with-pio"
        ? new PrinterWithPIO()
        : id === "printer-with-handshake"
        ? new PrinterWithHandshake()
        : new SwitchesAndLeds();
  }

  getRegister(address: number): SimulatorResult<number> {
    return this.#devices.getRegister(address);
  }

  setRegister(address: number, value: number): SimulatorResult<void> {
    return this.#devices.setRegister(address, value);
  }

  get nextTick() {
    return this.#devices.nextTick;
  }

  tick(currentTime: number) {
    return this.#devices.tick(currentTime);
  }

  toJSON() {
    return this.#devices.toJSON();
  }
}
