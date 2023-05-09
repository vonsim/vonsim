import { Err, Ok, Option } from "rust-optionals";

import { Jsonable, MemoryMode, SimulatorError, SimulatorResult } from "@/simulator/common";

import { Console } from "./devices/console";
import { F10 } from "./devices/f10";
import { PIC } from "./devices/pic";
import { Timer } from "./devices/timer";

export type BaseDevicesOptions = { mode: MemoryMode };

export abstract class BaseDevices implements Jsonable {
  #pic = new PIC();
  #console = new Console();
  #f10 = new F10(this.#pic);
  #timer = new Timer(this.#pic);

  abstract readonly id: string;

  get devices() {
    return {
      pic: this.#pic,
      console: this.#console,
      f10: this.#f10,
      timer: this.#timer,
    };
  }

  reset({ mode }: BaseDevicesOptions) {
    this.#pic.reset({ mode });
    this.#timer.reset({ mode });
  }

  getRegister(address: number): SimulatorResult<number> {
    let result: Option<number>;

    result = this.#pic.getRegister(address);
    if (result.isSome()) return Ok(result.unwrap());

    result = this.#timer.getRegister(address);
    if (result.isSome()) return Ok(result.unwrap());

    return Err(new SimulatorError("io-memory-not-implemented", address));
  }

  setRegister(address: number, value: number): SimulatorResult<void> {
    let result: Option<void>;

    result = this.#pic.setRegister(address, value);
    if (result.isSome()) return Ok();

    result = this.#timer.setRegister(address, value);
    if (result.isSome()) return Ok();

    return Err(new SimulatorError("io-memory-not-implemented", address));
  }

  get nextTick() {
    return this.#timer.nextTick;
  }

  tick(currentTime: number) {
    return this.#timer.tick(currentTime);
  }

  toJSON() {
    return {
      pic: this.#pic.toJSON(),
      console: this.#console.toJSON(),
      timer: this.#timer.toJSON(),
    };
  }
}
