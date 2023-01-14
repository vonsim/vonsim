import { toast } from "react-hot-toast";
import { Err, Ok, Result } from "rust-optionals";
import { tdeep } from "tdeep";
import { match, P } from "ts-pattern";
import { compile, ProgramInstruction } from "~/compiler";
import type { BinaryInstructionType } from "~/compiler/common";
import { Interrupt, MAX_MEMORY_ADDRESS, MIN_MEMORY_ADDRESS, Size } from "~/config";
import { renderAddress, sleep } from "~/helpers";
import type { SimulatorSlice } from "~/simulator";
import { CONSOLE_ID } from "~/ui/components/Console";
import { highlightLine, setReadOnly } from "~/ui/components/editor/methods";

type StepReturn = Result<"continue" | "halt" | "start-debugger" | "wait-for-input", Error>;

export type RunnerAction = "run" | "step" | "stop";

export type RunnerSlice = {
  runner: "running" | "paused" | "waiting-for-input" | "stopped";
  dispatchRunner: (action: RunnerAction) => Promise<void>;
  __runnerInternal: {
    action: RunnerAction | null;
    loop: () => Promise<void>;
    step: () => StepReturn;
  };
};

export const createRunnerSlice: SimulatorSlice<RunnerSlice> = (set, get) => ({
  runner: "stopped",

  dispatchRunner: action => {
    const runner = get().runner;

    if (runner === "stopped") {
      if (action === "stop") return Promise.reject(new Error("Invalid action"));
      set(tdeep("__runnerInternal.action", action));
      return get().__runnerInternal.loop();
    } else {
      // If runner isn't paused and action is 'run' or 'step'
      if (runner !== "paused" && action !== "stop") {
        return Promise.reject(new Error("Invalid action"));
      }
      set(tdeep("__runnerInternal.action", action));
      return Promise.resolve();
    }
  },

  __runnerInternal: {
    action: null,

    loop: async () => {
      // This is how many milliseconds we'll tick the simulator clock,
      // which is lower than any clock speed the user can set. This way,
      // we can tick all the clocks (CPU, Timer, Printer, etc...) inside
      // one loop.
      const resolution = 10;

      const instructionTime = 1000 / get().clockSpeed; // in milliseconds
      let timeElapsed = 0;
      let instructionsExecuted = 0;

      const inputEvent = "keydown" as const;
      let inputListener: ((ev: KeyboardEvent) => void) | null = null;

      while (true) {
        let action = get().__runnerInternal.action;
        let runner = get().runner;
        let runInstruction = false;

        if (action === "stop") break;

        if (runner === "running") {
          if (action === "run" || action === "step") {
            throw new Error("Invalid action");
          }

          const timeToNextInstruction = instructionTime * instructionsExecuted;
          if (timeElapsed >= timeToNextInstruction) {
            runInstruction = true;
          }

          // Add the resolution time, no matter if the instruction was executed or not
          timeElapsed += resolution;
        } else if (runner === "paused") {
          if (action === "run") {
            set({ runner: "running" });
            runner = "running";
          }

          if (action !== null) {
            runInstruction = true;
            // If an instruction was executed, add the time that would have passed
            timeElapsed += instructionTime;
          }
        } else if (runner === "waiting-for-input") {
          if (action === "run" || action === "step") {
            throw new Error("Invalid action");
          }
        } else {
          // runner === 'stop'
          if (action === null) return;

          const code = window.codemirror!.state.doc.toString();
          const result = compile(code);

          if (!result.success) {
            toast.error("Error de compilación. Solucioná los errores y volvé a intentar");
            break;
          }

          get().loadProgram(result);
          setReadOnly(true);

          if (action === "run") {
            set({ runner: "running" });
            runner = "running";
          } else if (action === "step") {
            set({ runner: "paused" });
            runner = "paused";
          }
        }

        // For the 'wait-for-input' state we do nothing. The time should have been
        // bumped in the previous iteration

        if (runInstruction) {
          const result = get().__runnerInternal.step();

          if (result.isErr()) {
            toast.error(result.unwrapErr().message);
            break;
          }

          instructionsExecuted++;

          const ret = result.unwrap();
          if (ret === "continue") {
            // Do nothing
          } else if (ret === "start-debugger") {
            set({ runner: "paused" });
          } else if (ret === "wait-for-input") {
            const previousState = get().runner;
            set({ runner: "waiting-for-input" });

            inputListener = ev => {
              let char: string;
              if (/^[\u0000-\u00FF]$/.test(ev.key)) char = ev.key;
              else if (ev.key === "Enter") char = "\n";
              else return;

              ev.preventDefault();
              document.removeEventListener(inputEvent, inputListener!);

              const address = get().getRegister("BX");
              get().setMemory(address, "byte", char.charCodeAt(0));
              get().devices.writeConsole(char);

              inputListener = null;
              set({ runner: previousState });
            };

            document.addEventListener("keydown", inputListener);
            document.getElementById(CONSOLE_ID)?.scrollIntoView({ behavior: "smooth" });
          } else {
            // ret = 'halt'
            break;
          }
        }

        // Clear action
        if (action !== null) {
          set(tdeep("__runnerInternal.action", null));
        }

        // Await next tick
        await sleep(resolution);
      }

      highlightLine(null);
      setReadOnly(false);
      set({ runner: "stopped" });
      if (inputListener) {
        document.removeEventListener(inputEvent, inputListener);
      }
    },

    step() {
      const program = get().program;
      if (!program) {
        return Err(new Error("No hay ningún programa cargado. Compilá antes de ejecutar."));
      }

      const IP = get().registers.IP;

      const instruction = program.instructions.find(instruction => instruction.meta.start === IP);
      if (!instruction) {
        return Err(
          new Error(
            `Se esperaba una instrucción en la dirección de memoria ${renderAddress(
              IP,
            )} pero no se encontró ninguna.`,
          ),
        );
      }

      highlightLine(instruction.meta.position[0]);

      // Update the instruction register
      const IR = get().getMemory(IP, "byte");
      get().setRegister("IR", IR);

      // #=========================================================================#
      // # Helpers                                                                 #
      // #=========================================================================#
      const getOperandValue = (
        operand: Extract<ProgramInstruction, { type: BinaryInstructionType }>["src"],
        opSize: Size,
      ): number =>
        match(operand)
          .with({ type: "register" }, ({ register }) => get().getRegister(register))
          .with({ type: "memory", mode: "direct" }, ({ address }) =>
            get().getMemory(address, opSize),
          )
          .with({ type: "memory", mode: "indirect" }, () => {
            const address = get().getRegister("BX");
            return get().getMemory(address, opSize);
          })
          .with({ type: "immediate" }, ({ value }) => value)
          .exhaustive();

      const saveInOperand = (
        operand: Extract<ProgramInstruction, { type: BinaryInstructionType }>["out"],
        opSize: Size,
        value: number,
      ) =>
        match(operand)
          .with({ type: "register" }, ({ register }) => {
            get().setRegister(register, value);
          })
          .with({ type: "memory", mode: "direct" }, ({ address }) => {
            get().setMemory(address, opSize, value);
          })
          .with({ type: "memory", mode: "indirect" }, () => {
            const address = get().getRegister("BX");
            get().setMemory(address, opSize, value);
          })
          .exhaustive();

      // Most instructions ends in a IP bump with a `return 'continue'`.
      // It also allows passing a custom IP (for example, for jumps)
      const bumpIP = (overwrite?: number): StepReturn => {
        get().setRegister(
          "IP",
          typeof overwrite === "number" ? overwrite : IP + instruction.meta.length,
        );
        return Ok("continue");
      };

      // #=========================================================================#
      // # Comptue each instruction                                                #
      // #=========================================================================#

      return match<ProgramInstruction, StepReturn>(instruction)
        .with({ type: "MOV" }, ({ opSize, out, src }) => {
          const value = getOperandValue(src, opSize);
          saveInOperand(out, opSize, value);

          return bumpIP();
        })
        .with({ type: P.union("ADD", "ADC", "SUB", "SBB") }, ({ type, opSize, out, src }) => {
          const left = getOperandValue(out, opSize);
          const right = getOperandValue(src, opSize);
          const result = get().executeArithmetic(type, left, right, opSize);
          saveInOperand(out, opSize, result);

          return bumpIP();
        })
        .with({ type: P.union("AND", "OR", "XOR") }, ({ type, opSize, out, src }) => {
          const left = getOperandValue(out, opSize);
          const right = getOperandValue(src, opSize);
          const result = get().executeLogical(type, left, right, opSize);
          saveInOperand(out, opSize, result);

          return bumpIP();
        })
        .with({ type: "NOT" }, ({ type, opSize, out }) => {
          const right = getOperandValue(out, opSize);
          const result = get().executeLogical(type, 0, right, opSize);
          saveInOperand(out, opSize, result);

          return bumpIP();
        })
        .with({ type: "CMP" }, ({ opSize, out, src }) => {
          const left = getOperandValue(out, opSize);
          const right = getOperandValue(src, opSize);
          get().executeArithmetic("SUB", left, right, opSize);

          return bumpIP();
        })
        .with({ type: "INC" }, ({ opSize, out }) => {
          const left = getOperandValue(out, opSize);
          const result = get().executeArithmetic("ADD", left, 1, opSize);
          saveInOperand(out, opSize, result);

          return bumpIP();
        })
        .with({ type: "DEC" }, ({ opSize, out }) => {
          const left = getOperandValue(out, opSize);
          const result = get().executeArithmetic("SUB", left, 1, opSize);
          saveInOperand(out, opSize, result);

          return bumpIP();
        })
        .with({ type: "NEG" }, ({ opSize, out }) => {
          const right = getOperandValue(out, opSize);
          const result = get().executeArithmetic("SUB", 0, right, opSize);
          saveInOperand(out, opSize, result);

          return bumpIP();
        })
        .with({ type: "PUSH" }, ({ register }) => {
          let SP = get().getRegister("SP");
          SP -= 2;
          if (SP < MIN_MEMORY_ADDRESS) return Err(new Error("Stack overflow"));
          get().setRegister("SP", SP);
          const value = get().getRegister(register);
          get().setMemory(SP, "word", value);

          return bumpIP();
        })
        .with({ type: "POP" }, ({ register }) => {
          let SP = get().getRegister("SP");
          if (SP + 1 > MAX_MEMORY_ADDRESS) return Err(new Error("Stack underflow"));
          const value = get().getMemory(SP, "word");
          get().setRegister(register, value);
          SP += 2;
          get().setRegister("SP", SP);

          return bumpIP();
        })
        .with({ type: "PUSHF" }, () => {
          let SP = get().getRegister("SP");
          SP -= 2;
          if (SP < MIN_MEMORY_ADDRESS) return Err(new Error("Stack overflow"));
          get().setRegister("SP", SP);
          const flags = get().encodeFlags();
          get().setMemory(SP, "word", flags);

          return bumpIP();
        })
        .with({ type: "POPF" }, ({}) => {
          let SP = get().getRegister("SP");
          if (SP + 1 > MAX_MEMORY_ADDRESS) return Err(new Error("Stack underflow"));
          const flags = get().getMemory(SP, "word");
          get().decodeFlags(flags);
          SP += 2;
          get().setRegister("SP", SP);

          return bumpIP();
        })
        .with({ type: "CALL" }, ({ jumpTo, meta }) => {
          let SP = get().getRegister("SP");
          SP -= 2;
          if (SP < MIN_MEMORY_ADDRESS) return Err(new Error("Stack overflow"));
          get().setRegister("SP", SP);

          const returnAddress = IP + meta.length;
          get().setMemory(SP, "word", returnAddress);

          return bumpIP(jumpTo);
        })
        .with({ type: "RET" }, () => {
          let SP = get().getRegister("SP");
          if (SP + 1 > MAX_MEMORY_ADDRESS) return Err(new Error("Stack underflow"));
          const returnAddress = get().getMemory(SP, "word");
          SP += 2;
          get().setRegister("SP", SP);

          return bumpIP(returnAddress);
        })
        .with({ type: "JMP" }, ({ jumpTo }) => bumpIP(jumpTo))
        .with({ type: "JZ" }, ({ jumpTo }) => bumpIP(get().alu.flags.zero ? jumpTo : undefined))
        .with({ type: "JNZ" }, ({ jumpTo }) => bumpIP(!get().alu.flags.zero ? jumpTo : undefined))
        .with({ type: "JS" }, ({ jumpTo }) => bumpIP(get().alu.flags.sign ? jumpTo : undefined))
        .with({ type: "JNS" }, ({ jumpTo }) => bumpIP(!get().alu.flags.sign ? jumpTo : undefined))
        .with({ type: "JC" }, ({ jumpTo }) => bumpIP(get().alu.flags.carry ? jumpTo : undefined))
        .with({ type: "JNC" }, ({ jumpTo }) => bumpIP(!get().alu.flags.carry ? jumpTo : undefined))
        .with({ type: "JO" }, ({ jumpTo }) => bumpIP(get().alu.flags.overflow ? jumpTo : undefined))
        .with({ type: "JNO" }, ({ jumpTo }) =>
          bumpIP(!get().alu.flags.overflow ? jumpTo : undefined),
        )
        .with({ type: "IN" }, ({ opSize, port }) => {
          const address = port.type === "fixed" ? port.value : get().getRegister("DX");
          const value = get().getIOMemory(address, opSize);
          get().setRegister(opSize === "byte" ? "AL" : "AX", value);
          return bumpIP();
        })
        .with({ type: "OUT" }, ({ opSize, port }) => {
          const address = port.type === "fixed" ? port.value : get().getRegister("DX");
          const value = get().getRegister(opSize === "byte" ? "AL" : "AX");
          get().setIOMemory(address, opSize, value);
          return bumpIP();
        })
        .with({ type: "INT" }, ({ interrupt }) =>
          match<Interrupt, StepReturn>(interrupt)
            .with(0, () => Ok("halt"))
            .with(3, () => {
              bumpIP();
              return Ok("start-debugger");
            })
            .with(6, () => {
              bumpIP();
              return Ok("wait-for-input");
            })
            .with(7, () => {
              const start = get().getRegister("BX");
              const len = get().getRegister("AL");
              let text = "";
              for (let i = 0; i < len; i++) {
                text += String.fromCharCode(get().getMemory(i + start, "byte"));
              }
              get().devices.writeConsole(text);
              return bumpIP();
            })
            .exhaustive(),
        )
        .with({ type: "IRET" }, () => Err(new Error("Sin implementación")))
        .with({ type: "CLI" }, () => {
          get().disableInterrupts();
          return bumpIP();
        })
        .with({ type: "STI" }, () => {
          get().enableInterrupts();
          return bumpIP();
        })
        .with({ type: "NOP" }, () => bumpIP())
        .with({ type: "HLT" }, () => Ok("halt"))
        .exhaustive();
    },
  },
});
