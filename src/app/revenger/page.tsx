"use client";
import { useGame } from "@/lib/state";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function RevengerPage() {
  const { state, dispatch, checkAndFinishVictory } = useGame();
  const router = useRouter();
  const last = state.rounds[state.rounds.length - 1];
  const eliminatedId = last?.eliminatedPlayerId;
  const isRevenger = state.settings.specials.revenger && state.specials?.revengerId === eliminatedId;
  const [targetId, setTargetId] = useState<string>("");
  const candidates = useMemo(
    () => state.players.filter((p) => state.alivePlayerIds.includes(p.id)),
    [state.players, state.alivePlayerIds]
  );
  const roleMap = new Map(state.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []);

  const shouldRedirect = !isRevenger;
  useEffect(() => {
    if (shouldRedirect) router.replace("/round");
  }, [shouldRedirect, router]);
  if (shouldRedirect) return null;

  function confirm() {
    if (!targetId) return;
    dispatch({ type: "ELIMINATE", playerId: targetId });
    const isMrWhite = roleMap.get(targetId) === "MR_WHITE";
    if (isMrWhite) {
      router.push("/mrwhite");
    } else if (state.settings.revealOnElimination) {
      router.push("/eliminated");
    } else {
      dispatch({ type: "START_ROUND" });
      router.push("/round");
    }
    checkAndFinishVictory();
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="heading text-xl">Revenger</h1>
          <p className="text-xs text-muted-foreground">Pass the phone to the Revenger. Choose one player to eliminate.</p>
        </header>
        <div className="grid grid-cols-2 gap-3">
          {candidates.map((p) => {
            const active = targetId === p.id;
            return (
              <button key={p.id} onClick={() => setTargetId(p.id)} className={`rounded-lg border p-4 text-center ${active ? "border-danger bg-danger/20" : "border-white/10 bg-muted-surface"}`}>
                <div className="heading">{p.name}</div>
              </button>
            );
          })}
        </div>
        <button disabled={!targetId} onClick={confirm} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black disabled:opacity-40">
          Confirm
        </button>
      </div>
    </main>
  );
}
