import type { MARRegister } from "@vonsim/simulator/cpu";

import { animated, getSpring } from "@/computer/shared/springs";

export type { MARRegister as AddressRegister };

/**
 * Given an {@link MARRegister}, returns the shortest path between it
 * and the MAR register.
 * @returns The path as a SVG path.
 * @throws If there is the register isn't valid.
 */
export function generateAddressPath(from: MARRegister): string {
  switch (from) {
    case "IP":
      return "M 551 309 H 575 V 349 H 598";

    case "SP":
      return "M 551 349 H 598";

    case "ri":
      return "M 544 388 H 575 V 349 H 598";

    default:
      throw new Error(`Invalid register ${from}`);
  }
}

/**
 * AddressBus component, to be used inside <CPU />
 */
export function AddressBus() {
  const { path, ...style } = getSpring("cpu.internalBus.address");

  return (
    <svg viewBox="0 0 650 500" className="pointer-events-none absolute inset-0">
      <path
        className="stroke-bus stroke-background-2 fill-none"
        strokeLinejoin="round"
        d={[
          "M 551 309 H 575 V 349", // IP
          "M 551 349 H 575", // SP
          "M 544 388 H 575 V 349", // ri
          "M 551 349 H 598", // Connection to MAR
        ].join(" ")}
      />

      <animated.path
        d={path}
        className="stroke-bus fill-none stroke-blue-500"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        style={style}
      />
    </svg>
  );
}
