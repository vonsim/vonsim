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

  const operandsProps = useSpring({
    ref: animationRefs.cpu.aluOperands,
    from: { strokeDashoffset: 1, opacity: 1 },
  });

  const operationProps = useSpring({
    ref: animationRefs.cpu.aluOperation,
    from: { backgroundColor: colors.stone[800] },
  });

  const cogProps = useSpring({
    ref: animationRefs.cpu.aluCog,
    from: { rot: 0 },
  });

  const resultsProps = useSpring({
    ref: animationRefs.cpu.aluResults,
    from: { strokeDashoffset: 1, opacity: 1 },
  });

  return (
    <>
      <svg viewBox="0 0 650 500" className="absolute inset-0">
        <animated.path
          className="stroke-bus fill-none stroke-lime-500"
          strokeLinejoin="round"
          d="M 173 85 H 220"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={operandsProps.strokeDashoffset}
          style={{ opacity: operandsProps.opacity }}
        />
        <animated.path
          className="stroke-bus fill-none stroke-lime-500"
          strokeLinejoin="round"
          d="M 182 145 H 220"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={operandsProps.strokeDashoffset}
          style={{ opacity: operandsProps.opacity }}
        />
        <animated.path
          className="stroke-bus fill-none stroke-lime-500"
          strokeLinejoin="round"
          d="M 272 115 h 28"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={resultsProps.strokeDashoffset}
          style={{ opacity: resultsProps.opacity }}
        />
        <animated.path
          className="stroke-bus fill-none stroke-lime-500"
          strokeLinejoin="round"
          d="M 250 145 v 46"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={resultsProps.strokeDashoffset}
          style={{ opacity: resultsProps.opacity }}
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
        style={operationProps}
      >
        {operation}
      </animated.span>

      {/* Flags */}
      <animated.div
        className="absolute left-[165px] top-[190px] flex w-min items-center gap-1 rounded-md border border-lime-500 bg-stone-800 px-2 py-1 font-mono leading-none"
        style={flagsStyle}
      >
        <span className={clsx("rounded p-1 font-light", CF ? "bg-lime-500" : "bg-stone-900")}>
          CF
        </span>
        <span className={clsx("rounded p-1 font-light", ZF ? "bg-lime-500" : "bg-stone-900")}>
          ZF
        </span>
        <span className={clsx("rounded p-1 font-light", SF ? "bg-lime-500" : "bg-stone-900")}>
          SF
        </span>
        <span className={clsx("rounded p-1 font-light", IF ? "bg-lime-500" : "bg-stone-900")}>
          IF
        </span>
        <span className={clsx("rounded p-1 font-light", OF ? "bg-lime-500" : "bg-stone-900")}>
          OF
        </span>
      </animated.div>
    </>
  );
}
