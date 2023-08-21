import * as ToastPrimitives from "@radix-ui/react-toast";
import clsx from "clsx";
import { forwardRef } from "react";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={clsx(
      "fixed inset-x-0 top-12 z-[100] mx-auto flex max-h-screen w-full flex-col p-4 md:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

export type ToastVariant = "error" | "default";

const Toast = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & { variant?: ToastVariant }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      data-variant={variant}
      className={clsx(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-top-full",
        variant === "default" && "border border-stone-600 bg-stone-900 text-white",
        variant === "error" && "group bg-red-900 text-red-50",
        className,
      )}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={clsx(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-mantis-500 px-3 text-sm font-medium ring-offset-stone-900 transition-colors hover:bg-mantis-400 focus:outline-none focus:ring-2 focus:ring-stone-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "group-data-[variant=error]:border group-data-[variant=error]:border-white/40 group-data-[variant=error]:hover:border-white/30  group-data-[variant=error]:hover:bg-red-700 group-data-[variant=error]:hover:text-white group-data-[variant=error]:focus:ring-white",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={clsx(
      "text-current/50 absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:text-current focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-data-[variant=error]:text-red-300 group-data-[variant=error]:hover:text-red-50 group-data-[variant=error]:focus:ring-red-400 group-data-[variant=error]:focus:ring-offset-red-600",
      className,
    )}
    toast-close=""
    {...props}
  >
    <span className="icon-[lucide--x] block h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={clsx("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={clsx("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  Toast,
  ToastAction,
  type ToastActionElement,
  ToastClose,
  ToastDescription,
  type ToastProps,
  ToastProvider,
  ToastTitle,
  ToastViewport,
};
