"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { normalize } from "@/lib/helper/bignumber";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/helper/number";
import FallbackImage from "@/components/fallback-image";

import { DataTableColumnHeader } from "./column-header";

import { BondType } from "@/types/api/bond.type";

export function columns(): ColumnDef<BondType>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="justify-start pl-5"
          column={column}
          title="Name"
        />
      ),
      cell: ({ row }) => {
        const name = row.original.name;

        return (
          <div className="flex justify-start items-center gap-2 py-3 pl-7">
            <div className="flex flex-row items-center gap-1">
              <FallbackImage
                alt="Token Image"
                className="size-6 rounded-full"
                height={24}
                src="/usdt.png"
                width={24}
              />
              <span>{name}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "yield",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="justify-center"
          column={column}
          title="Yield"
        />
      ),
      cell: ({ row }) => {
        const yieldValue = row.original.yieldValue;

        return (
          <div className="flex justify-center items-center gap-2 py-3">
            <span>
              {formatNumber(normalize(yieldValue, 0), { decimals: 2 })}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "tvl",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="justify-center"
          column={column}
          title="Total Raise"
        />
      ),
      cell: ({ row }) => {
        const tvl = Number(row.original.tvl);

        return (
          <div className="flex justify-center items-center gap-2 py-3">
            <span>${formatNumber(normalize(tvl, 6), { decimals: 2 })}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "buy_price",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="justify-center"
          column={column}
          title="Current Price"
        />
      ),
      cell: ({ row }) => {
        const buyPrice = row.original.buyPrice?.priceRate;

        return (
          <div className="flex justify-center items-center gap-2 py-3">
            <span>
              ${formatNumber(normalize(buyPrice ?? 0, 0), { decimals: 2 })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "settlement_date",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="justify-center"
          column={column}
          title="Due At"
        />
      ),
      cell: ({ row }) => {
        const settlementDate = row.original.settlementDate;

        return (
          <div className="flex justify-center items-center gap-2 py-3">
            <span>
              {settlementDate
                ? new Date(settlementDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "due_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="justify-center"
          column={column}
          title="Maturity Date"
        />
      ),
      cell: ({ row }) => {
        const dueAt = row.original.dueAt;

        return (
          <div className="flex justify-center items-center gap-2 py-3 pr-9">
            <span>{dueAt ? new Date(dueAt).toLocaleDateString() : "N/A"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="justify-center"
          column={column}
          title="Status"
        />
      ),
      cell: ({ row }) => {
        const is_active = row.original.isActive;

        return (
          <div className="flex justify-center items-center gap-2 py-3 pr-9">
            <span>{is_active ? "Active" : "Inactive"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="justify-end"
          column={column}
          title="Action"
        />
      ),
      cell: () => {
        return (
          <div className="flex justify-end items-center gap-2 py-3 pr-9">
            <Button variant="outline">See Details</Button>
          </div>
        );
      },
    },
  ];
}
