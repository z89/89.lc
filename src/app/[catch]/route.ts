import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(request: NextRequest) {
  noStore();

  try {
    const origin = request.nextUrl.pathname.split("/")[1];
    if (!origin) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    // fetch API for data on the ipv4 address
    const address: any = await fetch(
      "https://api.ipgeolocation.io/ipgeo?apiKey=4cf7117d0d6e4a268e56674f98ba09bb&ip=" + request.headers.get("x-forwarded-for")
    ).then((res) => {
      switch (res.status) {
        case 423:
          return {
            ip: "::1",
          };
        default:
          return res.json();
      }
    });

    // fetch API for data on the user agent
    const agent: any = await fetch("https://api.ipgeolocation.io/user-agent?apiKey=4cf7117d0d6e4a268e56674f98ba09bb", {
      headers: new Headers(request.headers),
    }).then((res) => {
      switch (res.status) {
        case 423:
          return { error: true };
        default:
          return res.json();
      }
    });

    // create snapshot of the data
    const snapshot = {
      timestamp: Date.now(),
      address: {
        ip: address.ip,
        isp: address.isp,
        city: address.city,
        state: address.state_prov,
        country: address.country_name,
        country_flag: address.country_flag,
        postal_code: address.zipcode,
        latitude: address.latitude,
        longitude: address.longitude,
      },
      device: {
        browser: agent.name,
        machine: agent.operatingSystem.name,
        cpu: agent.device.cpu,
      },
      user_agent: agent.userAgentString,
    };

    // check if the origin exists in KV
    const record: any = await kv.hgetall(origin + ":root");
    if (!record || !record.destination) return NextResponse.json({ error: "url doesn't exist" }, { status: 404 });

    // add snapshot to KV
    await kv.zadd(origin + ":data", { score: snapshot.timestamp, member: JSON.stringify(snapshot) });

    // increment visit count for record in KV
    await kv.hset(origin + ":root", { destination: record.destination, visits: parseInt(record.visits) + 1 });

    // redirect to destination
    return NextResponse.redirect(`${record.destination}`);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
