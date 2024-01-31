"use client";

import { Copy, ExternalLink, LinkIcon, RefreshCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loader";

export default function Page() {
  const [error, setError] = useState<{ isError: boolean; message: string }>({ isError: false, message: "" });
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [result, setResult] = useState<{ isSuccess: boolean; origin: string; destination: string }>({
    isSuccess: false,
    origin: "",
    destination: "",
  });

  const queryClient = useQueryClient();

  // fetch the origins (shortened urls)
  const [loading, setLoading] = useState<boolean>(false);
  const { data, isLoading, isError }: any = useQuery<any>({
    queryKey: ["urls"],
    queryFn: async () => {
      try {
        const res = localStorage.getItem("urls");

        if (!res) {
          localStorage.setItem("urls", JSON.stringify([]));
          return { urls: [] };
        }

        const response = await fetch("/api/fetch/origins", {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ origins: [...JSON.parse(res)] }),
        }).then((res) => res.json());

        if (response.error) {
          localStorage.setItem("urls", JSON.stringify([]));
          return { urls: [] };
        }

        return { urls: response.origins };
      } catch (e) {
        localStorage.setItem("urls", JSON.stringify([]));
        return { urls: [] };
      }
    },
    retry: 2,
    gcTime: 2000,
    staleTime: 1000,
  });

  const router = useRouter();

  const shortenURL = async (e: any) => {
    try {
      setError({ isError: false, message: "" });
      setResult({ isSuccess: false, origin: "", destination: "" });
      setLoading(true);

      e.preventDefault();
      const response = await fetch("/api/create", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ destination: e.target.url.value }),
      }).then((res) => res.json());

      // check if response is an error
      if (response.error) {
        switch (response.error) {
          case "INVALID-URL":
            setError({ isError: true, message: "The URL is invalid. Please try again." });
            break;
          default:
            setError({ isError: true, message: "An unknown error occurred. Please try again." });
            break;
        }

        return;
      }

      setResult({ isSuccess: true, origin: response.origin, destination: response.destination });

      const oldData: any = queryClient.getQueryData(["urls"]);
      const newData = oldData.urls.filter((record: any) => record.origin !== response.origin);

      queryClient.setQueryData(["urls"], { urls: [response, ...newData] });

      localStorage.setItem("urls", JSON.stringify([response, ...newData]));
    } catch (e) {
      setError({ isError: true, message: "An unknown error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl">
      <div className="flex flex-col h-1/2 w-full justify-end items-center gap-y-8">
        <h1 className="text-8xl tracking-tighter font-bold  text-slate-900">89.lc</h1>
        <form className="flex w-full gap-x-6 h-12 justify-center" onSubmit={shortenURL}>
          <div className={`flex items-center w-full`}>
            <LinkIcon className="text-black absolute ml-3 pointer-events-none opacity-40" size={18} />
            <Input
              className={`${error.isError && "border-red-400"} bg-white border w-full h-full !pl-10 py-1 px-2 text-lg ${loading && "disabled"}`}
              autoComplete="off"
              type="url"
              placeholder="Enter a URL (eg. https://google.com)"
              name="url"
              maxLength={500}
            />
          </div>
          <Button
            className={`bg-blue-600 py-1 px-3 w-36 h-full text-base  hover:cursor-pointer active:bg-blue-700 hover:bg-blue-700 ${
              loading && "disabled"
            }`}
            type="submit"
          >
            Shorten
          </Button>
        </form>
        <div className="flex w-full h-10 justify-center items-center">
          {error.isError && <h1 className="text-red-500">{error.message}</h1>}
          {loading ? (
            <LoadingDots invert={true} />
          ) : (
            result.isSuccess &&
            !error.isError && (
              <div className="flex justify-center items-center gap-x-6 ">
                <a
                  className="text-blue-600 hover:text-blue-800 font-medium  tracking-tight text-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={result.origin}
                >
                  {result.origin}
                </a>

                <Sparkles className="text-slate-400" size={16} />
                <Button
                  onClick={() => router.push("/logs?code=" + result.origin.split("/")[3])}
                  className={`gap-x-2 text-xs bg-blue-600 active:bg-blue-700 hover:bg-blue-700 ${loading && "disabled"}`}
                  variant={"default"}
                >
                  View Logs <ExternalLink className="inline" size={14} />
                </Button>
              </div>
            )
          )}
        </div>
      </div>
      <div className="flex flex-col gap-y-6 h-1/2 max-h-1/2 py-10">
        <div className="flex justify-between items-center">
          <h1 className="font-medium text-sm">Recently Shortened:</h1>
          <Button
            disabled={isRefetching}
            onClick={() => {
              setIsRefetching(true);
              setTimeout(() => {
                setIsRefetching(false);
              }, 500);

              queryClient.invalidateQueries({ queryKey: ["urls"] });
            }}
          >
            Refresh
            <RefreshCcw className={`ml-2 ${isRefetching && "animate-spin pointer-events-none"}`} size={14} />
          </Button>
        </div>
        <Table className=" border border-collapse">
          <TableHeader>
            <TableRow className="border">
              <TableHead>Origin</TableHead>
              <TableHead className="">Destination</TableHead>
              <TableHead className="text-center whitespace-nowrap">Visits</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="h-24 overflow-scroll">
            {isLoading ? (
              <TableRow>
                <TableCell className="text-center opacity-50" colSpan={4}>
                  <LoadingDots invert={true} />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell className="text-center opacity-50" colSpan={4}>
                  An error occurred. Please try again.
                </TableCell>
              </TableRow>
            ) : data && data.urls.length > 0 ? (
              data.urls.map((url: any, idx: number) => {
                return (
                  <TableRow key={url.origin + idx}>
                    <TableCell>
                      <div className="flex items-center gap-x-2">
                        <a className="text-blue-600 hover:text-blue-800 text-sm" target="_blank" rel="noopener noreferrer" href={url.origin}>
                          {url.origin}
                        </a>

                        <Copy
                          className="cursor-pointer text-slate-400 hover:text-slate-900"
                          size={16}
                          onClick={() => navigator.clipboard.writeText(url.origin)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] w-full overflow-auto">
                      <div className="flex items-center gap-x-2">
                        <a className="text-blue-600 hover:text-blue-800 text-sm" target="_blank" rel="noopener noreferrer" href={url.destination}>
                          {url.destination}
                        </a>
                        <Copy
                          className="cursor-pointer text-slate-400 hover:text-slate-900"
                          size={16}
                          onClick={() => navigator.clipboard.writeText(url.destination)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{url.visits}</TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => router.push("/logs?code=" + url.origin.split("/")[3])} className="gap-x-2 text-xs" variant={"link"}>
                        View Logs <ExternalLink className="inline" size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell className="text-center text-muted-foreground py-10" colSpan={4}>
                  No Recently Shortened URLs
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
