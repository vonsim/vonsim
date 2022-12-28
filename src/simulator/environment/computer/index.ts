import create from "zustand";
import type { Program } from "~/compiler";
import { WordRegisterType } from "~/compiler/common";
import { INITIAL_IP, MEMORY_SIZE } from "~/config";
import { useConfig } from "../config";
import { numberToWord } from "../helpers";
import { programToBytecode } from "./bytecode";

export type Word = [low: number, high: number];

export type ComputerStore = {
  memory: number[];
  registers: { [key in WordRegisterType]: Word };
  loadProgram: (program: Program) => void;
};

export const useComputer = create<ComputerStore>()((set, get) => ({
  memory: new Array(MEMORY_SIZE).fill(0).map(() => Math.round(Math.random() * 255)),
  registers: {
    AX: numberToWord(0),
    BX: numberToWord(0),
    CX: numberToWord(0),
    DX: numberToWord(0),
    IP: numberToWord(INITIAL_IP),
    IR: numberToWord(0),
    SP: numberToWord(MEMORY_SIZE),
    MAR: numberToWord(0),
    MBR: numberToWord(0),
  },
  loadProgram: program => {
    const memoryConfig = useConfig.getState().memoryOnReset;

    const memory: number[] =
      memoryConfig === "empty"
        ? new Array(MEMORY_SIZE).fill(0)
        : memoryConfig === "random"
        ? new Array(MEMORY_SIZE).fill(0).map(() => Math.round(Math.random() * 255))
        : [...get().memory];

    programToBytecode(memory, program);

    set({ memory });
  },
}));
