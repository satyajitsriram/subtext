"use client";
import { useGame } from "@/lib/state";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function VotePage() {
  const { state, dispatch, checkAndFinishVictory } = useGame();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tieMode, setTieMode] = useState<boolean>(false);

  const alivePlayers = useMemo(() => state.players.filter((p) => state.alivePlayerIds.includes(p.id)), [state.players, state.alivePlayerIds]);
  const roleMap = new Map(state.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []);

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : tieMode ? [...prev, id] : [id]));
  };

  const confirm = () => {
    if (selectedIds.length === 0) return;
    if (tieMode) {
      // Resolve tie according to setting
      if (state.settings.tieBreaker === "random") {
        const pick = selectedIds[Math.floor(Math.random() * selectedIds.length)];
        dispatch({ type: "ELIMINATE", playerId: pick });
        const isMrWhite = roleMap.get(pick) === "MR_WHITE";
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
        return;
      } else if (state.settings.tieBreaker === "manual" || state.settings.tieBreaker === "revote") {
        // After tie face-off or manual resolution, group selects one:
        alert("After extra clues or manual tie-break, tap the eliminated player.");
        setTieMode(false);
        return;
      }
    } else {
      const id = selectedIds[0];
      dispatch({ type: "ELIMINATE", playerId: id });
      const isMrWhite = roleMap.get(id) === "MR_WHITE";
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
  };

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="heading text-xl">Voting</h1>
          <p className="text-xs text-muted-foreground">Select the player to eliminate{tieMode ? " (multi-select tie)" : ""}.</p>
        </header>
        <div className="grid grid-cols-2 gap-3">
          {alivePlayers.map((p) => {
            const active = selectedIds.includes(p.id);
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`rounded-lg border p-4 text-center ${active ? "border-danger bg-danger/20" : "border-white/10 bg-muted-surface"}`}
              >
                <div className="heading">{p.name}</div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={tieMode} onChange={(e) => setTieMode(e.target.checked)} />
            <span className="text-sm">Mark tie</span>
          </label>
          <button
            onClick={confirm}
            disabled={selectedIds.length === 0 || (tieMode && selectedIds.length < 2 && state.settings.tieBreaker !== "manual")}
            className="tap-target rounded-lg bg-accent px-4 py-2 font-medium text-black disabled:opacity-40"
          >
            {tieMode ? (state.settings.tieBreaker === "random" ? "Resolve Randomly" : "Resolve Tie") : "Confirm Elimination"}
          </button>
        </div>
      </div>
    </main>
  );
}
