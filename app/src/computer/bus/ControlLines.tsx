import clsx from "clsx";

import { animated, getSpring, SimplePathKey } from "@/computer/shared/springs";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

export function ControlLines() {
  const { devices } = useSimulation();

  const rdPath = [
    "M 380 420 H 800", // CPU -> Memory
    devices.hasIOBus && "M 780 420 V 805", // Down
    devices.hasIOBus && "M 450 805 H 900", // PIC to PIO/Handshake
    devices.hasIOBus && "M 583 805 V 875", // Timer
  ]
    .filter(Boolean)
    .join(" ");

  const wrPath = [
    "M 380 440 H 800", // CPU -> Memory
    devices.hasIOBus && "M 790 440 V 815", // Down
    devices.hasIOBus && "M 450 815 H 900", // PIC to PIO/Handshake
    devices.hasIOBus && "M 573 815 V 875", // Timer
  ]
    .filter(Boolean)
    .join(" ");

  const memPath = "M 750 545 H 860 V 460";

  return (
    <svg className="pointer-events-none absolute inset-0 z-[15] h-full w-full">
      <path className="fill-none stroke-stone-900 stroke-[6px]" strokeLinejoin="round" d={rdPath} />
      <animated.path
        className="fill-none stroke-[4px]"
        strokeLinejoin="round"
        d={rdPath}
        style={getSpring("bus.rd")}
      />

      <path className="fill-none stroke-stone-900 stroke-[6px]" strokeLinejoin="round" d={wrPath} />
      <animated.path
        className="fill-none stroke-[4px]"
        strokeLinejoin="round"
        d={wrPath}
        style={getSpring("bus.wr")}
      />

      {/* Chip select */}

      {devices.hasIOBus && (
        <>
          <ControlLine springs="bus.iom" d="M 380 460 H 675 V 525" />

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
        </>
      )}

      {devices.pic && <ControlLine springs="bus.pic" d="M 521 595 V 730 H 450" />}
      {devices.timer && <ControlLine springs="bus.timer" d="M 563 595 V 875" />}
      {devices.pio && <ControlLine springs="bus.pio" d="M 612 595 V 730 H 900" />}
      {devices.handshake && <ControlLine springs="bus.handshake" d="M 635 595 V 730 H 900" />}

      {/* CPU/PIC */}

      {devices.pic && (
        <>
          <ControlLine springs="bus.intr" d="M 110 700 V 470" />
          <ControlLine springs="bus.inta" d="M 160 470 V 700" />
        </>
      )}

      {/* Interrupt lines */}

      {devices.pic && devices.f10 && <ControlLine springs="bus.int0" d="M 145 950 V 900" />}
      {devices.pic && devices.timer && <ControlLine springs="bus.int1" d="M 500 955 H 400 V 900" />}
      {devices.pic && devices.handshake && (
        <ControlLine springs="bus.int2" d="M 930 866 V 1050 H 300 V 900" />
      )}

      {/* Other devices */}

      {devices.preset === "pio-switches-and-leds" && (
        <>
          <ControlLine springs="bus.switches->pio" d="M 1300 768 H 1120" />
          <ControlLine springs="bus.pio->leds" d="M 1120 858 H 1300" />
        </>
      )}

      {devices.preset === "pio-printer" && (
        <>
          <ControlLine springs="bus.printer.strobe" d="M 1120 767 H 1250" />
          <ControlLine springs="bus.printer.busy" d="M 1250 782 H 1120" />
          <ControlLine springs="bus.printer.data" d="M 1120 837 H 1250" />
        </>
      )}

      {devices.preset === "handshake" && (
        <>
          <ControlLine springs="bus.printer.strobe" d="M 1120 767 H 1250" />
          <ControlLine springs="bus.printer.busy" d="M 1250 782 H 1120" />
          <ControlLine springs="bus.printer.data" d="M 1120 837 H 1250" />
        </>
      )}
    </svg>
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

/**
 * Legends are not inside the SVG as `<text>` elements because of a bug
 * in Chrome that causes these text to render in another position when
 * zooming in/out. Maybe related to this https://bugs.webkit.org/show_bug.cgi?id=202588
 */
export function ControlLinesLegends() {
  const translate = useTranslate();
  const { devices } = useSimulation();

  return (
    <>
      <ControlLineLegend className="left-[384px] top-[403px]">rd</ControlLineLegend>
      <ControlLineLegend className="left-[384px] top-[423px]">wr</ControlLineLegend>
      {devices.hasIOBus && (
        <>
          <ControlLineLegend className="left-[384px] top-[443px]">io/m</ControlLineLegend>
          <ControlLineLegend className="left-[715px] top-[538px]">
            {translate("computer.chip-select.mem")}
          </ControlLineLegend>
        </>
      )}

      {devices.pic && (
        <ControlLineLegend className="left-[510px] top-[573px]">
          {translate("computer.chip-select.pic")}
        </ControlLineLegend>
      )}
      {devices.timer && (
        <ControlLineLegend className="left-[545px] top-[573px]">
          {translate("computer.chip-select.timer")}
        </ControlLineLegend>
      )}
      {devices.pio && (
        <ControlLineLegend className="left-[600px] top-[573px]">
          {translate("computer.chip-select.pio")}
        </ControlLineLegend>
      )}
      {devices.handshake && (
        <ControlLineLegend className="left-[600px] top-[573px]">
          {translate("computer.chip-select.handshake")}
        </ControlLineLegend>
      )}

      {devices.pic && (
        <>
          <ControlLineLegend className="left-[75px] top-[478px]">intr</ControlLineLegend>
          <ControlLineLegend className="left-[125px] top-[478px]">inta</ControlLineLegend>
        </>
      )}

      {devices.printer && (
        <>
          <ControlLineLegend className="left-[1260px] top-[758px]">strobe</ControlLineLegend>
          <ControlLineLegend className="left-[1260px] top-[773px]">busy</ControlLineLegend>
          <ControlLineLegend className="left-[1260px] top-[828px]">data</ControlLineLegend>
        </>
      )}
    </>
  );
}

function ControlLineLegend({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "pointer-events-none absolute z-[15] block font-mono text-xs font-bold tracking-wider text-stone-400",
        className,
      )}
    >
      {children}
    </span>
  );
}
