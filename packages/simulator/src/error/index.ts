import { initTranlate, Language, LocaleCode, LocaleContext } from "@vonsim/common/i18n";

import { english } from "./messages/english";
import { spanish } from "./messages/spanish";

export type Messages = typeof english;

const translate = initTranlate<Messages>({
  en: english,
  es: spanish,
});

export type SimulatorErrorCode = LocaleCode<Messages>;
export type SimulatorErrorContext<Code extends SimulatorErrorCode> = LocaleContext<Messages, Code>;

/**
 * An error that can be thrown by the simulator.
 *
 * The basic idea of the error system is that each error has a code and maybe some parameters.
 * This way, the error messages can be translated to different languages.
 *
 * @see {@link initTranlate}
 *
 * @example
 * new SimulatorError("double-memory-access")
 * new SimulatorError("label-not-found", label)
 */
export class SimulatorError<Code extends SimulatorErrorCode> extends Error {
  public readonly code: Code;
  private readonly context: SimulatorErrorContext<Code>;

  constructor(code: Code, ...context: SimulatorErrorContext<Code>) {
    super();
    this.code = code;
    this.context = context;

    if (code === "unexpected-error") {
      console.error("[Unexpected Simulator Error]", ...context);
    }
  }

  translate(lang: Language) {
    return translate(lang, this.code, ...this.context);
  }

  // Just for internal use, should never be shown to the user.
  get message() {
    return this.translate("en");
  }

  toString() {
    return this.message;
  }

  static from(err: unknown): SimulatorError<any> {
    if (err instanceof SimulatorError) return err;
    else return new SimulatorError("unexpected-error", err);
  }
}
