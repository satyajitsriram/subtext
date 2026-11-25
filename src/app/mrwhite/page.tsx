"use client";
import { useGame } from "@/lib/state";
import { normalizeText, isLooseMatch } from "@/lib/engine";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function MrWhitePage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [guess, setGuess] = useState("");
  const [manualAccept, setManualAccept] = useState(false);
  const eliminatedId = useMemo(() => state.rounds[state.rounds.length - 1]?.eliminatedPlayerId, [state.rounds]);
  const eliminatedRole = useMemo(
    () => state.assignedRoles?.find((r) => r.playerId === eliminatedId)?.role,
    [state.assignedRoles, eliminatedId]
  );

  const shouldRedirect = !eliminatedId || eliminatedRole !== "MR_WHITE";
  useEffect(() => {
    if (shouldRedirect) router.replace("/round");
  }, [shouldRedirect, router]);
  if (shouldRedirect) return null;

  const evaluate = () => {
    const ok = manualAccept || isLooseMatch(state.civilianWord || "", guess);
    if (ok) {
      // Mr. White immediate win
      dispatch({ type: "END_WITH_VICTORY", victory: { group: "MR_WHITE", playerIds: state.players.map((p) => p.id) } });
      router.push("/win");
    } else {
      // continue next round
      dispatch({ type: "START_ROUND" });
      router.push("/round");
    }
  };

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="heading text-xl">Mr. White Guess</h1>
          <p className="text-xs text-muted-foreground">If correct, Mr. White wins immediately.</p>
        </header>
        <div className="card p-4 space-y-3">
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Type the civilians' word"
            className="w-full rounded-md bg-background border border-white/10 p-3 outline-none focus:ring-2 focus:ring-[--ring]"
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={manualAccept} onChange={(e) => setManualAccept(e.target.checked)} />
            <span className="text-sm">Group accepts this guess</span>
          </label>
          <button onClick={evaluate} className="tap-target w-full rounded-md bg-accent px-4 py-2 font-medium text-black">
            Submit
          </button>
        </div>
      </div>
    </main>
  );
}
