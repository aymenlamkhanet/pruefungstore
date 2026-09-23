import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path ? path.join("/") : "";
  const backend = (process.env.BACKEND_URL || "https://pruefungstore-backend-261a.onrender.com").replace(/\/+$/, "");
  const url = new URL(req.url);
  const targetUrl = `${backend}/api/${targetPath}${url.search}`;

  const headers = new Headers();
  const forwardHeaders = [
    "content-type",
    "authorization",
    "x-admin-token",
    "accept",
    "accept-language",
  ];
  for (const name of forwardHeaders) {
    const val = req.headers.get(name);
    if (val) headers.set(name, val);
  }

  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    const data = await res.arrayBuffer();
    const resHeaders = new Headers();
    const contentType = res.headers.get("content-type");
    if (contentType) resHeaders.set("content-type", contentType);
    const cacheControl = res.headers.get("cache-control");
    if (cacheControl) resHeaders.set("cache-control", cacheControl);

    return new NextResponse(data, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Proxy error" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
