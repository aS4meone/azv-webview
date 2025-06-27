import * as React from "react";
import { cn } from "@/lib/utils";

function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

function TableFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  );
}

function TableHead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

function TableCell({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

// Responsive Table for mobile
function ResponsiveTable({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table {...props}>{children}</Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">{children}</div>
    </div>
  );
}

// Mobile table card component
function MobileTableCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E8E8E8] rounded-lg p-4 space-y-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Mobile table row component
function MobileTableRow({
  label,
  value,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex justify-between items-center", className)}
      {...props}
    >
      <span className="text-sm text-[#454545] font-medium">{label}</span>
      <span className="text-sm text-[#191919]">{value}</span>
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  ResponsiveTable,
  MobileTableCard,
  MobileTableRow,
};
