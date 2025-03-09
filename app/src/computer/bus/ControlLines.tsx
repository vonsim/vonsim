import clsx from "clsx";

import { animated, getSpring, SimplePathKey } from "@/computer/shared/springs";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

export function ControlLines() {
  const { devices } = useSimulation();

  const rdPath = [
    "M 380 420 H 800", // CPU -> Memory
    devices.pic && "M 780 420 V 805 H 450",
    devices.pio && "M 780 420 V 705 H 900",
    devices.timer && "M 780 420 V 805 H 583 V 875",
    devices.handshake && "M 780 420 V 1015 H 900",
  ]
    .filter(Boolean)
    .join(" ");

  const wrPath = [
    "M 380 440 H 800", // CPU -> Memory
    devices.pic && "M 790 440 V 815 H 450",
    devices.pio && "M 790 440 V 715 H 900",
    devices.timer && "M 790 440 V 815 H 573 V 875",
    devices.handshake && "M 790 440 V 1025 H 900",
  ]
    .filter(Boolean)
    .join(" ");

  const memPath = "M 750 545 H 860 V 460";

  return (
    <svg className="pointer-events-none absolute inset-0 z-15 size-full">
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
      {devices.pio && <ControlLine springs="bus.pio" d="M 612 595 V 630 H 900" />}
      {devices.handshake && <ControlLine springs="bus.handshake" d="M 710 595 V 950 H 900" />}

      {/* CPU/PIC */}

      {devices.pic && (
        <>
          <ControlLine springs="bus.intr" d="M 110 700 V 470" />
          <ControlLine springs="bus.inta" d="M 160 470 V 700" />
        </>
      )}

      {/* Interrupt lines */}

      {devices.pic && devices.f10 && <ControlLine springs="bus.int0" d="M 145 950 V 900" />}
      {devices.pic && devices.timer && <ControlLine springs="bus.int1" d="M 475 955 H 400 V 900" />}
      {devices.pic && devices.handshake && (
        <ControlLine springs="bus.int2" d="M 900 1075 H 300 V 900" />
      )}

      {/* Other devices */}

      {devices.pio === "switches-and-leds" && (
        <>
          <ControlLine springs="bus.switches->pio" d="M 1300 668 H 1120" />
          <ControlLine springs="bus.pio->leds" d="M 1120 758 H 1300" />
        </>
      )}

      {devices.pio === "printer" && (
        <>
          <ControlLine springs="bus.printer.strobe" d="M 1120 667 H 1225 V 992 H 1300" />
          <ControlLine springs="bus.printer.busy" d="M 1300 1007 H 1210 V 682 H 1120" />
          <ControlLine springs="bus.printer.data" d="M 1120 737 H 1175 V 1062 H 1300" />
        </>
      )}

      {devices.handshake === "printer" && (
        <>
          <ControlLine springs="bus.printer.strobe" d="M 1120 992 H 1300" />
          <ControlLine springs="bus.printer.busy" d="M 1300 1007 H 1120" />
          <ControlLine springs="bus.printer.data" d="M 1120 1062 H 1300" />
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
        <ControlLineLegend className="left-[675px] top-[573px]">
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
          <ControlLineLegend className="left-[1310px] top-[983px]">strobe</ControlLineLegend>
          <ControlLineLegend className="left-[1310px] top-[998px]">busy</ControlLineLegend>
          <ControlLineLegend className="left-[1310px] top-[1053px]">data</ControlLineLegend>
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
        "pointer-events-none absolute z-15 block font-mono text-xs font-bold tracking-wider text-stone-400",
        className,
      )}
    >
      {children}
    </span>
  );
}
