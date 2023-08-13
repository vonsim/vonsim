import clsx from "clsx";

import { Register } from "@/computer/shared/Register";
import { useDevices } from "@/hooks/useSettings";
import { useTranslate } from "@/hooks/useTranslate";

import { CAAtom, CBAtom, PAAtom, PBAtom } from "./state";

export function PIO({ className }: { className?: string }) {
  const translate = useTranslate();
  const devices = useDevices();

  if (devices !== "pio-switches-and-leds" && devices !== "pio-printer") return null;

  return (
    <div
      className={clsx(
        "absolute z-10 h-min w-[220px] rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20",
        className,
      )}
    >
      <span className="block h-min w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-2xl font-bold text-white">
        {translate("computer.pio.name")}
      </span>
      <hr className="border-stone-600" />
      <div className="flex w-full items-center justify-evenly py-4">
        <Register
          name="PA"
          title={translate("generics.io-register", "PA", 0x30)}
          valueAtom={PAAtom}
          springs="pio.PA"
        />
        <Register
          name="CA"
          title={translate("generics.io-register", "CA", 0x32)}
          valueAtom={CAAtom}
          springs="pio.CA"
        />
      </div>
      <hr className="border-stone-600" />
      <div className="flex w-full items-center justify-evenly py-4">
        <Register
          name="PB"
          title={translate("generics.io-register", "PB", 0x31)}
          valueAtom={PBAtom}
          springs="pio.PB"
        />
        <Register
          name="CB"
          title={translate("generics.io-register", "CB", 0x33)}
          valueAtom={CBAtom}
          springs="pio.CB"
        />
      </div>

      {/* <div className="flex h-full w-full flex-col items-center justify-evenly"></div> */}
    </div>
  );
}
