import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/Toast";

import { useToast } from ".";

export function Toaster() {
  const { toastList } = useToast();

  return (
    <ToastProvider>
      {toastList.map(({ id, title, description, action, variant, otherProps }) => (
        <Toast key={id} {...otherProps} variant={variant}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
