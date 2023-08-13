import { useRef } from "react";
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { ZoomControls } from "@/components/ZoomControls";

import { SystemBus } from "./bus/SystemBus";
import { Clock } from "./clock/Clock";
import { Console } from "./console/Console";
import { CPU } from "./cpu/CPU";
import { F10 } from "./f10/F10";
import { Memory } from "./memory/Memory";
import { PIC } from "./pic/PIC";
import { Timer } from "./timer/Timer";

// Notes about Z index:
// - The SystemBus should have a z-index of 5.
// - Components (CPU, Memory, etc) should have a z-index of 10.
// - Control lines that exit a component should have a z-index of 15.
// - Registers/subcomponents should have a z-index of 20.

export function ComputerContainer() {
  const wrapperRef = useRef<ReactZoomPanPinchRef>(null);

  return (
    <div className="relative h-full w-full">
      <TransformWrapper minScale={0.5} initialPositionX={0} initialPositionY={0} ref={wrapperRef}>
        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!p-[100px]">
          <div className="relative h-[1100px] w-[1700px] border border-red-500">
            <SystemBus className="left-0 top-0" />

            <CPU className="left-0 top-0" />
            <Memory className="left-[800px] top-0" />

            <PIC className="left-0 top-[700px]" />
            <Timer className="left-[500px] top-[875px]" />

            <Clock className="left-[520px] top-[930px]" />
            <Console className="left-[1200px] top-0" />
            <F10 className="left-[50px] top-[950px]" />
          </div>
        </TransformComponent>
        <ZoomControls wrapperRef={wrapperRef} />
      </TransformWrapper>
    </div>
  );
}
