import ItemRow from "@/components/ItemRow";

export default async function Page({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || "";
  let results: any[] = [];
  if (q) {
    const res = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ q }),
      headers: { "content-type": "application/json" },
    });
    results = await res.json();
  }
  return (
    <div>
      <h1 className="mb-4 text-lg">Search: {q}</h1>
      <ul>
        {results.map((item) => (
          // @ts-expect-error Server Component
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
