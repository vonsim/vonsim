import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";

import { animationRefs } from "@/simulator/computer/shared/references";

export function Clock({ className }: { className?: string }) {
  const { angle } = useSpring({
    ref: animationRefs.clock,
    from: { angle: 0 },
  });

  return (
    <div
      className={clsx(
        "absolute z-10 h-12 w-12 rounded-full border border-stone-600 bg-stone-900 p-1 [&_*]:z-20",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full fill-none stroke-white stroke-2"
      >
        <circle cx="12" cy="12" r="10" />
        <animated.line
          x1={angle.to(w => 12 + 6 * Math.sin((w * Math.PI) / 180))}
          y1={angle.to(w => 12 - 6 * Math.cos((w * Math.PI) / 180))}
          x2={12}
          y2={12}
        />
      </svg>
    </div>
  );
}
