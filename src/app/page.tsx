"use client";

import { AudioWaveform, Link2Icon, LinkIcon, Sparkle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [error, setError] = useState<{ isError: boolean; message: string }>({ isError: false, message: "" });
  const [result, setResult] = useState<{ isSuccess: boolean; origin: string; destination: string }>({
    isSuccess: false,
    origin: "",
    destination: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

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
    } catch (e) {
      setError({ isError: true, message: "An unknown error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center  bg-slate-100">
      <div className="flex pb-32 flex-col z-40 h-full justify-center items-center gap-y-8 ">
        <h1 className="text-9xl tracking-tighter font-bold  text-slate-900">89.lc</h1>
        <form className="flex w-[50rem] gap-x-6 h-12 justify-center" onSubmit={shortenURL}>
          <div className={`flex bg-blue-600 items-center w-full ${loading && "opacity-60 pointer-events-none"}`}>
            <LinkIcon className="text-black absolute ml-3 pointer-events-none opacity-40" size={18} />
            <input
              className={`${error.isError && "border-red-400"} bg-white border w-full h-full pl-10 outline-none py-1 px-2 text-lg`}
              autoComplete="off"
              type="text"
              // type="url"
              placeholder="Enter a URL (eg. https://google.com)"
              name="url"
              maxLength={500}
            />
          </div>
          <input
            className={`bg-blue-600 py-1 px-3 w-36 text-white font-medium hover:cursor-pointer active:bg-blue-700 hover:bg-blue-700 ${
              loading && "opacity-80 pointer-events-none"
            }`}
            type="submit"
            value="Shorten"
          />
        </form>
        <div className="flex w-full h-10 justify-center items-center">
          {error.isError && <h1 className="text-red-500">{error.message}</h1>}
          {result.isSuccess && !error.isError && (
            <div className="flex justify-center items-center gap-x-6 ">
              <a
                className="text-blue-600 hover:text-blue-800 font-semibold tracking-tight text-xl"
                target="_blank"
                rel="noopener noreferrer"
                href={result.origin}
              >
                {result.origin}
              </a>

              <Sparkles className="text-slate-400" size={16} />
              <button
                className={`bg-blue-600 py-2 px-2 w-28 text-sm text-white font-medium hover:cursor-pointer active:bg-blue-700 hover:bg-blue-700 ${
                  loading && "opacity-80 pointer-events-none"
                }`}
                type="button"
              >
                Logs
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="ocean">
        <div className="wave" />
        <div className="wave" />
      </div>
    </div>
  );
}
