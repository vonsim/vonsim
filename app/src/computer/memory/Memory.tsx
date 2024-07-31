import { MemoryAddress } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useId, useState } from "react";
import { useKey } from "react-use";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { animated, getSpring } from "@/computer/shared/springs";
import { useTranslate } from "@/lib/i18n";
import { toast } from "@/lib/toast";

import { fixedAddressAtom, memoryShownAtom, operatingAddressAtom } from "./state";

export function Memory() {
  const translate = useTranslate();

  const memory = useAtomValue(memoryShownAtom);
  const halfMemory = Math.ceil(memory.length / 2);
  const operatingAddress = useAtomValue(operatingAddressAtom);
  const [fixedAddress, setFixedAddress] = useAtom(fixedAddressAtom);

  const inputId = useId();
  const [inputValue, setInputValue] = useState("");

  const updateFixedAddress = useCallback(() => {
    const match = /^([\da-f]+)h?$/i.exec(inputValue);
    if (!match || !match[1]) {
      toast({ title: translate("computer.memory.address-must-be-integer"), variant: "error" });
      return;
    }
    let value = parseInt(match[1], 16);
    if (value === MemoryAddress.MAX_ADDRESS + 1) {
      // Allow to set the address to the maximum address + 1
      // to quickly jump to the end of the memory
      value -= 1;
    } else if (!MemoryAddress.inRange(value)) {
      toast({ title: translate("computer.memory.address-out-of-range"), variant: "error" });
      return;
    }
    setFixedAddress(MemoryAddress.from(value));
  }, [translate, inputValue, setFixedAddress]);

  const pageUp = useCallback(() => {
    try {
      const current = fixedAddress ?? operatingAddress;
      let nextValue = current.value + memory.length;
      if (nextValue === MemoryAddress.MAX_ADDRESS + 1) nextValue -= 1;
      const next = MemoryAddress.from(nextValue);
      setInputValue(next.toString());
      setFixedAddress(next);
    } catch (error) {
      console.error("Invalid PageUp");
    }
  }, [operatingAddress, fixedAddress, setFixedAddress, memory.length]);
  useKey(
    "PageUp",
    ev => {
      ev.preventDefault();
      pageUp();
    },
    undefined,
    [pageUp],
  );

  const pageDown = useCallback(() => {
    try {
      const current = fixedAddress ?? operatingAddress;
      const next = MemoryAddress.from(current.value - memory.length);
      setInputValue(next.toString());
      setFixedAddress(next);
    } catch (error) {
      console.error("Invalid PageUp");
    }
  }, [operatingAddress, fixedAddress, setFixedAddress, memory.length]);
  useKey(
    "PageDown",
    ev => {
      ev.preventDefault();
      pageDown();
    },
    undefined,
    [pageUp],
  );

  return (
    <div className="absolute left-[800px] top-0 z-10 h-[460px] w-[250px] rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20">
      <span className="block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-3xl text-white">
        {translate("computer.memory.name")}
      </span>

      <div className="mx-4 my-2">
        <Label htmlFor={inputId}>{translate("computer.memory.fix-address")}</Label>
        <div className="mt-1 flex items-center gap-1">
          <button
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-mantis-500 px-2 text-sm text-white ring-offset-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mantis-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            disabled={memory.at(0)!.address.value === MemoryAddress.MIN_ADDRESS}
            title={translate("computer.memory.address-decrement")}
            onClick={pageDown}
          >
            <span className="icon-[lucide--chevron-left] size-4" />
          </button>
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
              <span className="icon-[lucide--x] size-4 text-stone-500 transition-colors hover:text-stone-300" />
            </button>
          </div>
          <button
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-mantis-500 px-2 text-sm text-white ring-offset-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mantis-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            disabled={memory.at(-1)!.address.value === MemoryAddress.MAX_ADDRESS}
            title={translate("computer.memory.address-decrement")}
            onClick={pageUp}
          >
            <span className="icon-[lucide--chevron-right] size-4" />
          </button>
        </div>
      </div>

      <div className="m-4 flex w-min items-start overflow-hidden rounded-lg border border-stone-600">
        <table className="border-r border-stone-600 font-mono text-lg">
          <tbody>
            {memory.slice(0, halfMemory).map((cell, i) => (
              <MemoryCell {...cell} key={i} />
            ))}
          </tbody>
        </table>
        <table className="font-mono text-lg">
          <tbody>
            {memory.slice(halfMemory).map((cell, i) => (
              <MemoryCell {...cell} key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MemoryCell({ address, value }: { address: MemoryAddress; value: Byte<8> }) {
  const translate = useTranslate();
  const operatingAddress = useAtomValue(operatingAddressAtom);

  const title = translate("computer.memory.cell", address);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <animated.tr
          title={title}
          className="cursor-pointer border-b border-stone-600 odd:bg-stone-900 even:bg-stone-800 last-of-type:border-b-0"
          style={
            address.value === operatingAddress.value
              ? getSpring("memory.operating-cell")
              : undefined
          }
        >
          <td className="border-r border-stone-600 px-2 py-1 font-thin">{address.toString()}</td>
          <td className="border-r border-stone-600 px-2 py-1 last-of-type:border-r-0">
            {value.toString("hex")}
          </td>
        </animated.tr>
      </PopoverTrigger>

      <PopoverContent className="w-60">
        <p className="px-4 py-2 font-medium text-white">{title}</p>
        <hr className="border-stone-600" />
        <ul className="px-4 py-2 text-sm">
          {(["hex", "bin", "uint", "int", "safe-ascii"] as const).map(rep => (
            <li key={rep}>
              <b className="font-medium">{translate(`generics.byte-representation.${rep}`)}</b>:{" "}
              <span className="font-mono text-mantis-400">{value.toString(rep)}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
