import { animated, easings, useSpring } from "@react-spring/web";
import type { PhysicalRegister } from "@vonsim/simulator/cpu";
import clsx from "clsx";
import { useAtomValue } from "jotai";

import { colors } from "@/lib/tailwind";
import { animationRefs } from "@/simulator/computer/references";

import { registerAtoms } from "./state";

export function CPU({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative h-[500px] w-[650px] rounded-lg border border-stone-600 bg-stone-900">
        <span className="block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-lime-700 px-2 py-1 text-3xl font-bold text-white">
          CPU
        </span>

        <Bus />

        <Reg name="left" className="left-[60px] top-[70px]" />
        <Reg name="right" className="left-[60px] top-[130px]" />
        <Reg name="result" className="left-[300px] top-[100px]" />

        <ALU />

        <Reg name="AX" emphasis className="left-[520px] top-[30px]" />
        <Reg name="BX" emphasis className="left-[520px] top-[70px]" />
        <Reg name="CX" emphasis className="left-[520px] top-[110px]" />
        <Reg name="DX" emphasis className="left-[520px] top-[150px]" />
        <Reg name="id" className="left-[520px] top-[190px]" />

        <Reg name="MBR" className="right-[-38px] top-[233px]" />

        <Reg name="IR" className="left-[171px] top-[270px]" />

        <Decoder />

        <Reg name="IP" emphasis className="left-[450px] top-[292px]" />
        <Reg name="SP" emphasis className="left-[450px] top-[332px]" />
        <Reg name="ri" className="left-[450px] top-[372px]" />

        <Reg name="MAR" className="right-[-51px] top-[333px]" />
      </div>
    </div>
  );
}

function Bus() {
  const { strokeDashoffset, opacity, path } = useSpring({
    ref: animationRefs.cpu.highlightPath,
    from: { strokeDashoffset: 1, opacity: 1, path: "" },
    config: { easing: easings.easeInOutSine },
  });

  return (
    <svg viewBox="0 0 650 500" className="absolute inset-0">
      <path
        className="fill-none stroke-stone-700 stroke-[10px]"
        strokeLinejoin="round"
        d={[
          // ALU registers
          "M 60 85 H 30", // left
          "V 250 H 610", // Long path to MBR, here to get nice joins
          "M 60 145 H 30", // right
          "M 370 130 V 250", // result
          "M 250 225 V 250", // flags
          // Internal ALU
          "M 173 85 H 220", // left
          "M 182 145 H 220", // right
          "M 273 115 h 28", // result
          "M 250 145 v 46", // flags
          // Decoder
          "M 205 250 V 272", // IP
          "M 205 300 V 320", // IP->decoder
          // Address registers
          "M 451 388 H 421", // ri
          "V 250", // Long path to MBR, here to get nice joins
          "M 451 349 H 421", // SP
          "M 451 309 H 421", // IP
          // MAR bus
          "M 551 309 H 575 V 349", // IP
          "M 551 349 H 575", // SP
          "M 544 388 H 575 V 349", // ri
          "M 551 349 H 598", // Connection to MAR
          // Data registers
          "M 522 45 H 492", // AX
          "V 250", // Long path to MBR, here to get nice joins
          "M 522 85 H 492", // BX
          "M 522 125 H 492", // CX
          "M 522 165 H 492", // DX
          "M 522 205 H 492", // id
        ].join(" ")}
      />

      <animated.path
        d={path}
        className="fill-none stroke-lime-500 stroke-[10px]"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={strokeDashoffset}
        style={{ opacity }}
      />
    </svg>
  );
}

function Reg({
  name,
  emphasis = false,
  className,
}: {
  name: PhysicalRegister | "MAR" | "MBR";
  emphasis?: boolean;
  className?: string;
}) {
  const reg = useAtomValue(registerAtoms[name]);
  const low = reg.low;
  const high = reg.is16bits() ? reg.high : null;

  const style = useSpring({
    ref: animationRefs.cpu[name],
    from: { backgroundColor: colors.stone[800] },
    config: { easing: easings.easeOutQuart },
  });

  return (
    <animated.div
      className={clsx(
        "absolute flex w-min items-center rounded-md border bg-stone-800 px-2 py-1 font-mono leading-none",
        emphasis ? "border-lime-500 text-lg" : "border-stone-600 text-base",
        className,
      )}
      style={style}
    >
      <span className="mr-2 font-bold">{name}</span>
      {high && (
        <span className="mr-0.5 rounded bg-stone-900 p-0.5 font-light">{high.toString("hex")}</span>
      )}
      <span className="rounded bg-stone-900 p-0.5 font-light">{low.toString("hex")}</span>
    </animated.div>
  );
}

function ALU() {
  const FLAGS = useAtomValue(registerAtoms.FLAGS);

  // https://vonsim.github.io/docs/cpu/#flags
  const CF = FLAGS.bit(0);
  const ZF = FLAGS.bit(6);
  const SF = FLAGS.bit(7);
  const IF = FLAGS.bit(9);
  const OF = FLAGS.bit(11);

  const style = useSpring({
    ref: animationRefs.cpu.FLAGS,
    from: { backgroundColor: "rgb(41 37 36)" }, // theme(colors.stone.800)
    to: { backgroundColor: "rgb(132 204 22)" }, // theme(colors.lime.500)
    config: { easing: easings.easeOutQuart },
  });

  return (
    <>
      <svg className="absolute left-[215px] top-[60px] h-[110px] w-[110px]" viewBox="0 0 110 110">
        <path
          d="M 5 5 v 40 l 17.32 10 l -17.32 10 v 40 l 51.96 -30 v -40 Z"
          className="fill-stone-800 stroke-stone-600"
          strokeLinejoin="round"
        />
      </svg>

      <animated.div
        className="absolute left-[165px] top-[190px] flex w-min items-center gap-1 rounded-md border border-lime-500 bg-stone-800 px-2 py-1 font-mono leading-none"
        style={style}
      >
        <span className={clsx("rounded p-1 font-light", CF ? "bg-lime-500" : "bg-stone-900")}>
          CF
        </span>
        <span className={clsx("rounded p-1 font-light", ZF ? "bg-lime-500" : "bg-stone-900")}>
          ZF
        </span>
        <span className={clsx("rounded p-1 font-light", SF ? "bg-lime-500" : "bg-stone-900")}>
          SF
        </span>
        <span className={clsx("rounded p-1 font-light", IF ? "bg-lime-500" : "bg-stone-900")}>
          IF
        </span>
        <span className={clsx("rounded p-1 font-light", OF ? "bg-lime-500" : "bg-stone-900")}>
          OF
        </span>
      </animated.div>
    </>
  );
}

function Decoder() {
  return (
    <div className="absolute bottom-[30px] left-[30px] h-[150px] w-[350px] rounded-lg border border-stone-600 bg-stone-800"></div>
  );
}
