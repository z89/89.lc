import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ error: "url doesn't exist" }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
