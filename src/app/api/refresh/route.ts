import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

import { unstable_noStore as noStore } from "next/cache";

export async function POST(request: NextRequest) {
  noStore();
  try {
    // get destination from request body & check if it exists in KV
    const data = await request.json();

    if (data.origins.length < 1) return NextResponse.json({ success: "updating complete" }, { status: 200 });

    const updatedOrigins = await Promise.all(
      data.origins.map(async (record: any) => {
        const result: any = await kv.hgetall(record.origin.split("/")[3]);
        return { ...record, destination: result.destination, views: result.views };
      })
    );

    return NextResponse.json({ origins: updatedOrigins }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
