import type { Result } from "rust-optionals";

import type { Language } from "@/config";
import type { Path, PathValue } from "@/helpers";
import { Locale, translate } from "@/i18n";

type SimulatorErrorCode = Path<Locale["simulatorErrors"]>;
type SimulatorErrorContext<Code extends SimulatorErrorCode> = PathValue<
  Locale["simulatorErrors"],
  Code
> extends (...context: infer A) => string
  ? A
  : [];

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
  private readonly context: SimulatorErrorContext<Code>;

  constructor(code: Code, ...context: SimulatorErrorContext<Code>) {
    super();
    this.code = code;
    this.context = context;
  }

  translate(lang: Language) {
    return translate(lang, `simulatorErrors.${this.code}`, ...this.context);
  }

  // Just for internal use, should never be shown to the user.
  get message() {
    return this.translate("en");
  }

  toString() {
    return this.message;
  }
}

export type SimulatorResult<T> = Result<T, SimulatorError<any>>;
