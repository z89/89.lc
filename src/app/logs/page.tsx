"use client";

import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";

import utc from "dayjs/plugin/utc";

// datejs configuration
dayjs.extend(advancedFormat);
dayjs.extend(duration);
dayjs.extend(localizedFormat);
dayjs.extend(utc);

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { LoadingDots } from "@/components/ui/loader";
import ErrorPage from "next/error";

export default function Page() {
  const params = useSearchParams();
  const code = params.get("code");

  const { data, isLoading, isError }: any = useQuery<any>({
    queryKey: [`${code}:data`],
    queryFn: async () => {
      const response = await fetch("/api/fetch/data", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code }),
      }).then((res) => res.json());

      if (response.error) {
        throw new Error();
      }

      return response;
    },
    retry: 2,
    gcTime: 2000,
    staleTime: 1000,
  });

  if (isLoading) return <LoadingDots invert={true} />;
  if (isError) return <ErrorPage statusCode={404} />;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl">
      <div className="flex h-1/5 bg-blue-200 w-full justify-between items-center">
        <h1 className="text-lg font-medium tracking-tight  text-slate-900">{data.root.origin}</h1>
        <h1 className="text-lg font-medium tracking-tight  text-slate-900">{data.root.destination}</h1>
        <h1 className="text-lg font-medium tracking-tight  text-slate-900">{data.root.visits}</h1>
      </div>
      <div className="flex flex-col gap-y-6 h-4/5 max-h-1/2 py-10">
        <p>Last 10 Entries</p>
        <Table className=" border border-collapse text-xs">
          <TableHeader>
            <TableRow className="border">
              <TableHead>Time</TableHead>
              <TableHead className="">IP</TableHead>
              <TableHead className="text-center whitespace-nowrap">Device</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="h-24 overflow-scroll">
            {data.data && data.data.length > 0 ? (
              data.data.map((record: any, idx: number) => {
                return (
                  <TableRow key={record.timestamp + idx}>
                    <TableCell className="whitespace-nowrap">{dayjs(record.timestamp).format("LTS, MMM Do, YYYY")}</TableCell>
                    <TableCell className="text-center">{record.ip}</TableCell>
                    <TableCell className="">{record.device}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell className="text-center text-muted-foreground" colSpan={4}>
                  No Visits
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
