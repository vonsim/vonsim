import type { PhysicalRegister } from "@vonsim/simulator/cpu";
import { parseRegister } from "@vonsim/simulator/cpu/utils";

import { highlightLine } from "@/editor/methods";
import { store } from "@/lib/jotai";
import { getSpeeds } from "@/lib/settings";
import { colors } from "@/lib/tailwind";
import {
  AddressRegister,
  DataRegister,
  generateAddressPath,
  generateDataPath,
} from "@/simulator/computer/cpu/bus";
import { animationRefs } from "@/simulator/computer/references";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish, startDebugger } from "@/simulator/state";

import { aluOperationAtom, cycleAtom, MARAtom, MBRAtom, registerAtoms } from "./state";

export async function handleCPUEvent(event: SimulatorEvent<"cpu:">): Promise<void> {
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
      await drawAddressPath(event.register);
      await activateRegister("MAR");
      store.set(MARAtom, store.get(registerAtoms[event.register]));
      await Promise.all([deactivateRegister("MAR"), resetPath()]);
      return;
    }

    case "cpu:mbr.get": {
      const [reg] = parseRegister(event.register);
      await drawDataPath("MBR", reg);
      await activateRegister(reg);
      store.set(registerAtoms[event.register], store.get(MBRAtom));
      await Promise.all([deactivateRegister(reg), resetPath()]);
      return;
    }

    case "cpu:mbr.set": {
      const [reg] = parseRegister(event.register);
      await drawDataPath(reg, "MBR");
      await activateRegister("MBR");
      store.set(MBRAtom, store.get(registerAtoms[event.register]));
      await Promise.all([deactivateRegister("MBR"), resetPath()]);
      return;
    }

    case "cpu:register.copy": {
      const [src] = parseRegister(event.src);
      const [dest] = parseRegister(event.dest);
      if (src !== dest) await drawDataPath(src, dest);
      await activateRegister(dest);
      // @ts-expect-error Registers types always match, see CPUMicroOperation
      store.set(registerAtoms[event.dest], store.get(registerAtoms[event.src]));
      await Promise.all([deactivateRegister(dest), src !== dest && resetPath()]);
      return;
    }

    case "cpu:register.update": {
      const [reg] = parseRegister(event.register);
      await activateRegister(reg);
      // @ts-expect-error The value type and the register type always match, see CPUMicroOperation
      store.set(registerAtoms[event.register], event.value);
      await deactivateRegister(reg);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}

async function drawAddressPath(from: AddressRegister) {
  const path = generateAddressPath(from);
  animationRefs.cpu.highlightPath.set({ strokeDashoffset: 1, opacity: 1, path });
  const duration = getSpeeds().executionUnit * 5;
  await Promise.all(
    animationRefs.cpu.highlightPath.start({
      to: { strokeDashoffset: 0 },
      config: { duration },
    }),
  );
}

async function drawDataPath(from: DataRegister, to: DataRegister) {
  const path = generateDataPath(from, to);
  animationRefs.cpu.highlightPath.set({ strokeDashoffset: 1, opacity: 1, path });
  const duration = getSpeeds().executionUnit * 5;
  await Promise.all(
    animationRefs.cpu.highlightPath.start({
      strokeDashoffset: 0,
      config: { duration },
    }),
  );
}

async function resetPath() {
  const duration = getSpeeds().executionUnit * 1;
  await Promise.all(
    animationRefs.cpu.highlightPath.start({
      opacity: 0,
      config: { duration },
    }),
  );
}

async function activateRegister(reg: PhysicalRegister | "MAR" | "MBR") {
  const duration = getSpeeds().executionUnit * 1;
  await Promise.all(
    animationRefs.cpu[reg].start({
      backgroundColor: colors.lime[500],
      config: { duration },
    }),
  );
}

async function deactivateRegister(reg: PhysicalRegister | "MAR" | "MBR") {
  const duration = getSpeeds().executionUnit * 1;
  await Promise.all(
    animationRefs.cpu[reg].start({
      backgroundColor: colors.stone[800],
      config: { duration },
    }),
  );
}
