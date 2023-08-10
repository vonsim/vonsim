import clsx from "clsx";

import { animated, getSpring, SimplePathKey } from "@/simulator/computer/shared/springs";

export function ControlLines({ className }: { className?: string }) {
  const rdPath = [
    "M 380 420 H 820 V 400", // CPU -> Memory
    "M 820 420 V 805", // Down
    "M 450 805 H 999", // Big horizontal line
    "M 583 805 V 875", // Timer
  ].join(" ");

  const wrPath = [
    "M 380 440 H 840 V 400", // CPU -> Memory
    "M 840 440 V 815", // Down
    "M 450 815 H 999", // Big horizontal line
    "M 573 815 V 875", // Timer
  ].join(" ");

  const memPath = "M 750 545 H 860 V 400";

  return (
    <svg
      viewBox="0 0 1500 1100"
      className={clsx("pointer-events-none absolute z-[15] h-[1100px] w-[1500px]", className)}
    >
      <LineText x={384} y={415}>
        rd
      </LineText>
      <path className="fill-none stroke-stone-900 stroke-[6px]" strokeLinejoin="round" d={rdPath} />
      <animated.path
        className="fill-none stroke-[4px]"
        strokeLinejoin="round"
        d={rdPath}
        style={getSpring("bus.rd")}
      />

      <LineText x={384} y={435}>
        wr
      </LineText>
      <path className="fill-none stroke-stone-900 stroke-[6px]" strokeLinejoin="round" d={wrPath} />
      <animated.path
        className="fill-none stroke-[4px]"
        strokeLinejoin="round"
        d={wrPath}
        style={getSpring("bus.wr")}
      />

      <LineText x={384} y={455}>
        io/m
      </LineText>
      <ControlLine springs="bus.iom" d="M 380 460 H 675 V 525" />

      <LineText x={715} y={550}>
        mem
      </LineText>
      <path
        className="fill-none stroke-stone-900 stroke-[6px]"
        strokeLinejoin="round"
        d={memPath}
      />
      <animated.path
        className="fill-none stroke-[4px]"
        strokeLinejoin="round"
        d={memPath}
        style={getSpring("bus.mem")}
      />

      <LineText x={510} y={585}>
        pic
      </LineText>
      <ControlLine springs="bus.pic" d="M 521 595 V 730 H 450" />

      <LineText x={545} y={585}>
        timer
      </LineText>
      <ControlLine springs="bus.timer" d="M 563 595 V 875" />

      <LineText x={75} y={490}>
        intr
      </LineText>
      <ControlLine springs="bus.intr" d="M 110 700 V 470" />

      <LineText x={125} y={490}>
        inta
      </LineText>
      <ControlLine springs="bus.inta" d="M 160 470 V 700" />

      {/* Interrupt lines */}
      <ControlLine springs="bus.int0" d="M 145 950 V 900" />
      <ControlLine springs="bus.int1" d="M 500 955 H 400 V 900" />
    </svg>
  );
}

function LineText({ x, y, children }: { x: number; y: number; children?: React.ReactNode }) {
  return (
    <text className="fill-stone-400 font-mono text-xs font-bold tracking-wider" x={x} y={y}>
      {children}
    </text>
  );
}

function ControlLine({ d, springs }: { d: string; springs: SimplePathKey }) {
  return (
    <>
      <path className="fill-none stroke-stone-900 stroke-[6px]" strokeLinejoin="round" d={d} />
      <path className="fill-none stroke-stone-700 stroke-[4px]" strokeLinejoin="round" d={d} />
      <animated.path
        d={d}
        className="fill-none stroke-red-500 stroke-[4px]"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        style={getSpring(springs)}
      />
    </>
  );
}
