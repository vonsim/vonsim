import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";

import { colors } from "@/lib/tailwind";
import { animationRefs } from "@/simulator/computer/shared/references";

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
    <svg viewBox="0 0 950 500" className={clsx("absolute h-[500px] w-[950px]", className)}>
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
  );
}
