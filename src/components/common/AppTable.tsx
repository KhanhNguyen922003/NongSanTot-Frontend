import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type AppTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** Nội dung ô */
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export type AppTableProps<T> = {
  columns: AppTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  caption?: ReactNode;
};

/**
 * Table dùng chung: header cố định phong cách shadcn + hàng dữ liệu.
 * Phù hợp CRUD đơn giản; sort/virtualize có thể bọc TanStack sau nếu cần.
 */
export function AppTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyMessage = "Chưa có dữ liệu.",
  caption,
}: AppTableProps<T>) {
  return (
    <Table>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHead
              key={col.id}
              className={cn("whitespace-nowrap", col.headerClassName)}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              Đang tải...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((col) => (
                <TableCell key={col.id} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
