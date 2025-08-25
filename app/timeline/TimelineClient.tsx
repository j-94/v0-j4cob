"use client";
import ItemRow from "@/components/ItemRow";
import { useTimelineKeyboard } from "@/lib/keyboard";
import { useState } from "react";

export default function TimelineClient({ items }: { items: any[] }) {
  const [index, setIndex] = useState(0);
  useTimelineKeyboard((key) => {
    if (key === "j") setIndex((i) => Math.min(i + 1, items.length - 1));
    if (key === "k") setIndex((i) => Math.max(i - 1, 0));
    if (key === "o") window.open(items[index].url, "_blank");
    if (key === "p" && items[index].previewUrl) window.open(items[index].previewUrl, "_blank");
    if (key === "/") {
      const el = document.querySelector<HTMLInputElement>("header input[name=q]");
      el?.focus();
    }
  });
  return (
    <ul>
      {items.map((item, i) => (
        <div key={item.id} className={i === index ? "bg-gray-800" : undefined}>
          {/* @ts-expect-error Server Component */}
          <ItemRow item={item} />
        </div>
      ))}
    </ul>
  );
}
