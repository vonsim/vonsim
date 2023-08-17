import { animated, getSpring } from "@/computer/shared/springs";

export function DataLines() {
  const addressPath = [
    "M 699 349 H 800", // CPU -> Memory
    "M 725 349 V 770", // Down
    "M 450 770 H 900", // PIC to PIO/Handshake
    "M 618 770 V 875", // Timer
  ].join(" ");

  const dataPath = [
    "M 687 249 H 800", // CPU -> Memory
    "M 765 249 V 790", // Down
    "M 450 790 H 900", // PIC to PIO/Handshake
    "M 598 790 V 875", // Timer
  ].join(" ");

  return (
    <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full">
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
