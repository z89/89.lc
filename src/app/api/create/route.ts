import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHmac } from "node:crypto";

import { unstable_noStore as noStore } from "next/cache";

// checks if the URL is valid against nodejs whatwg api
function checkUrl(str: string) {
  let newURL: URL;
  try {
    newURL = new URL(str);
  } catch (error) {
    return false;
  }

  return newURL.protocol === "http:" || newURL.protocol === "https:";
}

export async function POST(request: NextRequest) {
  noStore();
  try {
    const host = headers().get("origin");

    // get destination from request body & check if it exists in KV
    const { destination } = await request.json();

    // check if the destination is a valid URL
    if (!checkUrl(destination)) return NextResponse.json({ error: "INVALID-URL" }, { status: 400 });

    const { origin, pathname } = new URL(destination);
    const constructed = origin + pathname;

    // create hash of destination (secret used is sha256("89.lc"))
    const hash = createHmac("sha256", "c362920a84adace2d89bc47062935c904ba6984e69cf3d4c8f79529273818c63")
      .update(constructed)
      .digest("hex")
      .toString()
      .substring(0, 6);

    // check if the shortened URL already exists in KV db
    const exists = await kv.hgetall(hash + ":root");

    // if it exists, return the shortened URL
    if (exists) return NextResponse.json({ origin: host + "/" + hash, constructed: exists.destination, visits: exists.visits }, { status: 200 });

    // add shortened URL to KV db
    await kv.hset(hash + ":root", { destination: constructed, visits: 0, created: Date.now() });

    // return hash URL
    return NextResponse.json({ origin: host + "/" + hash, destination: constructed, visits: 0 }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
