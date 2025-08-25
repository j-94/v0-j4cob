import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Item } from "@/lib/providers/items";
import verifyGridTemplate from "@/lib/verifyGridTemplate";

export default function ItemRow({ item }: { item: Item }) {
  const date = new Date(item.ts);
  const rel = formatDistanceToNow(date, { addSuffix: true });
  const draftUrl = `https://github.com/example/repo/compare/main...draft?quick_pull=1&title=${encodeURIComponent(
    item.title
  )}&body=${encodeURIComponent(verifyGridTemplate())}`;
  return (
    <li className="flex items-center gap-2 py-2 border-b border-gray-800">
      <span className="flex-1 truncate">
        <Link href={`/item/${item.id}`}>{item.title}</Link>
      </span>
      <span className="text-xs px-1 rounded bg-gray-700">{item.kind}</span>
      <span className="text-xs px-1 rounded bg-gray-700">{item.maturity}</span>
      <span title={date.toISOString()} className="text-xs text-gray-400">
        {rel}
      </span>
      {item.url && (
        <Link href={item.url} target="_blank" className="text-xs underline">
          PR
        </Link>
      )}
      {item.previewUrl && (
        <Link href={item.previewUrl} target="_blank" className="text-xs underline">
          Preview
        </Link>
      )}
      <Link href={draftUrl} target="_blank" className="text-xs underline">
        Propose via Agent
      </Link>
    </li>
  );
}
