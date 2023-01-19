import { toast } from "react-hot-toast";
import { Result } from "rust-optionals";

import { Language } from "@/config";
import { useSettings } from "@/ui/settings";

import { ERROR_LIST, SimulatorErrorCode, SimulatorErrorParams } from "./list";

/**
 * An error that can be thrown by the simulator.
 *
 * The basic idea of the error system is that each error has a code and maybe some parameters.
 * This way, the error messages can be translated to different languages.
 *
 * @example
 * new SimulatorError("compile-error")
 * new SimulatorError("address-has-instuction", label)
 */
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
    const message = this.translate(useSettings.getState().language);
    toast.error(message);
  }
}

export type SimulatorResult<T> = Result<T, SimulatorError<any>>;
