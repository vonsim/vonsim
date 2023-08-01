import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { CPU } from "./cpu";

export function ComputerContainer() {
  return (
    <TransformWrapper>
      <TransformComponent wrapperClass="!h-full !w-full relative">
        <CPU className="h-full w-full" />
      </TransformComponent>
    </TransformWrapper>
  );
}
