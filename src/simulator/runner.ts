import { Err, Ok } from "rust-optionals";
import { match, P } from "ts-pattern";

import { compile, ProgramInstruction } from "@/compiler";
import type { BinaryInstructionType } from "@/compiler/common";
import { Interrupt, Size } from "@/config";
import { sleep } from "@/helpers";
import type { SimulatorSlice } from "@/simulator";
import { SimulatorError, SimulatorResult } from "@/simulator/error";
import { CONSOLE_ID } from "@/ui/components/Console";
import { highlightLine, setReadOnly } from "@/ui/components/editor/methods";

type StepReturn = SimulatorResult<"continue" | "halt" | "start-debugger" | "wait-for-input">;

type InputListener = (ev: KeyboardEvent) => void;

export type RunnerAction = "run" | "step" | "stop";

export type RunnerSlice = {
  runner: "running" | "paused" | "waiting-for-input" | "stopped";
  dispatchRunner: (action: RunnerAction) => Promise<void>;
  __runnerInternal: {
    action: RunnerAction | null;
    loop: () => Promise<void>;

    instructionsRan: number;
    inputListener: InputListener | null;
    runInstruction: (timeElapsed: number) => void;
    step: () => StepReturn;
  };
};

const INPUT_LISTENER_EVENT = "keydown" as const;

