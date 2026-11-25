"use client";
import { useGame } from "@/lib/state";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function GoddessPage() {
  const { state, dispatch, checkAndFinishVictory } = useGame();
  const router = useRouter();
  const round = state.rounds[state.rounds.length - 1];
  const ids = round?.faceOffIds || [];
  const candidates = useMemo(() => state.players.filter((p) => ids.includes(p.id) && state.alivePlayerIds.includes(p.id)), [state.players, ids, state.alivePlayerIds]);
  const goddess = state.specials?.goddessId;
  const [selectedId, setSelectedId] = useState<string>("");
  const roleMap = new Map(state.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []);

  const shouldRedirect = ids.length < 2 || !goddess;
  useEffect(() => {
    if (shouldRedirect) router.replace("/vote");
  }, [shouldRedirect, router]);
  if (shouldRedirect) return null;

  function confirm() {
    if (!selectedId) return;
    dispatch({ type: "GODDESS_DECIDE", playerId: selectedId });
    const isMrWhite = roleMap.get(selectedId) === "MR_WHITE";
    if (isMrWhite) {
      router.push("/mrwhite");
    } else {
      if (state.settings.revealOnElimination) {
        router.push("/eliminated");
      } else {
        dispatch({ type: "START_ROUND" });
        router.push("/round");
      }
    }
    checkAndFinishVictory();
  }

  const goddessName = state.players.find((p) => p.id === goddess)?.name || "Goddess";

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="heading text-xl">Goddess of Justice</h1>
          <p className="text-xs text-muted-foreground">Pass the phone to {goddessName}. Choose one among the tied players.</p>
        </header>
        <div className="grid grid-cols-2 gap-3">
          {candidates.map((p) => {
            const active = selectedId === p.id;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`rounded-lg border p-4 text-center ${active ? "border-danger bg-danger/20" : "border-white/10 bg-muted-surface"}`}
              >
                <div className="heading">{p.name}</div>
              </button>
            );
          })}
        </div>
        <button disabled={!selectedId} onClick={confirm} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black disabled:opacity-40">
          Confirm Elimination
        </button>
      </div>
    </main>
  );
}
