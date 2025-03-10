import * as SliderPrimitive from "@radix-ui/react-slider";
import clsx from "clsx";
import { forwardRef } from "react";

const Slider = forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={clsx("relative flex touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-stone-900">
      <SliderPrimitive.Range className="bg-mantis-400 absolute h-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="bg-mantis-400 focus-visible:outline-hidden block size-5 rounded-full border-2 border-stone-900 ring-offset-stone-800 transition-colors focus-visible:ring-2 focus-visible:ring-stone-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
