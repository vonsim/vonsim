import type { RefObject } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

import { useTranslate } from "@/lib/i18n";

export function ZoomControls({
  wrapperRef,
}: {
  wrapperRef: RefObject<ReactZoomPanPinchRef | null>;
}) {
  const translate = useTranslate();

  return (
    <div className="border-border bg-background-0 absolute right-2 top-2 flex flex-col rounded-lg border shadow-sm">
      <button
        className="hover:enabled:bg-background-1 text-foreground m-0.5 flex size-8 items-center justify-center rounded-t-lg transition-colors"
        onClick={() => wrapperRef.current?.zoomIn()}
        title={translate("control.zoom.in")}
      >
        <span className="icon-[lucide--zoom-in] size-4" />
      </button>
      <hr className="border-border" />
      <button
        className="hover:enabled:bg-background-1 text-foreground m-0.5 flex size-8 items-center justify-center rounded-b-lg transition-colors"
        onClick={() => wrapperRef.current?.zoomOut()}
        title={translate("control.zoom.out")}
      >
        <span className="icon-[lucide--zoom-out] size-4" />
      </button>
    </div>
  );
}
