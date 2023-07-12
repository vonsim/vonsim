import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  title,
  actions = [],
}: {
  children?: React.ReactNode;
  className?: string;
  title: string;
  actions?: { icon: string; title: string; onClick: () => void }[];
}) {
  return (
    <div
      className={cn(
        className,
        "h-min overflow-hidden rounded-lg border border-slate-200 bg-white bg-clip-content",
      )}
    >
      <p className="bg-accent/20 text-accent flex items-center gap-4 border-b border-slate-200 px-4 py-1 font-semibold tracking-wider">
        <span className="whitespace-nowrap">{title}</span>
        <span className="grow" />
        {actions.map(({ icon, title, onClick }, i) => (
          <button key={i} className="outline-accent h-5 w-5" onClick={onClick} title={title}>
            <span role="img" className={cn(icon, "h-full w-full")} />
          </button>
        ))}
      </p>
      {children}
    </div>
  );
}
