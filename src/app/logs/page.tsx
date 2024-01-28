"use client";

import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import utc from "dayjs/plugin/utc";

// datejs configuration
dayjs.extend(advancedFormat);
dayjs.extend(duration);
dayjs.extend(localizedFormat);
dayjs.extend(utc);

// import { Table } from "@/components/ui/data-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingDots } from "@/components/ui/loader";
import ErrorPage from "next/error";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Copy, RefreshCcw } from "lucide-react";
import { DataTable, columns } from "./table";
import { useState } from "react";

export default function Page() {
  const params = useSearchParams();
  const code = params.get("code");

  const [isRefetching, setIsRefetching] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const router = useRouter();

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
    <div className="flex flex-col gap-y-10  h-full w-full justify-center items-center max-w-6xl">
      <div className="flex justify-between  items-center w-full ">
        <Button className="flex gap-x-2" onClick={() => router.back()}>
          <ChevronLeft size={18} className="-ml-2" />
          Back
        </Button>
        <Button
          disabled={isRefetching}
          onClick={() => {
            setIsRefetching(true);
            setTimeout(() => {
              setIsRefetching(false);
            }, 500);

            queryClient.invalidateQueries({ queryKey: [`${code}:data`] });
          }}
        >
          Refresh
          <RefreshCcw className={`ml-2 ${isRefetching && "animate-spin pointer-events-none"}`} size={14} />
        </Button>
      </div>
      <div className="flex w-full justify-between items-center">
        <Card className="bg-slate-100 shadow-none w-full ">
          <CardHeader className="flex gap-y-1">
            <CardTitle className="flex items-center gap-x-3">
              <a className="text-slate-900 hover:text-blue-600" target="_blank" rel="noopener noreferrer" href={data.root.origin}>
                {data.root.origin}
              </a>
              <Copy
                className="cursor-pointer text-slate-400 hover:text-slate-900"
                size={16}
                onClick={() => navigator.clipboard.writeText(data.root.origin)}
              />
            </CardTitle>
            <CardDescription className="text-xs">Shortened @ {dayjs(parseInt(data.root.created)).format("LTS, MMM, Do, YYYY")}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm flex  flex-col gap-y-1 ">
            <div className="flex justify-between gap-x-2">
              <p className="font-medium">Destination:</p>
              <a
                className="text-slate-700 hover:text-blue-600 overflow-hidden text-ellipsis"
                target="_blank"
                rel="noopener noreferrer"
                href={data.root.origin}
              >
                {data.root.destination}
              </a>
            </div>
            <div className="flex justify-between gap-x-2">
              <p className="font-medium">Visits:</p>
              <a className="text-slate-700 hover:text-blue-600" target="_blank" rel="noopener noreferrer" href={data.root.origin}>
                {data.root.visits}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex w-full h-full overflow-y-auto">
        <DataTable columns={columns} data={data.data} />
      </div>
    </div>
  );
}
