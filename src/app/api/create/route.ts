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
    const { destination } = await request.json();

    if (!checkUrl(destination)) return NextResponse.json({ error: "INVALID-URL" }, { status: 400 });

    const { origin, pathname } = new URL(destination);
    const constructed = origin + pathname;

    // create hash of destination (secret used: sha256("89.lc"))
    const hash = createHmac("sha256", "c362920a84adace2d89bc47062935c904ba6984e69cf3d4c8f79529273818c63")
      .update(constructed)
      .digest("hex")
      .toString()
      .substring(0, 6);

    let exists = await kv.hgetall(hash + ":root");

    // if the hash already exists, return the existing hash
    // else, try creating a new hash (avoids hash collisions due to substring)
    while (exists) {
      if (exists.destination === constructed) {
        return NextResponse.json({ origin: host + "/" + hash, destination: exists.destination, visits: exists.visits }, { status: 200 });
      }

      const hashRetry = createHmac("sha256", "c362920a84adace2d89bc47062935c904ba6984e69cf3d4c8f79529273818c63")
        .update(constructed)
        .digest("hex")
        .toString()
        .substring(0, 6);
      exists = await kv.hgetall(hashRetry + ":root");
    }

    // add shortened URL to KV
    await kv.hset(hash + ":root", { destination: constructed, visits: 0, created: Date.now() });

    // return shortened URL
    return NextResponse.json({ origin: host + "/" + hash, destination: constructed, visits: 0 }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
