import { parseRegister } from "@vonsim/simulator/cpu/utils";

import { highlightLine } from "@/editor/methods";
import { store } from "@/lib/jotai";
import type { AnimationRefs } from "@/simulator/computer/animations";
import { highlightAddressPath, highlightDataPath } from "@/simulator/computer/cpu/bus";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish, startDebugger } from "@/simulator/state";

import { aluOperationAtom, cycleAtom, MARAtom, MBRAtom, registerAtoms } from "./state";

export async function handleCPUEvent(
  event: SimulatorEvent<"cpu:">,
  refs: AnimationRefs,
): Promise<void> {
  switch (event.type) {
    case "cpu:alu.execute": {
      store.set(aluOperationAtom, event.operation);
      store.set(registerAtoms.FLAGS, event.flags);
      store.set(registerAtoms.result, event.result);
      return;
    }

    case "cpu:cycle.end":
      return;

    case "cpu:cycle.interrupt": {
      store.set(cycleAtom, prev => {
        if (prev.phase === "stopped") return prev;
        return { ...prev, phase: "interrupt" };
      });
      return;
    }

    case "cpu:cycle.start": {
      highlightLine(event.instruction.position.start);
      store.set(cycleAtom, { phase: "fetching", metadata: event.instruction });
      return;
    }

    case "cpu:cycle.update": {
      store.set(cycleAtom, prev => {
        if (prev.phase === "stopped") return prev;
        return {
          ...prev,
          phase:
            event.phase === "decoded"
              ? "decoding"
              : event.phase === "execute"
              ? "executing"
              : "writeback",
        };
      });
      return;
    }

    case "cpu:decode":
      return;

    case "cpu:error": {
      store.set(cycleAtom, { phase: "stopped", error: event.error });
      finish(event.error);
      return;
    }

    case "cpu:halt":
    case "cpu:int.0": {
      store.set(cycleAtom, { phase: "stopped" });
      finish();
      return;
    }

    case "cpu:int.3": {
      startDebugger();
      return;
    }

    case "cpu:int.6":
      return;

    case "cpu:int.7":
      return;

    case "cpu:inta.off":
      return;

    case "cpu:inta.on":
      return;

    case "cpu:mar.set": {
      highlightAddressPath(event.register);
      await Promise.all(refs.cpu.highlightPath.start());
      await Promise.all(refs.cpu.MAR.start());
      store.set(MARAtom, store.get(registerAtoms[event.register]));
      await Promise.all(refs.cpu.MAR.start({ reverse: true }));
      await Promise.all(refs.cpu.highlightPath.start({ reverse: true, config: { duration: 0 } }));
      return;
    }

    case "cpu:mbr.get": {
      const [reg] = parseRegister(event.register);
      highlightDataPath("MBR", reg);
      await Promise.all(refs.cpu.highlightPath.start());
      await Promise.all(refs.cpu[reg].start());
      store.set(registerAtoms[event.register], store.get(MBRAtom));
      await Promise.all(refs.cpu[reg].start({ reverse: true }));
      await Promise.all(refs.cpu.highlightPath.start({ reverse: true, config: { duration: 0 } }));
      return;
    }

    case "cpu:mbr.set": {
      const [reg] = parseRegister(event.register);
      highlightDataPath(reg, "MBR");
      await Promise.all(refs.cpu.highlightPath.start());
      await Promise.all(refs.cpu.MBR.start());
      store.set(MBRAtom, store.get(registerAtoms[event.register]));
      await Promise.all(refs.cpu.MBR.start({ reverse: true }));
      await Promise.all(refs.cpu.highlightPath.start({ reverse: true, config: { duration: 0 } }));
      return;
    }

    case "cpu:register.copy": {
      const [src] = parseRegister(event.src);
      const [dest] = parseRegister(event.dest);
      if (src !== dest) {
        highlightDataPath(src, dest);
        await Promise.all(refs.cpu.highlightPath.start());
      }
      await Promise.all(refs.cpu[dest].start());
      // @ts-expect-error Registers types always match, see CPUMicroOperation
      store.set(registerAtoms[event.dest], store.get(registerAtoms[event.src]));
      await Promise.all(refs.cpu[dest].start({ reverse: true }));
      if (src !== dest) {
        await Promise.all(refs.cpu.highlightPath.start({ reverse: true, config: { duration: 0 } }));
      }
      return;
    }

    case "cpu:register.update": {
      const [reg] = parseRegister(event.register);
      await Promise.all(refs.cpu[reg].start());
      // @ts-expect-error The value type and the register type always match, see CPUMicroOperation
      store.set(registerAtoms[event.register], event.value);
      await Promise.all(refs.cpu[reg].start({ reverse: true }));
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
