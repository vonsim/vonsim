import type { Language } from "@/config";
import type { Path, PathValue } from "@/helpers";
import { Locale, translate } from "@/i18n";

import type { PositionRange } from "./index";

type CompilerErrorCode = Path<Locale["compilerErrors"]>;
type CompilerErrorContext<Code extends CompilerErrorCode> = PathValue<
  Locale["compilerErrors"],
  Code
> extends (...context: infer A) => string
  ? A
  : [];

/**
 * An error that can be thrown by the compiler.
 *
 * The basic idea of the error system is that each error has a code and maybe some parameters.
 * This way, the error messages can be translated to different languages.
 *
 * @example
 * new CompilerError("double-memory-access")
 * new CompilerError("label-not-found", label)
 */
export class CompilerError<Code extends CompilerErrorCode> extends Error {
  public readonly code: Code;
  private readonly context: CompilerErrorContext<Code>;
  public position: PositionRange | null;

  constructor(code: Code, ...context: CompilerErrorContext<Code>) {
    super();
    this.code = code;
    this.context = context;
    this.position = null;
  }

  /**
   * Add a position to the error.
   * @param position A position or something that has a position.
   * @returns
   */
  at(
    position: PositionRange | { position: PositionRange } | { meta: { position: PositionRange } },
  ) {
    if (Array.isArray(position)) this.position = position;
    else if ("position" in position) this.position = position.position;
    else if ("meta" in position) this.position = position.meta.position;
    return this;
  }

  translate(lang: Language) {
    return translate(lang, `compilerErrors.${this.code}`, ...this.context);
  }

  get message() {
    return this.translate("en");
  }

  toString() {
    let message = this.message;
    if (this.position) {
      message += ` (${this.position[0]}:${this.position[1]})`;
    }
    return message;
  }
}
