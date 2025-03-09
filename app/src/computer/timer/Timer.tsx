import { Register } from "@/computer/shared/Register";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

import { COMPAtom, CONTAtom } from "./state";

export function Timer() {
  const translate = useTranslate();
  const { devices } = useSimulation();

  if (!devices.timer) return null;

  return (
    <div className="**:z-20 absolute left-[475px] top-[875px] z-10 flex h-[120px] w-[220px] rounded-lg border border-stone-600 bg-stone-900">
      <span className="bg-mantis-500 block size-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 px-2 py-1 text-2xl text-white">
        {translate("computer.timer")}
      </span>

      <div className="flex size-full flex-col items-center justify-evenly">
        <Register
          name="CONT"
          title={translate("generics.io-register", "CONT", 0x10)}
          valueAtom={CONTAtom}
          springs="timer.CONT"
        />
        <Register
          name="COMP"
          title={translate("generics.io-register", "COMP", 0x11)}
          valueAtom={COMPAtom}
          springs="timer.COMP"
        />
      </div>
    </div>
  );
}
