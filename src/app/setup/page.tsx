"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/state";
import { suggestRoles, startNewGame } from "@/lib/engine";
import { WORD_PAIRS_ALL } from "@/data/word-pairs";
import type { TieBreaker } from "@/lib/types";

const tieOptions: { id: TieBreaker; label: string; desc: string }[] = [
  { id: "revote", label: "Face-off & Revote", desc: "Tied players give one more clue; revote among them." },
  { id: "random", label: "Random pick", desc: "Randomly eliminate one among tied players." },
  { id: "manual", label: "Manual (RPS)", desc: "Resolve outside the app (e.g., rock-paper-scissors)." }
];

export default function SetupPage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const n = state.players.length;

  useEffect(() => {
    // If players are empty, attempt to hydrate from localStorage (robustness for hard reloads)
    if (n === 0 && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("subtext_state");
        if (raw) {
          const st = JSON.parse(raw);
          if (Array.isArray(st.players) && st.players.length >= 3) {
            const names = st.players.map((p: any) => String(p.name));
            dispatch({ type: "INIT_PLAYERS", names });
          }
        }
      } catch {}
    }
    if (n > 0) {
      const { numUndercovers, numMrWhites } = suggestRoles(n);
      dispatch({ type: "UPDATE_SETTINGS", settings: { numUndercovers, numMrWhites } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        <header className="text-center">
          <h1 className="heading text-xl">Setup</h1>
          <p className="text-xs text-muted-foreground">Players: {n}</p>
        </header>
        {n === 0 && (
          <div className="text-center card p-4">
            <p className="mb-3 text-muted-foreground">Add some players first.</p>
            <button onClick={() => router.push("/players")} className="rounded-md border border-accent/40 px-4 py-2">
              Go to Players
            </button>
          </div>
        )}

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
              checked={!!state.settings.soundsEnabled}
              onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { soundsEnabled: e.target.checked } })}
            />
            <span className="text-sm">Enable subtle sounds (off by default)</span>
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

        <div className="card p-0 overflow-hidden">
          <details className="group">
            <summary className="list-none cursor-pointer bg-muted-surface px-4 py-3 heading">
              Extra roles (optional)
              <span className="ml-2 text-xs text-muted-foreground">(off by default)</span>
            </summary>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.settings.specials.goddessOfJustice}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { specials: { ...state.settings.specials, goddessOfJustice: e.target.checked } } })}
              />
              <span className="text-sm">Goddess of Justice (breaks ties, even if eliminated)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={n < 5}
                checked={state.settings.specials.lovers}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { specials: { ...state.settings.specials, lovers: e.target.checked } } })}
              />
              <span className="text-sm">Lovers (pair; eliminating one eliminates the other){n < 5 ? " — need 5+" : ""}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.settings.specials.mrMeme}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { specials: { ...state.settings.specials, mrMeme: e.target.checked } } })}
              />
              <span className="text-sm">Mr. Meme (one random player gestures only each round)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={n < 5}
                checked={state.settings.specials.revenger}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { specials: { ...state.settings.specials, revenger: e.target.checked } } })}
              />
              <span className="text-sm">Revenger (when eliminated, also eliminates someone){n < 5 ? " — need 5+" : ""}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={n < 5}
                checked={state.settings.specials.duelists}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { specials: { ...state.settings.specials, duelists: e.target.checked } } })}
              />
              <span className="text-sm">Duelists (pair; first out −2 pts, other +2 pts){n < 5 ? " — need 5+" : ""}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.settings.specials.ghost}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { specials: { ...state.settings.specials, ghost: e.target.checked } } })}
              />
              <span className="text-sm">Ghost (eliminated players can still vote)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={n < 4}
                checked={state.settings.specials.falafelVendor}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { specials: { ...state.settings.specials, falafelVendor: e.target.checked } } })}
              />
              <span className="text-sm">Falafel Vendor (gives protect/sabotage each round){n < 4 ? " — need 4+" : ""}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.settings.specials.boomerang}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { specials: { ...state.settings.specials, boomerang: e.target.checked } } })}
              />
              <span className="text-sm">Boomerang (first majority vote bounces back to voters)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.settings.specials.joyFool}
                onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { specials: { ...state.settings.specials, joyFool: e.target.checked } } })}
              />
              <span className="text-sm">Joy Fool (if first eliminated, +4 pts)</span>
            </label>
              </div>
            </div>
          </details>
        </div>

        <button
          onClick={() => {
            try {
              // Build next game state synchronously to avoid race with navigation
              const started = startNewGame(state.players, state.settings, WORD_PAIRS_ALL, state.usedWordIndices);
              dispatch({ type: "LOAD_STATE", state: started });
              if (typeof window !== "undefined") {
                localStorage.setItem("subtext_state", JSON.stringify(started));
              }
              router.push("/reveal");
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
