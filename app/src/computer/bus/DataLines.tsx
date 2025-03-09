import { animated, getSpring } from "@/computer/shared/springs";
import { useSimulation } from "@/computer/simulation";

export function DataLines() {
  const { devices } = useSimulation();

  const addressPath = [
    "M 699 349 H 800", // CPU -> Memory
    devices.pic && "M 725 349 V 770 H 450",
    devices.pio && "M 725 349 V 670 H 900",
    devices.timer && "M 725 349 V 770 H 618 V 875",
    devices.handshake && "M 725 349 V 980 H 900",
  ]
    .filter(Boolean)
    .join(" ");

  const dataPath = [
    "M 687 249 H 800", // CPU -> Memory
    devices.pic && "M 765 249 V 790 H 450",
    devices.pio && "M 765 249 V 690 H 900",
    devices.timer && "M 765 249 V 790 H 598 V 875",
    devices.handshake && "M 765 249 V 1000 H 900",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg className="pointer-events-none absolute inset-0 z-5 size-full">
      {/* Data lines */}
      <path
        className="fill-none stroke-stone-900 stroke-[14px]"
        strokeLinejoin="round"
        d={dataPath}
      />
      <animated.path
        className="fill-none stroke-[12px]"
        strokeLinejoin="round"
        d={dataPath}
        style={getSpring("bus.data")}
      />

      {/* Address lines */}
      <path
        className="fill-none stroke-stone-900 stroke-[14px]"
        strokeLinejoin="round"
        d={addressPath}
      />
      <animated.path
        className="fill-none stroke-[12px]"
        strokeLinejoin="round"
        d={addressPath}
        style={getSpring("bus.address")}
      />
    </svg>
  );
}
