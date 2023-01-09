import { klona } from "klona";
import { MAX_MEMORY_ADDRESS, MEMORY_SIZE, MIN_MEMORY_ADDRESS, Size } from "~/config";
import type { ComputerSlice } from ".";
import { renderAddress } from "../helpers";

export type MemorySlice = {
  memory: ArrayBuffer;
  getMemory(address: number, size: Size): number;
  setMemory: (address: number, size: Size, value: number) => void;
};

export const createMemorySlice: ComputerSlice<MemorySlice> = (set, get) => ({
  memory: new ArrayBuffer(MEMORY_SIZE),

  getMemory: (address, size) => {
    let value: number;
    if (size === "byte") {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} está fuera de rango.`);
      }
      value = new DataView(get().memory).getUint8(address);
    } else {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS - 1) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} está fuera de rango.`);
      }
      value = new DataView(get().memory).getUint16(address, true);
    }

    get().setRegister("MAR", address);
    get().setRegister("MBR", value);
    return value;
  },

  setMemory: (address, size, value) => {
    const memory = klona(get().memory);
    const program = get().program;

    if (size === "byte") {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} está fuera de rango.`);
      }
      if (program && program.codeMemory.has(address)) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} es de solo lectura.`);
      }
      new DataView(memory).setUint8(address, value);
    } else {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS - 1) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} está fuera de rango.`);
      }
      if (program && (program.codeMemory.has(address) || program.codeMemory.has(address + 1))) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} es de solo lectura.`);
      }
      new DataView(memory).setUint16(address, value, true);
    }

    get().setRegister("MAR", address);
    get().setRegister("MBR", value);
    set({ memory });
  },
});
