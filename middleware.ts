import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const id = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const res = NextResponse.next();
  res.headers.set("x-request-id", id);
  return res;
}
