"use client";

import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowUpDown, Cpu, ExternalLink } from "lucide-react";

import { useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import Image from "next/image";

type Address = {
  ip: string;
  isp: string;
  city: string;
  state: string;
  country: string;
  country_flag: string;
  postal_code: string;
  latitude: string;
  longitude: string;
};

type Device = {
  browser: string;
  machine: string;
  cpu: string;
};

export type Log = {
  timestamp: string;
  address: Address;
  device: Device;
  user_agent: string;
};

export const columns: ColumnDef<Log>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button className="text-xs" variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex justify-center items-center flex-col px-4 gap-y-1">
        <p className="font-medium">{dayjs(row.getValue("timestamp")).format("LTS")}</p>
        <p style={{ fontSize: "10px" }}>{dayjs(row.getValue("timestamp")).format("MMM Do, YYYY")}</p>
      </div>
    ),
  },
  {
    accessorKey: "address",
    header: ({ column }) => {
      return (
        <Button className="text-xs" variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          IP/Provider
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex justify-center items-center flex-col px-4 gap-y-1">
        <p className="font-medium">{row.original.address.ip}</p>
        <p style={{ fontSize: "10px" }}>{row.original.address.isp ?? "N/A"}</p>
      </div>
    ),
  },
  {
    accessorKey: "country",
    header: ({ column }) => {
      return (
        <Button className="text-xs" variant="ghost">
          Country
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex px-4 gap-x-3 items-center">
          <div className="w-8 h-auto">
            <Image alt="country flag" src={row.original.address.country_flag} width={1} height={1} layout="responsive" />
          </div>
          <div className="flex  flex-col justify-center ">
            <p className="font-medium">{row.original.address.city ?? "N/A"}</p>
            <p style={{ fontSize: "10px" }}>{row.original.address.country ?? "N/A"}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "device",
    header: ({ column }) => {
      return (
        <Button className="text-xs" variant="ghost">
          Browser/Device
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-y-2 items-center">
          <div className="flex gap-x-2 items-center">
            <div className="w-4 h-auto">
              <Image alt="country flag" src={`/images/${row.original.device.browser.toLowerCase()}.png`} width={1} height={1} layout="responsive" />
            </div>
            <p>{row.original.device.browser ?? "N/A"}</p>
          </div>
          <div className="flex gap-x-2 items-center">
            <div className="w-4 h-auto">
              <Image alt="country flag" src={`/images/${row.original.device.machine.toLowerCase()}.png`} width={1} height={1} layout="responsive" />
            </div>
            <p>{row.original.device.machine ?? "N/A"}</p>
            {row.original.device.cpu && (
              <div className="flex gap-x-1">
                <Cpu className="h-4 w-4" />
                <p>{row.original.device.cpu ?? "N/A"}</p>
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "raw",
    header: ({ column }) => {
      return (
        <Button className="text-xs" variant="ghost">
          User Agent
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-y-2 items-center">
          <textarea readOnly value={row.original.user_agent} className="max-h-36 min-h-8 border rounded-md p-2 bg-slate-100" />
        </div>
      );
    },
  },
  {
    accessorKey: "map",
    header: ({ column }) => {
      return (
        <Button className="text-xs" variant="ghost">
          Map
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <>
          {!row.original.address.latitude || !row.original.address.longitude ? (
            <div className="flex justify-center items-center">
              <p>N/A</p>
            </div>
          ) : (
            <div className="flex gap-x-1 justify-center items-center  text-blue-500 hover:text-blue-800">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${row.original.address.latitude},${row.original.address.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps
              </a>
              <ExternalLink className="inline" size={14} />
            </div>
          )}
        </>
      );
    },
  },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,
    state: {
      sorting,
    },
  });

  return (
    <div className="flex flex-col rounded-md p-2 pt-0 h-min border w-full">
      <div className="rounded-md overflow-auto">
        <Table className="text-xs">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-center" key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="text-xs overflow-auto">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow className="hover:cursor-pointer" key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No visits to URL
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
