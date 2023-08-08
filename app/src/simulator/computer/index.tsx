import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { SystemBus } from "@/simulator/computer/bus";

import { Clock } from "./clock";
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
    <TransformWrapper minScale={0.5} initialPositionX={0} initialPositionY={0}>
      <TransformComponent wrapperClass="!w-full !h-full" contentClass="!p-[100px]">
        <div className="relative h-[1100px] w-[1500px] border border-red-500">
          <SystemBus className="left-0 top-0" />

          <CPU className="left-0 top-0" />
          <Memory className="left-[800px] top-0" />

          <PIC className="left-0 top-[700px]" />
          <Timer className="left-[500px] top-[875px]" />

          <Clock className="left-[520px] top-[930px]" />
          <F10 className="left-[50px] top-[950px]" />
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
