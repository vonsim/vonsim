import clsx from "clsx";
import { useAtomValue } from "jotai";

import { animated, getSpring } from "@/computer/shared/springs";

import { aluOperationAtom, registerAtoms } from "./state";

/**
 * ALU component, to be used inside <CPU />
 */
export function ALU() {
  const FLAGS = useAtomValue(registerAtoms.FLAGS);
  const operation = useAtomValue(aluOperationAtom);

  // https://vonsim.github.io/en/computer/cpu#flags
  const CF = FLAGS.bit(0);
  const ZF = FLAGS.bit(6);
  const SF = FLAGS.bit(7);
  const IF = FLAGS.bit(9);
  const OF = FLAGS.bit(11);

  return (
    <>
      <svg viewBox="0 0 650 500" className="pointer-events-none absolute inset-0">
        <animated.path
          className="stroke-primary-1 stroke-bus fill-none"
          strokeLinejoin="round"
          d="M 173 85 H 220"
          pathLength={1}
          strokeDasharray={1}
          style={getSpring("cpu.alu.operands")}
        />
        <animated.path
          className="stroke-primary-1 stroke-bus fill-none"
          strokeLinejoin="round"
          d="M 182 145 H 220"
          pathLength={1}
          strokeDasharray={1}
          style={getSpring("cpu.alu.operands")}
        />
        <animated.path
          className="stroke-primary-1 stroke-bus fill-none"
          strokeLinejoin="round"
          d="M 272 115 h 28"
          pathLength={1}
          strokeDasharray={1}
          style={getSpring("cpu.alu.results")}
        />
        <animated.path
          className="stroke-primary-1 stroke-bus fill-none"
          strokeLinejoin="round"
          d="M 250 145 v 46"
          pathLength={1}
          strokeDasharray={1}
          style={getSpring("cpu.alu.results")}
        />

        {/* ALU */}
        <path
          d="M 220 65 v 40 l 17.32 10 l -17.32 10 v 40 l 51.96 -30 v -40 Z"
          className="fill-background-1 stroke-background-3"
          strokeLinejoin="round"
        />
      </svg>

      <animated.span
        className="icon-[lucide--settings] absolute left-[242px] top-[103px] block size-6 text-stone-300"
        style={{
          transform: getSpring("cpu.alu.cog.rot").to(t => `rotate(${t * 60}deg)`),
        }}
      />

      <animated.span
        className="border-border absolute left-[260px] top-[50px] flex w-min items-center rounded-md border px-2 py-1 font-mono leading-none"
        style={getSpring("cpu.alu.operation")}
      >
        {operation}
      </animated.span>

      {/* Flags */}
      <animated.div
        className="border-primary-1 bg-background-1 absolute left-[165px] top-[190px] flex w-min items-center gap-1 rounded-md border px-2 py-1 font-mono leading-none"
        style={getSpring("cpu.FLAGS")}
      >
        <span
          className={clsx("rounded-sm p-1 font-light", CF ? "bg-primary-1" : "bg-background-0")}
        >
          CF
        </span>
        <span
          className={clsx("rounded-sm p-1 font-light", ZF ? "bg-primary-1" : "bg-background-0")}
        >
          ZF
        </span>
        <span
          className={clsx("rounded-sm p-1 font-light", SF ? "bg-primary-1" : "bg-background-0")}
        >
          SF
        </span>
        <span
          className={clsx("rounded-sm p-1 font-light", IF ? "bg-primary-1" : "bg-background-0")}
        >
          IF
        </span>
        <span
          className={clsx("rounded-sm p-1 font-light", OF ? "bg-primary-1" : "bg-background-0")}
        >
          OF
        </span>
      </animated.div>
    </>
  );
}
