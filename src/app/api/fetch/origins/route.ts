import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

import { unstable_noStore as noStore } from "next/cache";

export async function POST(request: NextRequest) {
  noStore();
  try {
    const { requestedOrigins } = await request.json();
    if (requestedOrigins.length < 1) return NextResponse.json({ origins: [] }, { status: 200 });

    // fetch all origins (shortened urls) from KV
    const origins = await Promise.all(
      requestedOrigins.map(async (record: any) => {
        const result: any = await kv.hgetall(record.origin.split("/")[3] + ":root");
        return { ...record, destination: result.destination, visits: result.visits };
      })
    );

    return NextResponse.json({ origins: origins }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
