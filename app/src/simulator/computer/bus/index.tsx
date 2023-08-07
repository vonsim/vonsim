import { animated, SpringRef, useSpring } from "@react-spring/web";
import clsx from "clsx";

import { colors } from "@/lib/tailwind";
import { animationRefs } from "@/simulator/computer/shared/references";

export type ControlLine = { strokeDashoffset: number; opacity: number };

export function SystemBus({ className }: { className?: string }) {
  const addressStyle = useSpring({
    ref: animationRefs.bus.address,
    from: { stroke: colors.stone[700] },
  });

  const dataStyle = useSpring({
    ref: animationRefs.bus.data,
    from: { stroke: colors.stone[700] },
  });

  return (
    <>
      <svg
        viewBox="0 0 1000 1000"
        className={clsx("absolute z-[5] h-[1000px] w-[1000px]", className)}
      >
        {/* Address bus */}
        <animated.path
          className="fill-none stroke-[12px]"
          strokeLinejoin="round"
          d="M 699 349 H 800"
          style={addressStyle}
        />

        {/* Data bus */}
        <animated.path
          className="fill-none stroke-[12px]"
          strokeLinejoin="round"
          d="M 687 249 H 800"
          style={dataStyle}
        />
      </svg>

      <svg
        viewBox="0 0 1000 1000"
        className={clsx("absolute z-[15] h-[1000px] w-[1000px]", className)}
      >
        <LineText x={384} y={415}>
          rd
        </LineText>
        <ControlLine springRef={animationRefs.bus.rd} d="M 380 420 H 650" />

        <LineText x={384} y={435}>
          wr
        </LineText>
        <ControlLine springRef={animationRefs.bus.wr} d="M 380 440 H 650" />

        <LineText x={384} y={455}>
          io/m
        </LineText>
        <ControlLine springRef={animationRefs.bus.iom} d="M 380 460 H 650" />

        <LineText x={75} y={490}>
          intr
        </LineText>
        <ControlLine springRef={animationRefs.bus.intr} d="M 110 600 V 470" />

        <LineText x={125} y={490}>
          inta
        </LineText>
        <ControlLine springRef={animationRefs.bus.inta} d="M 160 470 V 600" />

        {/* Interrupt lines */}
        <ControlLine springRef={animationRefs.bus.int0} d="M 145 850 V 800" />
      </svg>
    </>
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
