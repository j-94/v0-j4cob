import { getKernelSnapshot } from "@/lib/providers/items";

export default async function KernelPill() {
  const snapshot = await getKernelSnapshot();
  const { tick, goal, state, budget } = snapshot;
  return (
    <div className="text-xs flex items-center gap-2 rounded-md border border-gray-700 bg-gray-900 px-2 py-1">
      <span>#{tick}</span>
      <span className="truncate">{goal}</span>
      <span>α{state.alpha} β{state.beta} γ{state.gamma}</span>
      <span>{budget.seconds_left}s</span>
    </div>
  );
}
