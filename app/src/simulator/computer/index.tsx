import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { SystemBus } from "@/simulator/computer/bus";

import { CPU } from "./cpu";
import { Memory } from "./memory";

export function ComputerContainer() {
  return (
    <TransformWrapper minScale={0.5} centerOnInit>
      <TransformComponent
        wrapperClass="!w-full !h-full"
        contentClass="relative !h-[700px] !w-[1200px] border-4 border-red-500"
      >
        <SystemBus className="left-[100px] top-[100px]" />
        <CPU className="left-[100px] top-[100px]" />
        <Memory className="left-[900px] top-[150px]" />
      </TransformComponent>
    </TransformWrapper>
  );
}
