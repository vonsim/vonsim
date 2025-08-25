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
    <SliderPrimitive.Track className="bg-background-0 relative h-2 w-full grow overflow-hidden rounded-full">
      <SliderPrimitive.Range className="bg-primary-1 absolute h-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="bg-primary-1 focus-visible:outline-hidden ring-offset-background-1 border-background-0 focus-visible:ring-border block size-5 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
