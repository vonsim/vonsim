import { ReactNode } from "react";

import { cn } from "@/ui/lib/utils";

export type TableRootProps = { children?: ReactNode; className?: string };
export function TableRoot({ children, className }: TableRootProps) {
  return <table className={cn("font-mono", className)}>{children}</table>;
}

export type TableHeadProps = { children?: ReactNode; className?: string };
export function TableHead({ children, className }: TableHeadProps) {
  return (
    <thead>
      <tr className={cn("divide-x border-b", className)}>{children}</tr>
    </thead>
  );
}

export type TableColLabelProps = { children?: ReactNode; className?: string };
export function TableColLabel({ children, className }: TableColLabelProps) {
  return (
    <th className={cn("px-2 pb-0.5 pt-1 text-center font-bold text-slate-800", className)}>
      {children}
    </th>
  );
}

export type TableBodyProps = { children?: ReactNode; className?: string; divide?: boolean };
export function TableBody({ children, className, divide = true }: TableBodyProps) {
  return <tbody className={cn(divide && "divide-y", className)}>{children}</tbody>;
}

export type TableRowProps = { children?: ReactNode; className?: string };
export function TableRow({ children, className }: TableRowProps) {
  return <tr className={cn("divide-x", className)}>{children}</tr>;
}

export type TableRowLabelProps = { children?: ReactNode; className?: string };
export function TableRowLabel({ children, className }: TableRowLabelProps) {
  return (
    <td className={cn("px-2 py-0.5 text-center font-bold text-slate-800", className)}>
      {children}
    </td>
  );
}

export type TableCellProps = {
  children?: ReactNode;
  className?: string;
  renderMemory?: boolean;
  title?: string;
};
export function TableCell({ children, className, title }: TableCellProps) {
  return (
    <td
      className={cn("box-content px-2 py-0.5 text-center text-slate-600", className)}
      title={title}
    >
      {children}
    </td>
  );
}

export const Table = Object.assign(TableRoot, {
  Head: TableHead,
  ColLabel: TableColLabel,
  Body: TableBody,
  Row: TableRow,
  RowLabel: TableRowLabel,
  Cell: TableCell,
});
