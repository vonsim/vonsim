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
      <div className="rounded-b-lg border border-t-0 border-slate-200 bg-white px-4 py-2">
        {children}
      </div>
    </div>
  );
}
