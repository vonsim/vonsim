import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";

import { colors } from "@/lib/tailwind";
import { animationRefs } from "@/simulator/computer/references";

export function SystemBus({ className }: { className?: string }) {
  const marStyle = useSpring({
    ref: animationRefs.bus.mar,
    from: { stroke: colors.stone[700] },
  });

  const mbrStyle = useSpring({
    ref: animationRefs.bus.mbr,
    from: { stroke: colors.stone[700] },
  });

  return (
    <svg viewBox="0 0 950 500" className={clsx("absolute h-[500px] w-[950px]", className)}>
      {/* MAR */}
      <animated.path
        className="fill-none stroke-[12px]"
        strokeLinejoin="round"
        d="M 699 349 H 800"
        style={marStyle}
      />

      {/* MBR */}
      <animated.path
        className="fill-none stroke-[12px]"
        strokeLinejoin="round"
        d="M 687 249 H 800"
        style={mbrStyle}
      />
    </svg>
  );
}
