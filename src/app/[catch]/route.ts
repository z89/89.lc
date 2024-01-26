import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(request: NextRequest) {
  noStore();
  try {
    const origin = request.nextUrl.pathname.split("/")[1];
    if (!origin) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    const snapshot = {
      timestamp: Date.now(),
      ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || request.ip,
      device: request.headers.get("user-agent"),
    };

    const record: any = await kv.hgetall(origin + ":root");
    await kv.zadd(origin + ":data", { score: snapshot.timestamp, member: JSON.stringify(snapshot) });

    if (!record || !record.destination) return NextResponse.json({ error: "url doesn't exist" }, { status: 404 });

    await kv.hset(origin + ":root", { destination: record.destination, visits: parseInt(record.visits) + 1 });

    return NextResponse.redirect(`${record.destination}`);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
