import { parseRegister } from "@vonsim/simulator/cpu/utils";

import { highlightLine } from "@/editor/methods";
import { store } from "@/lib/jotai";
import { colors } from "@/lib/tailwind";
import { generateAddressPath } from "@/simulator/computer/cpu/AddressBus";
import {
  activateRegister,
  anim,
  deactivateRegister,
  turnLineOff,
  turnLineOn,
} from "@/simulator/computer/shared/animate";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish, startDebugger } from "@/simulator/state";

import { DataRegister, generateDataPath } from "./DataBus";
import { aluOperationAtom, cycleAtom, MARAtom, MBRAtom, registerAtoms } from "./state";

const drawDataPath = (from: DataRegister, to: DataRegister) => {
  const path = generateDataPath(from, to);
  return anim(
    "cpu.internalBus.data",
    { from: { strokeDashoffset: 1, opacity: 1, path }, to: { strokeDashoffset: 0 } },
    { duration: 5, easing: "easeInOutSine" },
  );
};

const resetDataPath = () =>
  anim("cpu.internalBus.data", { opacity: 0 }, { duration: 1, easing: "easeInSine" });

export async function handleCPUEvent(event: SimulatorEvent<"cpu:">): Promise<void> {
  switch (event.type) {
    case "cpu:alu.execute": {
      const pathsDrawConfig = { duration: 3, easing: "easeInOutSine" } as const;
      const pathsResetConfig = { duration: 1, easing: "easeInSine" } as const;

      await anim(
        "cpu.alu.operands",
        { from: { strokeDashoffset: 1, opacity: 1 }, to: { strokeDashoffset: 0 } },
        pathsDrawConfig,
      );
      store.set(aluOperationAtom, event.operation);
      await Promise.all([
        anim(
          "cpu.alu.operation",
          { backgroundColor: colors.mantis[400] },
          { duration: 1, easing: "easeOutQuart" },
        ),
        anim("cpu.alu.cog", { rot: 6 }, { duration: 10, easing: "easeInOutCubic" }),
      ]);
      await Promise.all([
        anim(
          "cpu.alu.operation",
          { backgroundColor: colors.stone[800] },
          { duration: 1, easing: "easeOutQuart" },
        ),
        anim(
          "cpu.alu.results",
          { from: { strokeDashoffset: 1, opacity: 1 }, to: { strokeDashoffset: 0 } },
          pathsDrawConfig,
        ),
      ]);
      await Promise.all([activateRegister("cpu.result"), activateRegister("cpu.FLAGS")]);
      store.set(registerAtoms.FLAGS, event.flags);
      store.set(registerAtoms.result, event.result);
      await Promise.all([deactivateRegister("cpu.result"), deactivateRegister("cpu.FLAGS")]);
      await Promise.all([
        anim("cpu.alu.operands", { opacity: 0 }, pathsResetConfig),
        anim("cpu.alu.results", { opacity: 0 }, pathsResetConfig),
      ]);
      return;
    }

    case "cpu:cycle.end":
      return;

    case "cpu:cycle.interrupt": {
      store.set(cycleAtom, prev => {
        if (prev.phase === "stopped") return prev;
        return { ...prev, phase: "interrupt" };
      });
      // Interrupts handler uses id and ri
      await Promise.all([
        anim("cpu.id", { opacity: 1 }, { duration: 0.5, easing: "easeInOutQuad" }),
        anim("cpu.ri", { opacity: 1 }, { duration: 0.5, easing: "easeInOutQuad" }),
      ]);
      return;
    }

    case "cpu:cycle.start": {
      highlightLine(event.instruction.position.start);
      store.set(cycleAtom, { phase: "fetching", metadata: event.instruction });
      await Promise.all([
        anim(
          "cpu.id",
          { opacity: event.instruction.willUse.id ? 1 : 0.4 },
          { duration: 0.5, easing: "easeInOutQuad" },
        ),
        anim(
          "cpu.ri",
          { opacity: event.instruction.willUse.ri ? 1 : 0.4 },
          { duration: 0.5, easing: "easeInOutQuad" },
        ),
      ]);
      return;
    }

    case "cpu:cycle.update": {
      store.set(cycleAtom, prev => {
        if (prev.phase === "stopped") return prev;
        return {
          ...prev,
          phase:
            event.phase === "execute"
              ? "executing"
              : event.phase === "writeback"
              ? "writeback"
              : event.next === "fetch-operands"
              ? "fetching-operands"
              : event.next === "execute"
              ? "executing"
              : event.next === "writeback"
              ? "writeback"
              : prev.phase,
        };
      });
      return;
    }

    case "cpu:decode": {
      await anim(
        "cpu.decoder.path",
        { from: { strokeDashoffset: 1, opacity: 1 }, to: { strokeDashoffset: 0 } },
        { duration: 3, easing: "easeInOutSine" },
      );
      await anim(
        "cpu.decoder.progress",
        { from: { progress: 0, opacity: 1 }, to: { progress: 1 } },
        { duration: 3, easing: "easeInOutSine" },
      );
      await Promise.all([
        anim("cpu.decoder.progress", { opacity: 0 }, { duration: 1, easing: "easeInSine" }),
        anim("cpu.decoder.path", { opacity: 0 }, { duration: 1, easing: "easeInSine" }),
      ]);
      return;
    }

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

    case "cpu:inta.off": {
      await turnLineOff("inta");
      return;
    }

    case "cpu:inta.on": {
      await turnLineOn("inta", 10);
      return;
    }

    case "cpu:rd.on":
    case "cpu:wr.on": {
      const line = event.type === "cpu:rd.on" ? "rd" : "wr";
      await anim(
        `bus.${line}`,
        { stroke: colors.red[500] },
        { duration: 5, easing: "easeOutSine" },
      );
      return;
    }

    case "cpu:iom.on": {
      await turnLineOn("iom", 15);
      return;
    }

    case "cpu:mar.set": {
      const path = generateAddressPath(event.register);
      await anim(
        "cpu.internalBus.address",
        { from: { strokeDashoffset: 1, opacity: 1, path }, to: { strokeDashoffset: 0 } },
        { duration: 5, easing: "easeInOutSine" },
      );
      await activateRegister("cpu.MAR", colors.blue[500]);
      store.set(MARAtom, store.get(registerAtoms[event.register]));
      await anim(
        "bus.address",
        { stroke: colors.blue[500] },
        { duration: 5, easing: "easeOutSine" },
      );
      await Promise.all([
        deactivateRegister("cpu.MAR"),
        anim("cpu.internalBus.address", { opacity: 0 }, { duration: 1, easing: "easeInSine" }),
      ]);
      return;
    }

    case "cpu:mbr.get": {
      const [reg] = parseRegister(event.register);
      await drawDataPath("MBR", reg);
      await activateRegister(`cpu.${reg}`);
      store.set(registerAtoms[event.register], store.get(MBRAtom));
      await Promise.all([deactivateRegister(`cpu.${reg}`), resetDataPath()]);
      return;
    }

    case "cpu:mbr.set": {
      const [reg] = parseRegister(event.register);
      await drawDataPath(reg, "MBR");
      await activateRegister("cpu.MBR");
      store.set(MBRAtom, store.get(registerAtoms[event.register]));
      await anim(
        "bus.data",
        { stroke: colors.mantis[400] },
        { duration: 5, easing: "easeOutSine" },
      );
      await Promise.all([deactivateRegister("cpu.MBR"), resetDataPath()]);
      return;
    }

    case "cpu:register.copy": {
      const [src] = parseRegister(event.src);
      const [dest] = parseRegister(event.dest);
      if (src !== dest) await drawDataPath(src, dest);
      await activateRegister(`cpu.${dest}`);
      // @ts-expect-error Registers types always match, see CPUMicroOperation
      store.set(registerAtoms[event.dest], store.get(registerAtoms[event.src]));
      await Promise.all([deactivateRegister(`cpu.${dest}`), src !== dest && resetDataPath()]);
      return;
    }

    case "cpu:register.update": {
      const [reg] = parseRegister(event.register);
      await activateRegister(`cpu.${reg}`);
      // @ts-expect-error The value type and the register type always match, see CPUMicroOperation
      store.set(registerAtoms[event.register], event.value);
      await deactivateRegister(`cpu.${reg}`);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
