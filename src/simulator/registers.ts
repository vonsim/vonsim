import { tdeep } from "tdeep";
import { isMatching, match } from "ts-pattern";
import type { Split } from "type-fest";
import type { PhysicalRegisterType, RegisterType } from "~/compiler/common";
import { partialRegisterPattern } from "~/compiler/common/patterns";
import { INITIAL_IP, MEMORY_SIZE } from "~/config";
import { joinLowHigh, splitLowHigh } from "~/helpers";
import type { SimulatorSlice } from "~/simulator";

export type RegistersSlice = {
  registers: { [key in PhysicalRegisterType]: number };
  getRegister(register: RegisterType): number;
  setRegister: (register: RegisterType, value: number) => void;
};

export const createRegistersSlice: SimulatorSlice<RegistersSlice> = (set, get) => ({
  registers: {
    AX: 0,
    BX: 0,
    CX: 0,
    DX: 0,
    IP: INITIAL_IP,
    IR: 0,
    SP: MEMORY_SIZE,
    MAR: 0,
    MBR: 0,
  },

  getRegister: register => {
    if (isMatching(partialRegisterPattern, register)) {
      return match(register)
        .with("AL", () => splitLowHigh(get().registers.AX)[0])
        .with("AH", () => splitLowHigh(get().registers.AX)[1])
        .with("BL", () => splitLowHigh(get().registers.BX)[0])
        .with("BH", () => splitLowHigh(get().registers.BX)[1])
        .with("CL", () => splitLowHigh(get().registers.CX)[0])
        .with("CH", () => splitLowHigh(get().registers.CX)[1])
        .with("DL", () => splitLowHigh(get().registers.DX)[0])
        .with("DH", () => splitLowHigh(get().registers.DX)[1])
        .exhaustive();
    } else {
      return get().registers[register];
    }
  },

  setRegister: (register, value) => {
    if (isMatching(partialRegisterPattern, register)) {
      const [name, byte] = register.split("") as Split<typeof register, "">;
      const wordRegister = `${name}X` as const;

      let [low, high] = splitLowHigh(get().registers[wordRegister]);
      if (byte === "L") low = value;
      else if (byte === "H") high = value;

      set(tdeep(`registers.${wordRegister}`, joinLowHigh(low, high)));
    } else {
      set(tdeep(`registers.${register}`, value));
    }
  },
});
