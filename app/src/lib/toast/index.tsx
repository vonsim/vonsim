import { useEffect, useState } from "react";

import type { ToastActionElement, ToastProps, ToastVariant } from "@/components/ui/Toast";

const TOAST_LIMIT = 1;
const TOAST_DEFAULT_DURATION = 5000;

export type ToastId = number;
export type ToastInput = {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
  duration?: number;
};
type Toast = ToastInput & { timeout: ReturnType<typeof setTimeout> | null; otherProps: ToastProps };

type Action =
  | { type: "ADD_TOAST"; toastId: ToastId; toast: ToastInput }
  | { type: "UPDATE_TOAST"; toastId: ToastId; toast: Partial<ToastInput> }
  | { type: "DISMISS_TOAST"; toastId: ToastId };

const toasts = new Map<ToastId, Toast>();

type ToastList = (Toast & { id: ToastId })[];
const listeners: ((toasts: ToastList) => void)[] = [];

function newToastId(): ToastId {
  let maxId: ToastId = 0;
  for (const id of toasts.keys()) {
    if (id > maxId) maxId = id;
  }
  return maxId + 1;
}

function oldestToastId(): ToastId {
  let minId: ToastId = Infinity;
  for (const id of toasts.keys()) {
    if (id < minId) minId = id;
  }
  return minId;
}

function dispatch(action: Action, triggerListeners = true) {
  switch (action.type) {
    case "ADD_TOAST": {
      const { toastId, toast } = action;
      const duration = toast.duration ?? TOAST_DEFAULT_DURATION;
      const timeout = Number.isFinite(duration)
        ? setTimeout(() => dispatch({ type: "DISMISS_TOAST", toastId }), duration)
        : null;
      toasts.set(toastId, {
        ...toast,
        timeout,
        otherProps: {
          open: true,
          onOpenChange: open => {
            if (!open) dispatch({ type: "DISMISS_TOAST", toastId });
          },
        },
      });
      if (toasts.size > TOAST_LIMIT) {
        dispatch({ type: "DISMISS_TOAST", toastId: oldestToastId() }, false);
      }
      break;
    }

    case "UPDATE_TOAST": {
      const { toastId, toast } = action;
      const oldToast = toasts.get(toastId);
      if (!oldToast) return;
      if (typeof toast.duration === "number") {
        if (oldToast.timeout !== null) clearTimeout(oldToast.timeout);
        const duration = toast.duration ?? TOAST_DEFAULT_DURATION;
        const timeout = Number.isFinite(duration)
          ? setTimeout(() => dispatch({ type: "DISMISS_TOAST", toastId }), duration)
          : null;
        toasts.set(toastId, { ...oldToast, ...toast, timeout });
      } else {
        toasts.set(toastId, { ...oldToast, ...toast });
      }
      break;
    }

    case "DISMISS_TOAST": {
      const { toastId } = action;
      const toast = toasts.get(toastId);
      if (!toast) return;
      if (toast.timeout !== null) clearTimeout(toast.timeout);
      toasts.delete(toastId);
      break;
    }

    default: {
      const _exhaustiveCheck: never = action;
      throw new Error(`Unhandled action: ${_exhaustiveCheck}`);
    }
  }

  if (triggerListeners && listeners.length > 0) {
    const orderedToasts = Array.from(toasts.entries())
      .map(([id, toast]) => ({ ...toast, id }))
      .sort((a, b) => b.id - a.id);

    for (const listener of listeners) {
      listener(orderedToasts);
    }
  }
}

export function toast(toast: ToastInput) {
  const toastId = newToastId();

  const update = (props: Partial<ToastInput>) =>
    dispatch({ type: "UPDATE_TOAST", toastId, toast: { ...props } });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId });

  dispatch({ type: "ADD_TOAST", toastId, toast });

  return {
    id: toastId,
    dismiss,
    update,
  };
}

export function useToast() {
  const [toastList, setToastList] = useState<ToastList>([]);

  useEffect(() => {
    listeners.push(setToastList);
    return () => {
      const index = listeners.indexOf(setToastList);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toastList,
    toast,
    dismiss: (toastId: ToastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}
