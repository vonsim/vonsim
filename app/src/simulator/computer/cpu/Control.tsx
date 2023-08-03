import { animated, easings, useSpring, useTransition } from "@react-spring/web";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { useSpeeds } from "@/hooks/useSettings";
import { animationRefs } from "@/simulator/computer/references";

import { cycleAtom } from "./state";

/**
 * Control component, to be used inside <CPU />
 */
export function Control() {
  const cycle = useAtomValue(cycleAtom);
  const operandsText = useMemo(() => {
    if (!("metadata" in cycle)) return "";
    if (cycle.metadata.operands.length === 0) return "";

    if (cycle.phase === "fetching-operands") {
      let text = " __";
      for (let i = 1; i < cycle.metadata.operands.length; i++) {
        text += ", __";
      }
      return text;
    } else {
      return " " + cycle.metadata.operands.join(", ");
    }
  }, [cycle]);

  const { executionUnit } = useSpeeds();

  const transitions = useTransition(cycle.phase, {
    from: { transform: "translateY(-100%)" },
    enter: { transform: "translateY(0%)" },
    leave: { transform: "translateY(100%)" },
    config: { duration: 5 * executionUnit, easing: easings.easeOutElastic },
  });

  const decoderPathStyle = useSpring({
    ref: animationRefs.cpu.decoderPath,
    from: { strokeDashoffset: 1, opacity: 1 },
  });

  const decoderProgressStyle = useSpring({
    ref: animationRefs.cpu.decoderProgress,
    from: { progress: 0, opacity: 1 },
  });

  const rdStyle = useSpring({
    ref: animationRefs.cpu.rd,
    from: { strokeDashoffset: 1, opacity: 1 },
  });

  const wrStyle = useSpring({
    ref: animationRefs.cpu.wr,
    from: { strokeDashoffset: 1, opacity: 1 },
  });

  const iomStyle = useSpring({
    ref: animationRefs.cpu.iom,
    from: { strokeDashoffset: 1, opacity: 1 },
  });

  return (
    <>
      <svg viewBox="0 0 650 500" className="absolute inset-0">
        <animated.path
          className="stroke-bus fill-none stroke-lime-500"
          strokeLinejoin="round"
          d="M 205 300 V 320"
          pathLength={1}
          strokeDasharray={1}
          style={decoderPathStyle}
        />

        <text className="fill-stone-400 font-mono text-xs font-bold tracking-wider" x={384} y={415}>
          rd
        </text>
        <animated.path
          className="fill-none stroke-red-500 stroke-[4px]"
          d="M 380 420 H 650"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          style={rdStyle}
        />
        <text className="fill-stone-400 font-mono text-xs font-bold tracking-wider" x={384} y={435}>
          wr
        </text>
        <animated.path
          className="fill-none stroke-red-500 stroke-[4px]"
          d="M 380 440 H 650"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          style={wrStyle}
        />
        <text className="fill-stone-400 font-mono text-xs font-bold tracking-wider" x={384} y={455}>
          io/m
        </text>
        <animated.path
          className="fill-none stroke-red-500 stroke-[4px]"
          d="M 380 460 H 650"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          style={iomStyle}
        />
      </svg>

      <div className="absolute bottom-[172px] left-[30px] flex w-full items-start">
        <span className="block w-min whitespace-nowrap rounded-t-lg border border-b-0 border-stone-600 bg-lime-700 px-2 pb-3 pt-1 text-xs font-semibold tracking-wide text-white">
          Unidad de control
        </span>
      </div>

      <div className="absolute bottom-[30px] left-[30px] flex h-[150px] w-[350px] flex-col items-center rounded-lg border border-stone-600 bg-stone-800">
        <div className="overflow-hidden rounded-b-lg border border-t-0 border-stone-600 bg-stone-900 px-4">
          <span className="text-sm leading-none">Decodificador</span>
          <div className="my-1 h-1 w-full overflow-hidden rounded-full bg-stone-600">
            <animated.div
              className="h-full bg-lime-500"
              style={{
                width: decoderProgressStyle.progress.to(t => `${t * 100}%`),
                opacity: decoderProgressStyle.opacity,
              }}
            />
          </div>
        </div>

        <div className="relative mt-4 h-8 w-48 overflow-hidden rounded-lg border border-stone-600 bg-stone-900">
          {transitions((style, phase) => (
            <animated.div className="absolute inset-0 flex items-center" style={style}>
              <span className="w-full text-center align-middle text-sm leading-none">
                {phase === "fetching"
                  ? "Leyendo instrucción..."
                  : phase === "fetching-operands"
                  ? "Leyendo operandos..."
                  : phase === "executing"
                  ? "Ejecutando..."
                  : phase === "writeback"
                  ? "Escribiendo resultados..."
                  : phase === "interrupt"
                  ? "Manejando interrupción..."
                  : phase === "stopped"
                  ? "Detenido"
                  : null}
              </span>
            </animated.div>
          ))}
        </div>

        <div className="mt-4 w-64 overflow-hidden rounded-lg border border-stone-600 bg-stone-900 py-2">
          <p className="text-center font-mono">
            {cycle.phase === "fetching" || cycle.phase === "stopped" ? (
              <span className="font-bold italic text-stone-400">???</span>
            ) : (
              <>
                <span className="font-bold text-lime-500">{cycle.metadata.name}</span>
                <span className="text-white">{operandsText}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
