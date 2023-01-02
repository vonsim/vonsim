import { toast } from "react-hot-toast";
import { match, P } from "ts-pattern";
import { compile, ProgramInstruction } from "~/compiler";
import type { BinaryInstructionType } from "~/compiler/common";
import { MAX_MEMORY_ADDRESS, MIN_MEMORY_ADDRESS } from "~/config";
import type { ComputerSlice } from ".";
import { highlightLine, setReadOnly } from "../components/editor/methods";
import { renderAddress } from "../helpers";

export type RunnerAction = "run" | "step" | "stop";

export type RunnerSlice = {
  runnerState: "running" | "paused" | "stopped";
  stopRequested: boolean;
  dispatchRunner: (action: RunnerAction) => void;
  /**
   * Executes a single instruction.
   * Returns true if the execution should continue, false otherwise.
   */
  runInstruction: () => boolean;
};

export const createRunnerSlice: ComputerSlice<RunnerSlice> = (set, get) => ({
  runnerState: "stopped",
  stopRequested: false,
  dispatchRunner: async action => {
    const state = get().runnerState;

    const finish = () => {
      highlightLine(null);
      setReadOnly(false);
      set({ runnerState: "stopped", stopRequested: false });
    };

    if (action === "stop") {
      if (state === "running") set({ stopRequested: true });
      else if (state === "paused") finish();

      return;
    }

    // By now, we know that the action is either 'run' or 'step'
    // If the state is 'running', we don't do anything
    if (state === "running") return;

    if (state === "stopped") {
      const code = window.codemirror!.state.doc.toString();
      const result = compile(code);

      if (!result.success) {
        toast.error("Error de compilación. Solucioná los errores y volvé a intentar");
        return;
      }

      get().loadProgram(result);
      setReadOnly(true);
    }

    if (action === "step") {
      const keepRunning = get().runInstruction();

      if (keepRunning) set({ runnerState: "paused" });
      else finish();
    } else {
      set({ runnerState: "running" });

      while (true) {
        const keepRunning = get().runInstruction();
        await new Promise(resolve => {
          // I know it's not efficient, but it  doesn't
          // affect the performance of the app
          const ms = 1000 / get().clockSpeed;
          setTimeout(resolve, ms);
        });

        if (!keepRunning || get().stopRequested) break;
      }

      finish();
    }
  },
  runInstruction() {
    try {
      const program = get().program;
      if (!program) throw new Error("No hay ningún programa cargado. Compilá antes de ejecutar.");

      const IP = get().registers.IP;

      const instruction = program.instructions.find(instruction => instruction.meta.start === IP);
      if (!instruction) {
        throw new Error(
          `Se esperaba una instrucción en la dirección de memoria ${renderAddress(
            IP,
          )} pero no se encontró ninguna.`,
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
        opSize: "byte" | "word",
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
        opSize: "byte" | "word",
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

      // Most instructions ends in a IP bump with a `return true`.
      // It also allows passing a custom IP (for example, for jumps)
      const bumpIP = (overwrite?: number) => {
        get().setRegister(
          "IP",
          typeof overwrite === "number" ? overwrite : IP + instruction.meta.length,
        );
        return true;
      };

      // #=========================================================================#
      // # Comptue each instruction                                                #
      // #=========================================================================#

      return match(instruction)
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
          if (SP < MIN_MEMORY_ADDRESS) throw new Error("Stack overflow");
          get().setRegister("SP", SP);
          const value = get().getRegister(register);
          get().setMemory(SP, "word", value);

          return bumpIP();
        })
        .with({ type: "POP" }, ({ register }) => {
          let SP = get().getRegister("SP");
          if (SP + 1 > MAX_MEMORY_ADDRESS) throw new Error("Stack underflow");
          const value = get().getMemory(SP, "word");
          get().setRegister(register, value);
          SP += 2;
          get().setRegister("SP", SP);

          return bumpIP();
        })
        .with({ type: "PUSHF" }, () => {
          let SP = get().getRegister("SP");
          SP -= 2;
          if (SP < MIN_MEMORY_ADDRESS) throw new Error("Stack overflow");
          get().setRegister("SP", SP);
          const flags = get().encodeFlags();
          get().setMemory(SP, "word", flags);

          return bumpIP();
        })
        .with({ type: "POPF" }, ({}) => {
          let SP = get().getRegister("SP");
          if (SP + 1 > MAX_MEMORY_ADDRESS) throw new Error("Stack underflow");
          const flags = get().getMemory(SP, "word");
          get().decodeFlags(flags);
          SP += 2;
          get().setRegister("SP", SP);

          return bumpIP();
        })
        .with({ type: "CALL" }, ({ jumpTo, meta }) => {
          let SP = get().getRegister("SP");
          SP -= 2;
          if (SP < MIN_MEMORY_ADDRESS) throw new Error("Stack overflow");
          get().setRegister("SP", SP);

          const returnAddress = IP + meta.length;
          get().setMemory(SP, "word", returnAddress);

          return bumpIP(jumpTo);
        })
        .with({ type: "RET" }, () => {
          let SP = get().getRegister("SP");
          if (SP + 1 > MAX_MEMORY_ADDRESS) throw new Error("Stack underflow");
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
        .with({ type: "IN" }, () => {
          throw new Error("Sin implementación");
        })
        .with({ type: "OUT" }, () => {
          throw new Error("Sin implementación");
        })
        .with({ type: "INT" }, () => {
          throw new Error("Sin implementación");
        })
        .with({ type: "IRET" }, () => {
          throw new Error("Sin implementación");
        })
        .with({ type: "CLI" }, () => {
          throw new Error("Sin implementación");
        })
        .with({ type: "STI" }, () => {
          throw new Error("Sin implementación");
        })
        .with({ type: "NOP" }, () => bumpIP())
        .with({ type: "HLT" }, () => false)
        .exhaustive();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        console.error(error);
        toast.error(String(error));
      }
      return false;
    }
  },
});
