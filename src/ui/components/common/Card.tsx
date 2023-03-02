import { cn } from "@/ui/lib/utils";

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
      <p className="flex items-center gap-4 border-b border-slate-200 bg-accent/20 px-4 py-1 font-semibold tracking-wider text-accent">
        <span className="whitespace-nowrap">{title}</span>
        <span className="grow" />
        {actions.map(({ icon, title, onClick }, i) => (
          <button key={i} className={cn(icon, "h-5 w-5")} onClick={onClick} title={title} />
        ))}
      </p>
      {children}
    </div>
  );
}
