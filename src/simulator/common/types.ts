import type { Option } from "rust-optionals";
import type { JsonValue } from "type-fest";

export type MemoryMode = "empty" | "randomize" | "reuse";

export interface Jsonable {
  toJSON(): JsonValue;
}

export interface IORegisters extends Jsonable {
  // If it has internal state, it should be JSON-serializable.
  getRegister(address: number): Option<number>;
  setRegister(address: number, value: number): Option<void>;
}
