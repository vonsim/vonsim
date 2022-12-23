import create from "zustand";
import { MAX_MEMORY_ADDRESS } from "~/config";

type MemoryState = {
  mem: ArrayBuffer;
  setByte: (address: number, value: number) => void;
  setWord: (address: number, value: number) => void;
};

export const useMemoryStore = create<MemoryState>()((set, get) => ({
  mem: new ArrayBuffer(MAX_MEMORY_ADDRESS + 1),
  setByte: (address: number, value: number) => {
    const mem = get().mem;
    const view = new DataView(mem);
    view.setUint8(address, value);
    set({ mem });
  },
  setWord: (address: number, value: number) => {
    const mem = get().mem;
    const view = new DataView(mem);
    view.setUint16(address, value, true);
    set({ mem });
  },
}));
