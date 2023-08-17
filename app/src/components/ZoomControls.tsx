import type { RefObject } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

import { useTranslate } from "@/lib/i18n";

export function ZoomControls({ wrapperRef }: { wrapperRef: RefObject<ReactZoomPanPinchRef> }) {
  const translate = useTranslate();

  return (
    <div className="absolute right-2 top-2 flex flex-col rounded-lg border border-stone-600 bg-stone-900 shadow">
      <button
        className="m-0.5 flex h-8 w-8 items-center justify-center rounded-t-lg text-white transition-colors hover:enabled:bg-stone-800"
        onClick={() => wrapperRef.current?.zoomIn()}
        title={translate("control.zoom.in")}
      >
        <span className="icon-[lucide--zoom-in] h-4 w-4" />
      </button>
      <hr className="border-stone-600" />
      <button
        className="m-0.5 flex h-8 w-8 items-center justify-center rounded-b-lg text-white transition-colors hover:enabled:bg-stone-800"
        onClick={() => wrapperRef.current?.zoomOut()}
        title={translate("control.zoom.out")}
      >
        <span className="icon-[lucide--zoom-out] h-4 w-4" />
      </button>
    </div>
  );
}
