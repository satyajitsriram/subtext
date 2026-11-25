"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/state";
import { suggestRoles } from "@/lib/engine";
import type { TieBreaker } from "@/lib/types";

const tieOptions: { id: TieBreaker; label: string; desc: string }[] = [
  { id: "revote", label: "Face-off & Revote", desc: "Tied players give one more clue; revote among them." },
  { id: "random", label: "Goddess of Justice", desc: "Randomly eliminate one among tied players." },
  { id: "manual", label: "Manual (RPS)", desc: "Resolve outside the app (e.g., rock-paper-scissors)." }
];

export default function SetupPage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const n = state.players.length;

  useEffect(() => {
    if (n > 0) {
      const { numUndercovers, numMrWhites } = suggestRoles(n);
      dispatch({ type: "UPDATE_SETTINGS", settings: { numUndercovers, numMrWhites } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  if (n === 0) {
    return (
      <main className="min-h-[100dvh] grid place-items-center p-6">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Add some players first.</p>
          <button onClick={() => router.push("/players")} className="rounded-md border border-accent/40 px-4 py-2">
            Go to Players
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        <header className="text-center">
          <h1 className="heading text-xl">Setup</h1>
          <p className="text-xs text-muted-foreground">Players: {n}</p>
        </header>

        <div className="card p-4 space-y-3">
          <h2 className="heading text-lg">Roles</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Undercovers</label>
              <input
                type="number"
                min={0}
                max={Math.max(0, n - 1)}
                className="mt-1 w-full rounded-md bg-background border border-white/10 p-2"
                value={state.settings.numUndercovers}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { numUndercovers: Math.max(0, Math.min(n - 1, Number(e.target.value) || 0)) } })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Mr. Whites</label>
              <input
                type="number"
                min={0}
                max={Math.max(0, n - 1)}
                className="mt-1 w-full rounded-md bg-background border border-white/10 p-2"
                value={state.settings.numMrWhites}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { numMrWhites: Math.max(0, Math.min(n - 1, Number(e.target.value) || 0)) } })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            At least one infiltrator required. Civilians win if all infiltrators are eliminated; infiltrators win if only one Civilian remains.
          </p>
        </div>

        <div className="card p-4 space-y-3">
          <h2 className="heading text-lg">Options</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.settings.revealOnElimination}
              onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { revealOnElimination: e.target.checked } })}
            />
            <span className="text-sm">Reveal role upon elimination</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.settings.allowRecheckWord}
              onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { allowRecheckWord: e.target.checked } })}
            />
            <span className="text-sm">Allow players to re-check their word</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.settings.includeSpicy}
              onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { includeSpicy: e.target.checked } })}
            />
            <span className="text-sm">Include spicy/adult word pairs</span>
          </label>
          <div className="mt-3 space-y-2">
            <div className="text-sm text-muted-foreground">Tie handling</div>
            <div className="grid grid-cols-1 gap-2">
              {tieOptions.map((opt) => (
                <label key={opt.id} className="flex items-start gap-2 rounded-md border border-white/10 p-2">
                  <input
                    type="radio"
                    name="tie"
                    checked={state.settings.tieBreaker === opt.id}
                    onChange={() => dispatch({ type: "SET_TIE_MODE", mode: opt.id })}
                  />
                  <div>
                    <div className="text-sm">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            try {
              dispatch({ type: "START_GAME" });
              // go to reveal
              window.location.href = "/reveal";
            } catch (e: any) {
              alert(e.message || "Invalid setup");
            }
          }}
          className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black active:opacity-90"
        >
          Deal Words
        </button>
      </div>
    </main>
  );
}
