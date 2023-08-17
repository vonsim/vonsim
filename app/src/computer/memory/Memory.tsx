import { MemoryAddress } from "@vonsim/common/address";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { Fragment, useCallback, useId, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { animated, getSpring } from "@/computer/shared/springs";
import { useTranslate } from "@/lib/i18n";

import { fixedAddressAtom, memoryShownAtom, operatingAddressAtom } from "./state";

export function Memory() {
  const translate = useTranslate();

  const memory = useAtomValue(memoryShownAtom);
  const operatingAddress = useAtomValue(operatingAddressAtom);
  const [fixedAddress, setFixedAddress] = useAtom(fixedAddressAtom);

  const inputId = useId();
  const [inputValue, setInputValue] = useState("");

  const updateFixedAddress = useCallback(() => {
    const match = /^(\d+)[Hh]?$/.exec(inputValue);
    if (!match || !match[1]) {
      toast.error(translate("computer.memory.address-must-be-integer"));
      return;
    }
    let value = parseInt(match[1], 16);
    if (value === MemoryAddress.MAX_ADDRESS + 1) {
      // Allow to set the address to the maximum address + 1
      // to quickly jump to the end of the memory
      value -= 1;
    } else if (!MemoryAddress.inRange(value)) {
      toast.error(translate("computer.memory.address-out-of-range"));
      return;
    }
    setFixedAddress(MemoryAddress.from(value));
  }, [translate, inputValue, setFixedAddress]);

  return (
    <div className="absolute left-[800px] top-0 z-10 h-[460px] w-[250px] rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20">
      <span className="block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-3xl font-bold text-white">
        {translate("computer.memory.name")}
      </span>

      <div className="mx-4 my-2">
        <Label htmlFor={inputId}>{translate("computer.memory.fix-address")}</Label>
        <div className="relative">
          <Input
            className="font-mono"
            placeholder="2000h"
            type="text"
            enterKeyHint="go"
            id={inputId}
            value={inputValue}
            onChange={ev => setInputValue(ev.currentTarget.value)}
            onKeyDown={ev => {
              if (ev.key === "Enter") updateFixedAddress();
            }}
          />
          <button
            title={translate("computer.memory.unfix-address")}
            className={clsx("absolute right-2 top-3", !fixedAddress && "hidden")}
            onClick={() => {
              setInputValue("");
              setFixedAddress(null);
            }}
          >
            <span className="icon-[lucide--x] h-4 w-4 text-stone-500 transition-colors hover:text-stone-300" />
          </button>
        </div>
      </div>

      <div className="m-4 w-min overflow-hidden rounded-lg border border-stone-600">
        <table className="font-mono text-lg">
          <tbody>
            {memory.map((row, i) => (
              <tr
                key={i}
                className="border-b border-stone-600 odd:bg-stone-900 even:bg-stone-800 last-of-type:border-b-0"
              >
                {row.map((cell, j) => (
                  <Fragment key={j}>
                    <animated.td
                      className="border-r border-stone-600 px-2 py-1 font-thin"
                      style={
                        cell.address.value === operatingAddress.value
                          ? getSpring("memory.operating-cell")
                          : undefined
                      }
                    >
                      {cell.address.toString()}
                    </animated.td>
                    <animated.td
                      title={translate("computer.memory.cell", cell.address)}
                      className="border-r border-stone-600 px-2 py-1 last-of-type:border-r-0"
                      style={
                        cell.address.value === operatingAddress.value
                          ? getSpring("memory.operating-cell")
                          : undefined
                      }
                    >
                      {cell.value.toString("hex")}
                    </animated.td>
                  </Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
