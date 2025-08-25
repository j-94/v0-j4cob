import { NextResponse } from "next/server";
import { searchItems } from "@/lib/providers/items";

export async function POST(req: Request) {
  const { q } = await req.json();
  const items = await searchItems(q ?? "");
  return NextResponse.json(items);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const items = await searchItems(q);
  return NextResponse.json(items);
}
