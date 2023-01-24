export function Card({
  children,
  className,
  title,
}: {
  children?: React.ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <div className={className}>
      <p className="rounded-t-lg bg-slate-800 px-4 py-1 font-semibold tracking-wider text-white">
        {title}
      </p>
      <div className="overflow-hidden rounded-b-lg border border-t-0 border-slate-200 bg-white">
        {children}
      </div>
    </div>
  );
}
