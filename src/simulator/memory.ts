import { klona } from "klona";
import { Err, Ok } from "rust-optionals";

import { MAX_MEMORY_ADDRESS, MEMORY_SIZE, MIN_MEMORY_ADDRESS, Size } from "@/config";
import type { SimulatorSlice } from "@/simulator";
import { SimulatorError, SimulatorResult } from "@/simulator/error";

export type MemorySlice = {
  memory: ArrayBuffer;
  getMemory: (address: number, size: Size) => SimulatorResult<number>;
  setMemory: (address: number, size: Size, value: number) => SimulatorResult<void>;
};

export const createMemorySlice: SimulatorSlice<MemorySlice> = (set, get) => ({
  memory: new ArrayBuffer(MEMORY_SIZE),

  getMemory: (address, size) => {
    let value: number;
    if (size === "byte") {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS) {
        return Err(new SimulatorError("address-out-of-range", address));
      }
      value = new DataView(get().memory).getUint8(address);
    } else {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS - 1) {
        return Err(new SimulatorError("address-out-of-range", address));
      }
      value = new DataView(get().memory).getUint16(address, true);
    }

    get().setRegister("MAR", address);
    get().setRegister("MBR", value);
    return Ok(value);
  },

  setMemory: (address, size, value) => {
    const memory = klona(get().memory);
    const program = get().program;

    if (size === "byte") {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS) {
        return Err(new SimulatorError("address-out-of-range", address));
      }
      if (program && program.codeMemory.has(address)) {
        return Err(new SimulatorError("address-has-instuction", address));
      }
      new DataView(memory).setUint8(address, value);
    } else {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS - 1) {
        return Err(new SimulatorError("address-out-of-range", address));
      }
      if (program && (program.codeMemory.has(address) || program.codeMemory.has(address + 1))) {
        return Err(new SimulatorError("address-has-instuction", address));
      }
      new DataView(memory).setUint16(address, value, true);
    }

    get().setRegister("MAR", address);
    get().setRegister("MBR", value);
    set({ memory });
    return Ok();
  },
});
