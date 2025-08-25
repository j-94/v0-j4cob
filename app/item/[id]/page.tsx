import { notFound } from "next/navigation";
import { getItem } from "@/lib/providers/items";
import verifyGridTemplate from "@/lib/verifyGridTemplate";

export default async function Page({ params }: { params: { id: string } }) {
  const item = await getItem(params.id);
  if (!item) return notFound();
  return (
    <div>
      <h1 className="text-xl font-semibold">{item.title}</h1>
      <p className="text-sm text-gray-400">
        {item.kind} · {item.maturity}
      </p>
      {item.url && (
        <p>
          <a href={item.url} className="underline" target="_blank">
            View PR
          </a>
        </p>
      )}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm">VERIFY GRID</summary>
        <pre className="whitespace-pre-wrap text-xs mt-2">
          {verifyGridTemplate()}
        </pre>
      </details>
    </div>
  );
}
