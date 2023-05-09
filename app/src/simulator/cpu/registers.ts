import { isMatching, match } from "ts-pattern";
import type { Split } from "type-fest";

import type { RegisterType } from "@/compiler/common";
import { partialRegisterPattern } from "@/compiler/common/patterns";
import { INITIAL_IP, MEMORY_SIZE } from "@/config";
import { joinLowHigh, randomWord, splitLowHigh } from "@/helpers";
import type { Jsonable, MemoryMode } from "@/simulator/common";

export type RegistersOptions = { mode: MemoryMode };

export class Registers implements Jsonable {
  #AX = 0;
  #BX = 0;
  #CX = 0;
  #DX = 0;
  #IP = INITIAL_IP;
  #IR = 0;
  #SP = MEMORY_SIZE;
  #MAR = 0;
  #MBR = 0;

  get(register: RegisterType) {
    return match(register)
      .with("AL", () => splitLowHigh(this.#AX)[0])
      .with("AH", () => splitLowHigh(this.#AX)[1])
      .with("BL", () => splitLowHigh(this.#BX)[0])
      .with("BH", () => splitLowHigh(this.#BX)[1])
      .with("CL", () => splitLowHigh(this.#CX)[0])
      .with("CH", () => splitLowHigh(this.#CX)[1])
      .with("DL", () => splitLowHigh(this.#DX)[0])
      .with("DH", () => splitLowHigh(this.#DX)[1])
      .with("AX", () => this.#AX)
      .with("BX", () => this.#BX)
      .with("CX", () => this.#CX)
      .with("DX", () => this.#DX)
      .with("IP", () => this.#IP)
      .with("IR", () => this.#IR)
      .with("SP", () => this.#SP)
      .with("MAR", () => this.#MAR)
      .with("MBR", () => this.#MBR)
      .exhaustive();
  }

  set(register: RegisterType, value: number) {
    if (isMatching(partialRegisterPattern, register)) {
      const [name, byte] = register.split("") as Split<typeof register, "">;
      const wordRegister = `${name}X` as const;

      let [low, high] = splitLowHigh(this.get(wordRegister));
      if (byte === "L") low = value;
      else if (byte === "H") high = value;

      this.set(wordRegister, joinLowHigh(low, high));
    } else {
      match(register)
        .with("AX", () => (this.#AX = value))
        .with("BX", () => (this.#BX = value))
        .with("CX", () => (this.#CX = value))
        .with("DX", () => (this.#DX = value))
        .with("IP", () => (this.#IP = value))
        .with("IR", () => (this.#IR = value))
        .with("SP", () => (this.#SP = value))
        .with("MAR", () => (this.#MAR = value))
        .with("MBR", () => (this.#MBR = value))
        .exhaustive();
    }
  }

  reset({ mode }: RegistersOptions) {
    this.#IP = INITIAL_IP;
    this.#IR = 0x0000;
    this.#SP = MEMORY_SIZE;
    this.#MAR = 0x0000;
    this.#MBR = 0x0000;

    if (mode === "empty") {
      this.#AX = 0x0000;
      this.#BX = 0x0000;
      this.#CX = 0x0000;
      this.#DX = 0x0000;
    } else if (mode === "randomize") {
      this.#AX = randomWord();
      this.#BX = randomWord();
      this.#CX = randomWord();
      this.#DX = randomWord();
    }
  }

  toJSON() {
    return {
      AX: this.#AX,
      BX: this.#BX,
      CX: this.#CX,
      DX: this.#DX,
      IP: this.#IP,
      IR: this.#IR,
      SP: this.#SP,
      MAR: this.#MAR,
      MBR: this.#MBR,
    };
  }
}