export const createRunnerSlice: SimulatorSlice<RunnerSlice> = (set, get) => ({
  runner: "stopped",

  dispatchRunner: async action => {
    const runner = get().runner;

    if (runner === "stopped") {
      if (action === "stop") return; // Invalid action
      set(state => void (state.__runnerInternal.action = action));
      await get().__runnerInternal.loop();
    } else {
      // If runner isn't paused and action is 'run' or 'step'
      if (runner !== "paused" && action !== "stop") {
        return; // Invalid action
      }
      set(state => void (state.__runnerInternal.action = action));
    }
  },

  __runnerInternal: {
    // #=========================================================================#
    // # Main loop                                                               #
    // #=========================================================================#
    action: null,
    loop: async () => {
      // This is how many milliseconds we'll tick the simulator clock,
      // which is lower than any clock speed the user can set. This way,
      // we can tick all the clocks (CPU, Timer, Printer, etc...) inside
      // one loop.
      const resolution = 10;
      let timeElapsed = 0;

      set(state => void (state.__runnerInternal.instructionsRan = 0));

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const action = get().__runnerInternal.action;
        const runner = get().runner;

        if (action === "stop") break;

        if (runner === "running") {
          if (action !== null) throw new Error("Invalid action");

          // Add the resolution time, since we're running continuously
          timeElapsed += resolution;
        } else if (runner === "paused") {
          if (action === "run") set({ runner: "running" });

          // Add the time that one instruction would take ONLY IF an instruction gets executed
          if (action !== null) timeElapsed += 1000 / get().clockSpeed;
        } else if (runner === "waiting-for-input") {
          if (action !== null) throw new Error("Invalid action");
        } else {
          // runner === 'stop'
          if (action === null) return;

          const code = window.codemirror!.state.doc.toString();
          const result = compile(code);

          if (!result.success) {
            new SimulatorError("compile-error").notify();
            break;
          }

          get().loadProgram(result);
          setReadOnly(true);

          if (action === "run") set({ runner: "running" });
          else if (action === "step") set({ runner: "paused" });
        }

        // For the 'wait-for-input' state we do nothing. The time should have been
        // bumped in the previous iteration and it should not be bumped until the
        // user presses a key.

        // Run instruction
        get().__runnerInternal.runInstruction(timeElapsed);

        // Update all devices
        get().devices.update(timeElapsed);

        // Clear action
        if (action !== null) {
          set(state => void (state.__runnerInternal.action = null));
        }

        // Await next tick
        await sleep(resolution);
      }

      highlightLine(null);
      setReadOnly(false);
      set(state => {
        state.runner = "stopped";
        if (state.__runnerInternal.inputListener) {
          document.removeEventListener(INPUT_LISTENER_EVENT, state.__runnerInternal.inputListener);
          state.__runnerInternal.inputListener = null;
        }
      });
    },

    // #=========================================================================#
    // # Instruction runner                                                      #
    // #=========================================================================#
    instructionsRan: 0,
    inputListener: null,
    runInstruction: timeElapsed => {
      const instructionTime = 1000 / get().clockSpeed; // in milliseconds
      const instructionsRan = get().__runnerInternal.instructionsRan;

      const timeToNextInstruction = instructionTime * instructionsRan;
      if (timeElapsed < timeToNextInstruction) return;

      const result = get().__runnerInternal.step();

      set(state => void state.__runnerInternal.instructionsRan++);

      if (result.isErr()) {
        result.unwrapErr().notify();
        set(state => void (state.__runnerInternal.action = "stop"));
        return;
      }

      const ret = result.unwrap();
      if (ret === "continue") {
        // Do nothing
      } else if (ret === "start-debugger") {
        set({ runner: "paused" });
      } else if (ret === "wait-for-input") {
        const previousState = get().runner;
        set({ runner: "waiting-for-input" });

        const inputListener: InputListener = ev => {
          let char: string;
          if (/^[\x20-\xFF]$/.test(ev.key)) char = ev.key;
          else if (ev.key === "Enter") char = "\n";
          else return;

          ev.preventDefault();
          document.removeEventListener(INPUT_LISTENER_EVENT, inputListener);

          const address = get().getRegister("BX");
          get().setMemory(address, "byte", char.charCodeAt(0));
          get().devices.console.write(char);

          set(state => {
            state.runner = previousState;
            state.__runnerInternal.inputListener = null;
          });
        };

        document.addEventListener(INPUT_LISTENER_EVENT, inputListener);
        document.getElementById(CONSOLE_ID)?.scrollIntoView({ behavior: "smooth" });
        set(state => void (state.__runnerInternal.inputListener = inputListener));
      } else {
        // ret = 'halt'
        set(state => void (state.__runnerInternal.action = "stop"));
      }
    },

    step() {
      const program = get().program;
      if (!program) return Err(new SimulatorError("no-program"));

      const IP = get().registers.IP;

      const instruction = program.instructions.find(instruction => instruction.meta.start === IP);
      if (!instruction) return Err(new SimulatorError("no-instruction", IP));

      highlightLine(instruction.meta.position[0]);

      // Update the instruction register
      const IR = get().getMemory(IP, "byte");
      if (IR.isErr()) return Err(IR.unwrapErr());
      get().setRegister("IR", IR.unwrap());

      // #=========================================================================#
      // # Helpers                                                                 #
      // #=========================================================================#
      const getOperandValue = (
        operand: Extract<ProgramInstruction, { type: BinaryInstructionType }>["src"],
        opSize: Size,
      ) =>
        match<typeof operand, SimulatorResult<number>>(operand)
          .with({ type: "register" }, ({ register }) => Ok(get().getRegister(register)))
          .with({ type: "memory", mode: "direct" }, ({ address }) =>
            get().getMemory(address, opSize),
          )
          .with({ type: "memory", mode: "indirect" }, () => {
            const address = get().getRegister("BX");
            return get().getMemory(address, opSize);
          })
          .with({ type: "immediate" }, ({ value }) => Ok(value))
          .exhaustive();

      const saveInOperand = (
        operand: Extract<ProgramInstruction, { type: BinaryInstructionType }>["out"],
        opSize: Size,
        value: number,
      ) =>
        match<typeof operand, SimulatorResult<void>>(operand)
          .with({ type: "register" }, ({ register }) => {
            get().setRegister(register, value);
            return Ok();
          })
          .with({ type: "memory", mode: "direct" }, ({ address }) => {
            return get().setMemory(address, opSize, value);
          })
          .with({ type: "memory", mode: "indirect" }, () => {
            const address = get().getRegister("BX");
            return get().setMemory(address, opSize, value);
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
          if (value.isErr()) return Err(value.unwrapErr());

          const saved = saveInOperand(out, opSize, value.unwrap());
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        })
        .with({ type: P.union("ADD", "ADC", "SUB", "SBB") }, ({ type, opSize, out, src }) => {
          const left = getOperandValue(out, opSize);
          if (left.isErr()) return Err(left.unwrapErr());

          const right = getOperandValue(src, opSize);
          if (right.isErr()) return Err(right.unwrapErr());

          const result = get().executeArithmetic(type, left.unwrap(), right.unwrap(), opSize);

          const saved = saveInOperand(out, opSize, result);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        })
        .with({ type: P.union("AND", "OR", "XOR") }, ({ type, opSize, out, src }) => {
          const left = getOperandValue(out, opSize);
          if (left.isErr()) return Err(left.unwrapErr());

          const right = getOperandValue(src, opSize);
          if (right.isErr()) return Err(right.unwrapErr());

          const result = get().executeLogical(type, left.unwrap(), right.unwrap(), opSize);

          const saved = saveInOperand(out, opSize, result);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        })
        .with({ type: "NOT" }, ({ type, opSize, out }) => {
          const right = getOperandValue(out, opSize);
          if (right.isErr()) return Err(right.unwrapErr());

          const result = get().executeLogical(type, 0, right.unwrap(), opSize);

          const saved = saveInOperand(out, opSize, result);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        })
        .with({ type: "CMP" }, ({ opSize, out, src }) => {
          const left = getOperandValue(out, opSize);
          if (left.isErr()) return Err(left.unwrapErr());

          const right = getOperandValue(src, opSize);
          if (right.isErr()) return Err(right.unwrapErr());

          get().executeArithmetic("SUB", left.unwrap(), right.unwrap(), opSize);

          return bumpIP();
        })
        .with({ type: "INC" }, ({ opSize, out }) => {
          const value = getOperandValue(out, opSize);
          if (value.isErr()) return Err(value.unwrapErr());

          const result = get().executeArithmetic("ADD", value.unwrap(), 1, opSize);

          const saved = saveInOperand(out, opSize, result);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        })
        .with({ type: "DEC" }, ({ opSize, out }) => {
          const value = getOperandValue(out, opSize);
          if (value.isErr()) return Err(value.unwrapErr());

          const result = get().executeArithmetic("SUB", value.unwrap(), 1, opSize);

          const saved = saveInOperand(out, opSize, result);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        })
        .with({ type: "NEG" }, ({ opSize, out }) => {
          const value = getOperandValue(out, opSize);
          if (value.isErr()) return Err(value.unwrapErr());

          const result = get().executeArithmetic("SUB", 0, value.unwrap(), opSize);

          const saved = saveInOperand(out, opSize, result);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        })
        .with({ type: "PUSH" }, ({ register }) => {
          const value = get().getRegister(register);

          const saved = get().pushToStack(value);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        })
        .with({ type: "POP" }, ({ register }) => {
          const value = get().popFromStack();
          if (value.isErr()) return Err(value.unwrapErr());

          get().setRegister(register, value.unwrap());
          return bumpIP();
        })
        .with({ type: "PUSHF" }, () => {
          const flags = get().encodeFlags();

          const saved = get().pushToStack(flags);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        })
        .with({ type: "POPF" }, () => {
          const value = get().popFromStack();
          if (value.isErr()) return Err(value.unwrapErr());

          get().decodeFlags(value.unwrap());
          return bumpIP();
        })
        .with({ type: "CALL" }, ({ jumpTo, meta }) => {
          const returnAddress = IP + meta.length;

          const saved = get().pushToStack(returnAddress);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP(jumpTo);
        })
        .with({ type: "RET" }, () => {
          const returnAddress = get().popFromStack();
          if (returnAddress.isErr()) return Err(returnAddress.unwrapErr());

          return bumpIP(returnAddress.unwrap());
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
          if (value.isErr()) return Err(value.unwrapErr());

          get().setRegister(opSize === "byte" ? "AL" : "AX", value.unwrap());
          return bumpIP();
        })
        .with({ type: "OUT" }, ({ opSize, port }) => {
          const address = port.type === "fixed" ? port.value : get().getRegister("DX");
          const value = get().getRegister(opSize === "byte" ? "AL" : "AX");

          const saved = get().setIOMemory(address, opSize, value);
          if (saved.isErr()) return Err(saved.unwrapErr());

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
                const value = get().getMemory(i + start, "byte");
                if (value.isErr()) return Err(value.unwrapErr());
                text += String.fromCharCode(value.unwrap());
              }
              get().devices.console.write(text);
              return bumpIP();
            })
            .exhaustive(),
        )
        .with({ type: "IRET" }, () => {
          const IP = get().popFromStack();
          if (IP.isErr()) return Err(IP.unwrapErr());

          const flags = get().popFromStack();
          if (flags.isErr()) return Err(flags.unwrapErr());

          get().decodeFlags(flags.unwrap());
          return bumpIP(IP.unwrap());
        })
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
