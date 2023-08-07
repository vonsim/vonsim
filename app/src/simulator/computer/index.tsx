import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { SystemBus } from "@/simulator/computer/bus";

import { CPU } from "./cpu";
import { F10 } from "./f10";
import { Memory } from "./memory";
import { PIC } from "./pic";
import { Timer } from "./timer";

// Notes about Z index:
// - The SystemBus should have a z-index of 5.
// - Components (CPU, Memory, etc) should have a z-index of 10.
// - Control lines that exit a component should have a z-index of 15.
// - Registers/subcomponents should have a z-index of 20.

export function ComputerContainer() {
  return (
    <TransformWrapper minScale={0.5} centerOnInit>
      <TransformComponent wrapperClass="!w-full !h-full" contentClass="!p-[100px]">
        <div className="relative h-[1000px] w-[1000px] border border-red-500">
          <SystemBus className="left-0 top-0" />
          <CPU className="left-0 top-0" />
          <Memory className="left-[800px] top-[50px]" />

          <PIC className="left-0 top-[600px]" />
          <Timer className="left-[800px] top-[50px]" />

          <F10 className="left-[50px] top-[850px]" />
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
