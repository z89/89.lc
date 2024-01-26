import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

import { unstable_noStore as noStore } from "next/cache";

export async function POST(request: NextRequest) {
  noStore();
  try {
    // get destination from request body & check if it exists in KV
    const { origins } = await request.json();

    if (origins.length < 1) return NextResponse.json({ origins: [] }, { status: 200 });

    const updatedOrigins = await Promise.all(
      origins.map(async (record: any) => {
        const result: any = await kv.hgetall(record.origin.split("/")[3] + ":root");
        return { ...record, destination: result.destination, visits: result.visits };
      })
    );

    return NextResponse.json({ origins: updatedOrigins }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
