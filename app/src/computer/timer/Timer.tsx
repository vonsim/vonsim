import { Register } from "@/computer/shared/Register";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

import { COMPAtom, CONTAtom } from "./state";

export function Timer() {
  const translate = useTranslate();
  const { devices } = useSimulation();

  if (!devices.timer) return null;

  return (
    <div className="**:z-20 border-border bg-background-0 absolute left-[475px] top-[875px] z-10 flex h-[120px] w-[220px] rounded-lg border">
      <span className="bg-primary-0 border-border text-foreground block size-min rounded-br-lg rounded-tl-lg border-b border-r px-2 py-1 text-2xl">
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
