import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.pathname.split("/")[1];
    console.log("origin: ", origin);
    if (!origin) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    const resp = await kv.hget(origin, "destination");

    if (!resp) return NextResponse.json({ error: "url doesn't exist" }, { status: 404 });

    return NextResponse.redirect(`${resp}`);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
