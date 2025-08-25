import { parseRegister } from "@vonsim/simulator/cpu/utils";

import { generateAddressPath } from "@/computer/cpu/AddressBus";
import {
  activateRegister,
  anim,
  deactivateRegister,
  turnLineOff,
  turnLineOn,
} from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";
import { finishSimulation, pauseSimulation } from "@/computer/simulation";
import { highlightLine } from "@/editor/methods";
import { store } from "@/lib/jotai";
import { colors } from "@/lib/tailwind";

import { DataRegister, generateDataPath } from "./DataBus";
import { aluOperationAtom, cycleAtom, MARAtom, MBRAtom, registerAtoms } from "./state";

const drawDataPath = (from: DataRegister, to: DataRegister) => {
  const path = generateDataPath(from, to);
  return anim(
    [
      { key: "cpu.internalBus.data.path", from: path },
      { key: "cpu.internalBus.data.opacity", from: 1 },
      { key: "cpu.internalBus.data.strokeDashoffset", from: 1, to: 0 },
    ],
    { duration: 5, easing: "easeInOutSine" },
  );
};

const resetDataPath = () =>
  anim({ key: "cpu.internalBus.data.opacity", to: 0 }, { duration: 1, easing: "easeInSine" });

export async function handleCPUEvent(event: SimulatorEvent<"cpu:">): Promise<void> {
  switch (event.type) {
    case "cpu:alu.execute": {
      const pathsDrawConfig = { duration: 3, easing: "easeInOutSine" } as const;

      await anim(
        [
          { key: "cpu.alu.operands.opacity", from: 1 },
          { key: "cpu.alu.operands.strokeDashoffset", from: 1, to: 0 },
        ],
        pathsDrawConfig,
      );
      store.set(aluOperationAtom, event.operation);
      await Promise.all([
        anim(
          { key: "cpu.alu.operation.backgroundColor", to: colors.primary1 },
          { duration: 1, easing: "easeOutQuart" },
        ),
        anim({ key: "cpu.alu.cog.rot", to: 6 }, { duration: 10, easing: "easeInOutCubic" }),
      ]);
      await Promise.all([
        anim(
          { key: "cpu.alu.operation.backgroundColor", to: colors.background1 },
          { duration: 1, easing: "easeOutQuart" },
        ),
        anim(
          [
            { key: "cpu.alu.results.opacity", from: 1 },
            { key: "cpu.alu.results.strokeDashoffset", from: 1, to: 0 },
          ],
          pathsDrawConfig,
        ),
      ]);
      await Promise.all([activateRegister("cpu.result"), activateRegister("cpu.FLAGS")]);
      store.set(registerAtoms.FLAGS, event.flags);
      store.set(registerAtoms.result, event.result);
      await Promise.all([deactivateRegister("cpu.result"), deactivateRegister("cpu.FLAGS")]);
      await anim(
        [
          { key: "cpu.alu.operands.opacity", to: 0 },
          { key: "cpu.alu.results.opacity", to: 0 },
        ],
        { duration: 1, easing: "easeInSine" },
      );
      return;
    }

    case "cpu:cycle.end":
      return;

    case "cpu:cycle.interrupt": {
      store.set(cycleAtom, prev => {
        if (!("metadata" in prev)) return prev;
        return { ...prev, phase: "interrupt" };
      });
      // Interrupts handler uses id and ri
      await anim(
        [
          { key: "cpu.id.opacity", to: 1 },
          { key: "cpu.ri.opacity", to: 1 },
        ],
        { duration: 0.5, easing: "easeInOutQuad" },
      );
      return;
    }

    case "cpu:cycle.start": {
      highlightLine(event.instruction.position.start);
      store.set(cycleAtom, { phase: "fetching", metadata: event.instruction });
      await anim(
        [
          { key: "cpu.id.opacity", to: event.instruction.willUse.id ? 1 : 0.4 },
          { key: "cpu.ri.opacity", to: event.instruction.willUse.ri ? 1 : 0.4 },
        ],
        { duration: 0.5, easing: "easeInOutQuad" },
      );
      return;
    }

    case "cpu:cycle.update": {
      store.set(cycleAtom, prev => {
        if (!("metadata" in prev)) return prev;
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
        [
          { key: "cpu.decoder.path.opacity", from: 1 },
          { key: "cpu.decoder.path.strokeDashoffset", from: 1, to: 0 },
        ],
        { duration: 3, easing: "easeInOutSine" },
      );
      await anim(
        [
          { key: "cpu.decoder.progress.opacity", from: 1 },
          { key: "cpu.decoder.progress.progress", from: 0, to: 1 },
        ],
        { duration: 3, easing: "easeInOutSine" },
      );
      await anim(
        [
          { key: "cpu.decoder.path.opacity", to: 0 },
          { key: "cpu.decoder.progress.opacity", to: 0 },
        ],
        { duration: 1, easing: "easeInSine" },
      );
      return;
    }

    case "cpu:error": {
      store.set(cycleAtom, { phase: "stopped", error: event.error });
      finishSimulation(event.error);
      return;
    }

    case "cpu:halt":
    case "cpu:int.0": {
      store.set(cycleAtom, { phase: "stopped" });
      finishSimulation();
      return;
    }

    case "cpu:int.3": {
      pauseSimulation();
      return;
    }

    case "cpu:int.6": {
      store.set(cycleAtom, { phase: "int6" });
      return;
    }

    case "cpu:int.7": {
      store.set(cycleAtom, { phase: "int7" });
      return;
    }

    case "cpu:inta.off": {
      await turnLineOff("bus.inta");
      return;
    }

    case "cpu:inta.on": {
      await turnLineOn("bus.inta", 10);
      return;
    }

    case "cpu:rd.on":
    case "cpu:wr.on": {
      const line = event.type.slice(4, 6) as "rd" | "wr";
      await anim(
        { key: `bus.${line}.stroke`, to: colors.red500 },
        { duration: 5, easing: "easeOutSine" },
      );
      return;
    }

    case "cpu:iom.on": {
      await turnLineOn("bus.iom", 15);
      return;
    }

    case "cpu:mar.set": {
      await anim(
        [
          { key: "cpu.internalBus.address.path", from: generateAddressPath(event.register) },
          { key: "cpu.internalBus.address.opacity", from: 1 },
          { key: "cpu.internalBus.address.strokeDashoffset", from: 1, to: 0 },
        ],
        { duration: 5, easing: "easeInOutSine" },
      );
      await activateRegister("cpu.MAR", colors.blue500);
      store.set(MARAtom, store.get(registerAtoms[event.register]));
      await anim(
        { key: "bus.address.stroke", to: colors.blue500 },
        { duration: 5, easing: "easeOutSine" },
      );
      await Promise.all([
        deactivateRegister("cpu.MAR"),
        anim(
          { key: "cpu.internalBus.address.opacity", to: 0 },
          { duration: 1, easing: "easeInSine" },
        ),
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
        { key: "bus.data.stroke", to: colors.primary1 },
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
