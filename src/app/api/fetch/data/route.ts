import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  noStore();
  try {
    const host = headers().get("origin");

    // get destination from request body & check if it exists in KV
    const { code } = await request.json();

    if (!code) return NextResponse.json({ error: true }, { status: 404 });

    const root = await kv.hgetall(code + ":root");
    const data = await kv.zrange(code + ":data", 0, 9, { rev: true });
    if (!root) return NextResponse.json({ error: true }, { status: 404 });

    return NextResponse.json({ root: { origin: host + "/" + code, ...root }, data: data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ZRANGE code:data [start index] [end index] REV
