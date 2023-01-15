import { toast } from "react-hot-toast";
import { Result } from "rust-optionals";

import { Language } from "@/config";

import { ERROR_LIST, SimulatorErrorCode, SimulatorErrorParams } from "./list";

export class SimulatorError<Code extends SimulatorErrorCode> extends Error {
  public readonly code: Code;
  private readonly params: SimulatorErrorParams<Code>;

  constructor(code: Code, ...params: SimulatorErrorParams<Code>) {
    super();
    this.code = code;
    this.params = params;
  }

  translate(lang: Language) {
    // @ts-expect-error - TypeScript doesn't like '...this.params', for some reason.
    return ERROR_LIST[this.code](...this.params)[lang];
  }

  get message() {
    return this.translate("en");
  }

  toString() {
    return this.message;
  }

  notify() {
    toast.error(this.message);
  }
}

export type SimulatorResult<T> = Result<T, SimulatorError<any>>;
