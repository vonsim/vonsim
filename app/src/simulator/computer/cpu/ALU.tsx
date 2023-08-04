import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";
import { useAtomValue } from "jotai";

import { colors } from "@/lib/tailwind";
import { animationRefs } from "@/simulator/computer/references";

import { aluOperationAtom, registerAtoms } from "./state";

/**
 * ALU component, to be used inside <CPU />
 */
export function ALU() {
  const FLAGS = useAtomValue(registerAtoms.FLAGS);
  const operation = useAtomValue(aluOperationAtom);

  // https://vonsim.github.io/docs/cpu/#flags
  const CF = FLAGS.bit(0);
  const ZF = FLAGS.bit(6);
  const SF = FLAGS.bit(7);
  const IF = FLAGS.bit(9);
  const OF = FLAGS.bit(11);

  const flagsStyle = useSpring({
    ref: animationRefs.cpu.FLAGS,
    from: { backgroundColor: colors.stone[800] },
  });

  const operandsStyle = useSpring({
    ref: animationRefs.cpu.alu.operands,
    from: { strokeDashoffset: 1, opacity: 1 },
  });

  const operationStyle = useSpring({
    ref: animationRefs.cpu.alu.operation,
    from: { backgroundColor: colors.stone[800] },
  });

  const cogProps = useSpring({
    ref: animationRefs.cpu.alu.cog,
    from: { rot: 0 },
  });

  const resultsStyle = useSpring({
    ref: animationRefs.cpu.alu.results,
    from: { strokeDashoffset: 1, opacity: 1 },
  });

  return (
    <>
      <svg viewBox="0 0 650 500" className="absolute inset-0">
        <animated.path
          className="fill-none stroke-mantis-400 stroke-bus"
          strokeLinejoin="round"
          d="M 173 85 H 220"
          pathLength={1}
          strokeDasharray={1}
          style={operandsStyle}
        />
        <animated.path
          className="fill-none stroke-mantis-400 stroke-bus"
          strokeLinejoin="round"
          d="M 182 145 H 220"
          pathLength={1}
          strokeDasharray={1}
          style={operandsStyle}
        />
        <animated.path
          className="fill-none stroke-mantis-400 stroke-bus"
          strokeLinejoin="round"
          d="M 272 115 h 28"
          pathLength={1}
          strokeDasharray={1}
          style={resultsStyle}
        />
        <animated.path
          className="fill-none stroke-mantis-400 stroke-bus"
          strokeLinejoin="round"
          d="M 250 145 v 46"
          pathLength={1}
          strokeDasharray={1}
          style={resultsStyle}
        />

        {/* ALU */}
        <path
          d="M 220 65 v 40 l 17.32 10 l -17.32 10 v 40 l 51.96 -30 v -40 Z"
          className="fill-stone-800 stroke-stone-600"
          strokeLinejoin="round"
        />
      </svg>

      <animated.span
        className="icon-[lucide--settings] absolute left-[242px] top-[103px] block h-6 w-6 text-stone-300"
        style={{
          transform: cogProps.rot.to(t => `rotate(${t * 60}deg)`),
        }}
      />

      <animated.span
        className="absolute left-[260px] top-[50px] flex w-min items-center rounded-md border border-stone-600 px-2 py-1 font-mono leading-none"
        style={operationStyle}
      >
        {operation}
      </animated.span>

      {/* Flags */}
      <animated.div
        className="absolute left-[165px] top-[190px] flex w-min items-center gap-1 rounded-md border border-mantis-400 bg-stone-800 px-2 py-1 font-mono leading-none"
        style={flagsStyle}
      >
        <span className={clsx("rounded p-1 font-light", CF ? "bg-mantis-400" : "bg-stone-900")}>
          CF
        </span>
        <span className={clsx("rounded p-1 font-light", ZF ? "bg-mantis-400" : "bg-stone-900")}>
          ZF
        </span>
        <span className={clsx("rounded p-1 font-light", SF ? "bg-mantis-400" : "bg-stone-900")}>
          SF
        </span>
        <span className={clsx("rounded p-1 font-light", IF ? "bg-mantis-400" : "bg-stone-900")}>
          IF
        </span>
        <span className={clsx("rounded p-1 font-light", OF ? "bg-mantis-400" : "bg-stone-900")}>
          OF
        </span>
      </animated.div>
    </>
  );
}
