import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path ? path.join("/") : "";
  const backend = (process.env.BACKEND_URL || "https://pruefungstore-backend-261a.onrender.com").replace(/\/+$/, "");
  const url = new URL(req.url);
  const targetUrl = `${backend}/api/${targetPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    const resHeaders = new Headers(res.headers);
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
