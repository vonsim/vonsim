import { Language } from "~/config";
import { CompilerErrorCode, CompilerErrorParams, ERROR_LIST } from "./error-list";
import type { Position, PositionRange } from "./index";

export class CompilerError<Code extends CompilerErrorCode> {
  public readonly code: Code;
  private readonly params: CompilerErrorParams<Code>;

  constructor(code: Code, ...params: CompilerErrorParams<Code>) {
    this.code = code;
    this.params = params;
  }

  message(lang: Language) {
    // @ts-expect-error - TypeScript doesn't like '...this.params', for some reason.
    return ERROR_LIST[this.code](...this.params)[lang];
  }

  toString() {
    return this.message("en");
  }
}

export class LineError<Code extends CompilerErrorCode> extends CompilerError<Code> {
  public readonly from: Position;
  public readonly to: Position;

  constructor(
    code: Code,
    // This wierd syntax is for the labels declared in both tuples to be maintained.
    // This accepts the params of the code first and then the position range.
    ...args: [...params: CompilerErrorParams<Code>, ...position: PositionRange]
  ) {
    const params = args.slice(0, -2) as CompilerErrorParams<Code>;
    const [from, to] = args.slice(-2) as PositionRange;
    super(code, ...params);
    this.from = from;
    this.to = to;
  }

  toString() {
    return super.toString() + ` (${this.from} - ${this.toString})`;
  }
}
