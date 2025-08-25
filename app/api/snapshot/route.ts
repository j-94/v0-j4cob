import { NextResponse } from "next/server";
import { getKernelSnapshot } from "@/lib/providers/items";

export async function GET() {
  const snapshot = await getKernelSnapshot();
  return NextResponse.json(snapshot, { headers: { "cache-control": "no-store" } });
}
