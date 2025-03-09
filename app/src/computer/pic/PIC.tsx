import { Register } from "@/computer/shared/Register";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

import { IMRAtom, IRRAtom, ISRAtom, linesAtoms } from "./state";

export function PIC() {
  const translate = useTranslate();
  const { devices } = useSimulation();

  if (!devices.pic) return null;

  return (
    <div className="**:z-20 absolute left-0 top-[700px] z-10 flex h-[200px] w-[450px] flex-col rounded-lg border border-stone-600 bg-stone-900">
      <div className="flex items-start">
        <span className="bg-mantis-500 block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 px-2 py-1 text-2xl text-white">
          {translate("computer.pic")}
        </span>

        <div className="flex h-16 grow items-center justify-evenly">
          <Register
            name="IMR"
            title={translate("generics.io-register", "IMR", 0x21)}
            valueAtom={IMRAtom}
            springs="pic.IMR"
            emphasis
          />
          <Register
            name="IRR"
            title={translate("generics.io-register", "IRR", 0x22)}
            valueAtom={IRRAtom}
            springs="pic.IRR"
            emphasis
          />
          <Register
            name="ISR"
            title={translate("generics.io-register", "ISR", 0x23)}
            valueAtom={ISRAtom}
            springs="pic.ISR"
            emphasis
          />
        </div>
      </div>

      <hr className="mb-2 border-stone-600" />

      <div className="grid size-full grid-cols-4 items-center">
        {linesAtoms.map((atom, i) => (
          <Register
            key={i}
            name={`INT${i}`}
            title={translate("generics.io-register", `INT${i}`, 0x24 + i)}
            valueAtom={atom}
            springs={`pic.INT${i}` as "pic.INT0"}
            className="mx-auto"
          />
        ))}
      </div>
    </div>
  );
}
