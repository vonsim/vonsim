import { animated, SpringRef, useSpring } from "@react-spring/web";
import clsx from "clsx";

import { colors } from "@/lib/tailwind";
import { animationRefs } from "@/simulator/computer/shared/references";

export type ControlLine = { strokeDashoffset: number; opacity: number };

export function ControlLines({ className }: { className?: string }) {
  const rdStyle = useSpring({
    ref: animationRefs.bus.rd,
    from: { stroke: colors.stone[700] },
  });

  const wrStyle = useSpring({
    ref: animationRefs.bus.wr,
    from: { stroke: colors.stone[700] },
  });

  const memStyle = useSpring({
    ref: animationRefs.bus.mem,
    from: { stroke: colors.red[500] },
  });

  const rdPath = [
    "M 380 420 H 820 V 400", // CPU -> Memory
    "M 820 420 V 805", // Down
    "M 450 805 H 999", // Big horizontal line
  ].join(" ");

  const wrPath = [
    "M 380 440 H 840 V 400", // CPU -> Memory
    "M 840 440 V 815", // Down
    "M 450 815 H 999", // Big horizontal line
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
        style={rdStyle}
      />

      <LineText x={384} y={435}>
        wr
      </LineText>
      <path className="fill-none stroke-stone-900 stroke-[6px]" strokeLinejoin="round" d={wrPath} />
      <animated.path
        className="fill-none stroke-[4px]"
        strokeLinejoin="round"
        d={wrPath}
        style={wrStyle}
      />

      <LineText x={384} y={455}>
        io/m
      </LineText>
      <ControlLine springRef={animationRefs.bus.iom} d="M 380 460 H 675 V 525" />

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
        style={memStyle}
      />

      <LineText x={510} y={585}>
        pic
      </LineText>
      <ControlLine springRef={animationRefs.bus.pic} d="M 521 595 V 730 H 450" />

      <LineText x={75} y={490}>
        intr
      </LineText>
      <ControlLine springRef={animationRefs.bus.intr} d="M 110 700 V 470" />

      <LineText x={125} y={490}>
        inta
      </LineText>
      <ControlLine springRef={animationRefs.bus.inta} d="M 160 470 V 700" />

      {/* Interrupt lines */}
      <ControlLine springRef={animationRefs.bus.int0} d="M 145 950 V 900" />
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

function ControlLine({ d, springRef }: { d: string; springRef: SpringRef<ControlLine> }) {
  const style = useSpring({
    ref: springRef,
    from: { strokeDashoffset: 1, opacity: 1 },
  });

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
        style={style}
      />
    </>
  );
}
