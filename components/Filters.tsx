export default function Filters({
  searchParams,
}: {
  searchParams: { kind?: string; maturity?: string };
}) {
  const chips: string[] = [];
  if (searchParams.kind) chips.push(searchParams.kind);
  if (searchParams.maturity) chips.push(searchParams.maturity);
  if (chips.length === 0) return null;
  return (
    <div className="mb-2 flex gap-2">
      {chips.map((c) => (
        <span key={c} className="text-xs px-2 py-1 rounded bg-gray-800">
          {c}
        </span>
      ))}
    </div>
  );
}
