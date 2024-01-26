import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(request: NextRequest) {
  noStore();
  try {
    const origin = request.nextUrl.pathname.split("/")[1];
    if (!origin) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    const record: any = await kv.hgetall(origin);

    if (!record || !record.destination) return NextResponse.json({ error: "url doesn't exist" }, { status: 404 });

    await kv.hset(origin, { destination: record.destination, views: parseInt(record.views) + 1 });

    return NextResponse.redirect(`${record.destination}`);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
