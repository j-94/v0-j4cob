import { listItems } from "@/lib/providers/items";
import Filters from "@/components/Filters";
import KbdHint from "@/components/KbdHint";
import TimelineClient from "./TimelineClient";

export default async function Page({
  searchParams,
}: {
  searchParams: { kind?: string; maturity?: string };
}) {
  const items = await listItems();
  items.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  return (
    <div>
      <Filters searchParams={searchParams} />
      {/* @ts-expect-error Async Server Component */}
      <TimelineClient items={items} />
      <KbdHint />
    </div>
  );
}
