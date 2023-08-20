import { toast, Toaster } from "sonner";

export function Notifications() {
  return <Toaster position="top-center" />;
}

type NotifyConfig = {
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  duration?: number;
  id?: string | number;
};

const notify = (message: string, { action, description, ...config }: NotifyConfig = {}) =>
  toast.custom(
    t => (
      <div className="relative flex w-full items-center rounded-lg border border-stone-600 bg-stone-900 p-4 font-sans text-sm text-white">
        <div className="grow">
          <p className="font-medium">{message}</p>
          {description && <p className="font-normal text-stone-200">{description}</p>}
        </div>
        {action && (
          <button className="rounded-lg bg-mantis-500 px-2 py-1" onClick={action.onClick}>
            {action.label}
          </button>
        )}

        <button
          className="absolute -right-2.5 -top-2.5 flex items-center justify-center rounded-full bg-stone-800 p-1"
          onClick={() => toast.dismiss(t)}
        >
          <span className="icon-[lucide--x] h-3 w-3" />
        </button>
      </div>
    ),
    { className: "w-full", duration: config.duration, id: config.id },
  );

notify.error = (message: string, { action, description, ...config }: NotifyConfig = {}) =>
  toast.custom(
    t => (
      <div className="relative flex w-full items-center rounded-lg border border-red-800 bg-red-950 p-4 font-sans text-sm text-red-50">
        <span className="icon-[lucide--alert-circle] mr-2 h-5 w-5" />
        <div className="grow">
          <p className="font-medium">{message}</p>
          {description && <p className="font-normal text-red-200">{description}</p>}
        </div>
        {action && (
          <button className="rounded-lg bg-red-700 px-2 py-1" onClick={action.onClick}>
            {action.label}
          </button>
        )}

        <button
          className="absolute -right-2.5 -top-2.5 flex items-center justify-center rounded-full bg-red-700 p-1"
          onClick={() => toast.dismiss(t)}
        >
          <span className="icon-[lucide--x] h-3 w-3" />
        </button>
      </div>
    ),
    { className: "w-full", ...config },
  );

export { notify };
