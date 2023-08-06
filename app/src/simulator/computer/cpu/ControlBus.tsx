import { animated, useSpring } from "@react-spring/web";

import { animationRefs } from "@/simulator/computer/shared/references";

/**
 * ControlBus component, to be used inside <CPU />
 */
export function ControlBus() {
  const rdStyle = useSpring({
    ref: animationRefs.cpu.internalBus.rd,
    from: { width: 0, opacity: 1 },
  });

  const wrStyle = useSpring({
    ref: animationRefs.cpu.internalBus.wr,
    from: { width: 0, opacity: 1 },
  });

  const iomStyle = useSpring({
    ref: animationRefs.cpu.internalBus.iom,
    from: { width: 0, opacity: 1 },
  });

  return (
    <svg viewBox="0 0 650 500" className="absolute inset-0">
      <text className="fill-stone-400 font-mono text-xs font-bold tracking-wider" x={384} y={415}>
        rd
      </text>
      <line x1={380} y1={420} x2={650} y2={420} className="stroke-stone-700 stroke-[4px]" />
      <animated.line
        x1={380}
        y1={420}
        x2={rdStyle.width.to(t => 380 + t * (650 - 380))}
        y2={420}
        className="stroke-red-500 stroke-[4px]"
        style={{ opacity: rdStyle.opacity }}
      />

      <text className="fill-stone-400 font-mono text-xs font-bold tracking-wider" x={384} y={435}>
        wr
      </text>
      <line x1={380} y1={440} x2={650} y2={440} className="stroke-stone-700 stroke-[4px]" />
      <animated.line
        x1={380}
        y1={440}
        x2={wrStyle.width.to(t => 380 + t * (650 - 380))}
        y2={440}
        className="stroke-red-500 stroke-[4px]"
        style={{ opacity: wrStyle.opacity }}
      />

      <text className="fill-stone-400 font-mono text-xs font-bold tracking-wider" x={384} y={455}>
        io/m
      </text>
      <line x1={380} y1={460} x2={650} y2={460} className="stroke-stone-700 stroke-[4px]" />
      <animated.line
        x1={380}
        y1={460}
        x2={iomStyle.width.to(t => 380 + t * (650 - 380))}
        y2={460}
        className="stroke-red-500 stroke-[4px]"
        style={{ opacity: iomStyle.opacity }}
      />
    </svg>
  );
}
