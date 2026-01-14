import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");
    if (!path) return new NextResponse("Missing path", { status: 400 });

    const backend = (process.env.NEXT_PUBLIC_API_URL).replace(/\/$/, "");

    // Build remote URL. If caller provided an absolute URL, use it.
    const remoteUrl = path.startsWith("http") ? path : `${backend}/${path.replace(/^\//, "")}`;

    // Only allow proxying requests to our backend host to avoid SSRF.
    if (!remoteUrl.startsWith(backend)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const upstream = await fetch(remoteUrl);
    if (!upstream.ok) return new NextResponse("Upstream error", { status: upstream.status });

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (err) {
    return new NextResponse("Proxy error", { status: 500 });
  }
}
