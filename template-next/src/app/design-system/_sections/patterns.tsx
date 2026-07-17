'use client'

import * as React from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'

function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()
  return <DatePicker value={date} onValueChange={setDate} />
}

type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

const PAYMENTS: Payment[] = [
  { id: 'INV001', amount: 316, status: 'success', email: 'ken99@example.com' },
  { id: 'INV002', amount: 242, status: 'pending', email: 'abe45@example.com' },
  { id: 'INV003', amount: 837, status: 'processing', email: 'monserrat44@example.com' },
  { id: 'INV004', amount: 721, status: 'failed', email: 'silas22@example.com' },
  { id: 'INV005', amount: 500, status: 'success', email: 'carmella@example.com' },
]

const STATUS_VARIANT: Record<
  Payment['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  success: 'default',
  processing: 'secondary',
  pending: 'outline',
  failed: 'destructive',
}

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue<Payment['status']>('status')
      return (
        <Badge variant={STATUS_VARIANT[status]} className="capitalize">
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue<number>('amount')
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]

function DataTableDemo() {
  const table = useReactTable({
    data: PAYMENTS,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 3 } },
  })

  return (
    <div className="w-full space-y-3">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default function PatternsSection() {
  return (
    <ComponentSection
      id="patterns"
      title="Patterns"
      description="Composed recipes built from the primitives above — not standalone installable components."
    >
      <Example title="Date Picker" description="Popover + Calendar">
        <DatePickerDemo />
      </Example>

      <Example title="Data Table" description="Table + @tanstack/react-table" className="w-full">
        <DataTableDemo />
      </Example>
    </ComponentSection>
  )
}
