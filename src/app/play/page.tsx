"use client";
import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/lib/state";
import { eliminatePlayer, beginRound, checkVictory, isLooseMatch, startNewGame } from "@/lib/engine";
import { WORD_PAIRS_ALL } from "@/data/word-pairs";

type View =
  | "players"
  | "setup"
  | "reveal"
  | "round"
  | "vote"
  | "eliminated"
  | "mrwhite"
  | "win"
  | "leaderboard";

export default function PlayPage() {
  const { state, dispatch, checkAndFinishVictory } = useGame();
  const [view, setView] = useState<View>("players");
  const [namesText, setNamesText] = useState("");
  const [tieMode, setTieMode] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasRevealed, setHasRevealed] = useState<Record<string, boolean>>({});
  const [e2e, setE2e] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      setE2e(sp.get("e2e") === "1");
    }
  }, []);

  // Hydrate from localStorage once for robustness
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("subtext_state");
    if (raw) {
      try {
        const st = JSON.parse(raw);
        dispatch({ type: "LOAD_STATE", state: st });
        if (st.status === "finished") setView("win");
        else setView(st.status === "idle" ? "players" : "setup");
      } catch {}
    }
  }, [dispatch]);

  // Persist on every state change
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("subtext_state", JSON.stringify(state));
  }, [state]);
  // Auto-advance to setup when players are present
  useEffect(() => {
    if (view === "players" && state.players.length >= 3) {
      setView("setup");
    }
  }, [state.players.length, view]);

  const roleMap = useMemo(
    () => new Map(state.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []),
    [state.assignedRoles]
  );

  const alivePlayers = useMemo(
    () => state.players.filter((p) => state.alivePlayerIds.includes(p.id)),
    [state.players, state.alivePlayerIds]
  );

  function goSetup() {
    setView("setup");
  }

  function onSavePlayers() {
    const names = namesText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length < 3 || names.length > 20) {
      alert("Enter between 3 and 20 player names");
      return;
    }
    dispatch({ type: "INIT_PLAYERS", names });
    goSetup();
  }

  function onDealWords() {
    // Deterministic synchronous start
    const next = startNewGame(state.players, state.settings, WORD_PAIRS_ALL, state.usedWordIndices);
    dispatch({ type: "LOAD_STATE", state: next });
    setView("reveal");
  }

  // Reveal card helpers
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const canStartRound = e2e
    ? state.players.length > 0 && state.players.every((p) => revealed[p.id])
    : state.players.length > 0 && state.players.every((p) => hasRevealed[p.id]);

  function startRound() {
    dispatch({ type: "START_ROUND" });
    setView("round");
  }

  function proceedVoting() {
    setView("vote");
  }

  // Voting
  const [selected, setSelected] = useState<string[]>([]);
  const [tiedIds, setTiedIds] = useState<string[] | null>(null);
  function toggleVote(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : tieMode ? [...prev, id] : [id]));
  }

  function confirmElimination() {
    if (selected.length === 0) return;
    let id = selected[0];
    if (tieMode && selected.length > 1) {
      id = selected[Math.floor(Math.random() * selected.length)];
    }
    const next = eliminatePlayer(state, id);
    dispatch({ type: "LOAD_STATE", state: next });
    setSelected([]);
    setTieMode(false);
    setTiedIds(null);
    const isMrWhite = roleMap.get(id) === "MR_WHITE";
    if (isMrWhite) {
      setView("mrwhite");
      return;
    }
    if (state.settings.revealOnElimination) {
      setView("eliminated");
      return;
    }
    dispatch({ type: "START_ROUND" });
    setView("round");
  }

  function eliminatedContinue() {
    const v = checkVictory(state);
    if (v) {
      dispatch({ type: "END_WITH_VICTORY", victory: v });
      setView("win");
      return;
    }
    dispatch({ type: "START_ROUND" });
    setView("round");
  }

  // Mr White
  const [guess, setGuess] = useState("");
  function submitGuess() {
    const ok = isLooseMatch(state.civilianWord || "", guess);
    if (ok) {
      const lastElim = state.rounds[state.rounds.length - 1]?.eliminatedPlayerId;
      const mwWinIds = lastElim ? [lastElim] : (state.assignedRoles || []).filter((r) => r.role === "MR_WHITE").map((r) => r.playerId);
      dispatch({ type: "END_WITH_VICTORY", victory: { group: "MR_WHITE", playerIds: mwWinIds } });
      setView("win");
      return;
    }
    // Wrong guess — continue, but if all infiltrators are gone, civilians win now
    const v = checkVictory(state);
    if (v) {
      dispatch({ type: "END_WITH_VICTORY", victory: v });
      setView("win");
    } else {
      dispatch({ type: "START_ROUND" });
      setView("round");
    }
  }

  // Win actions
  function toLeaderboard() {
    setView("leaderboard");
  }

  function playAgain() {
    const restarted = startNewGame(state.players, state.settings, WORD_PAIRS_ALL, state.usedWordIndices);
    dispatch({ type: "LOAD_STATE", state: restarted });
    setRevealed({});
    setSelected([]);
    setGuess("");
    setView("reveal");
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="heading text-xl">Subtext</h1>
        </header>

        {view === "players" && (
          <div className="card p-4 space-y-3">
            <label className="block text-sm text-muted-foreground">Names (comma or newline separated)</label>
            <textarea
              className="w-full rounded-md bg-background border border-white/10 p-3 outline-none focus:ring-2 focus:ring-[--ring]"
              rows={6}
              placeholder="e.g. Alice, Bob, Carol..."
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
            />
            <button onClick={onSavePlayers} className="tap-target w-full rounded-md bg-accent px-4 py-2 font-medium text-black active:opacity-90">
              Save Players
            </button>
            {state.players.length >= 3 && (
              <button onClick={() => setView("setup")} className="tap-target w-full rounded-md border border-accent/40 px-4 py-2 font-medium">
                Continue to Setup
              </button>
            )}
          </div>
        )}

        {view === "setup" && (
          <div className="space-y-3">
            <div className="card p-4 space-y-3">
              <div className="text-sm text-muted-foreground">Players: {state.players.length}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Undercovers</label>
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, state.players.length - 1)}
                    className="mt-1 w-full rounded-md bg-background border border-white/10 p-2"
                    value={state.settings.numUndercovers}
                    onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { numUndercovers: Math.max(0, Math.min(state.players.length - 1, Number(e.target.value) || 0)) } })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Mr. Whites</label>
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, state.players.length - 1)}
                    className="mt-1 w-full rounded-md bg-background border border-white/10 p-2"
                    value={state.settings.numMrWhites}
                    onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { numMrWhites: Math.max(0, Math.min(state.players.length - 1, Number(e.target.value) || 0)) } })}
                  />
                </div>
              </div>
            </div>
            <button onClick={onDealWords} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black">
              Deal Words
            </button>
          </div>
        )}

        {view === "reveal" && (
          <div className="space-y-3">
            <div className="text-center">
              <h2 className="heading text-lg">Pass & Reveal</h2>
              <p className="text-xs text-muted-foreground">
                {state.settings.allowRecheckWord ? "Pass the phone. Each player may re-check later." : "Pass the phone. Each player may view their card once."}
              </p>
            </div>
            {e2e && (
              <button
                onClick={() => {
                  const flags: Record<string, boolean> = {};
                  for (const p of state.players) flags[p.id] = true;
                  setRevealed(flags);
                }}
                className="tap-target w-full rounded-md border border-accent/40 px-4 py-2"
              >
                Reveal all (test)
              </button>
            )}
            {e2e ? (
              <div className="grid grid-cols-2 gap-3">
                {state.players.map((p) => {
                  const role = roleMap.get(p.id);
                  const secret =
                    role === "MR_WHITE"
                      ? "You are Mr. White"
                      : role === "CIVILIAN"
                      ? state.civilianWord
                      : state.undercoverWord;
                  const open = !!revealed[p.id];
                  return (
                    <button key={p.id} onClick={() => setRevealed((r) => ({ ...r, [p.id]: !r[p.id] }))} className="flip card tap-target relative h-40 w-full overflow-hidden">
                      <div className={`flip-inner h-full w-full ${open ? "rotate-y-180" : ""}`} style={{ transform: open ? "rotateY(180deg)" : "none" }}>
                        <div className="flip-front absolute inset-0 flex items-center justify-center p-3">
                          <div className="text-center">
                            <div className="heading text-lg">{p.name}</div>
                            <div className="text-xs text-muted-foreground">Tap to reveal</div>
                          </div>
                        </div>
                        <div className="flip-back absolute inset-0 flex items-center justify-center p-3">
                          <div className="text-center">
                            <div className="heading text-lg">{p.name}</div>
                            <div className="mt-1 rounded bg-background/60 px-2 py-1 text-sm">{secret}</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              (() => {
                const p = state.players[revealIndex];
                const pid = p?.id;
                const role = pid ? roleMap.get(pid) : undefined;
                const secret =
                  role === "MR_WHITE"
                    ? "You are Mr. White"
                    : role === "CIVILIAN"
                    ? state.civilianWord
                    : state.undercoverWord;
                const viewed = pid ? !!hasRevealed[pid] : false;
                const canToggle = !viewed || state.settings.allowRecheckWord;
                return (
                  <div className="space-y-3">
                    <div className="text-center text-sm text-muted-foreground">Pass to {p?.name}</div>
                    <button
                      disabled={!pid}
                      onClick={() => {
                        if (!pid) return;
                        if (!isOpen) {
                          setIsOpen(true);
                          setHasRevealed((h) => ({ ...h, [pid]: true }));
                        } else if (canToggle) {
                          setIsOpen(false);
                        }
                      }}
                      className="flip card tap-target relative mx-auto h-56 w-full overflow-hidden"
                    >
                      <div className={`flip-inner h-full w-full ${isOpen ? "rotate-y-180" : ""}`} style={{ transform: isOpen ? "rotateY(180deg)" : "none" }}>
                        <div className="flip-front absolute inset-0 flex items-center justify-center p-3">
                          <div className="text-center">
                            <div className="heading text-lg">{p?.name}</div>
                            <div className="text-xs text-muted-foreground">{isOpen ? "Hide" : "Tap to reveal"}</div>
                          </div>
                        </div>
                        <div className="flip-back absolute inset-0 flex items-center justify-center p-3">
                          <div className="text-center">
                            <div className="heading text-lg">{p?.name}</div>
                            <div className="mt-1 rounded bg-background/60 px-2 py-1 text-sm">{secret}</div>
                          </div>
                        </div>
                      </div>
                    </button>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>
                        Card {revealIndex + 1} of {state.players.length}
                      </div>
                      <div>{state.settings.allowRecheckWord ? "Re-check enabled" : "No re-checks"}</div>
                    </div>
                    <button
                      disabled={!pid || isOpen || !hasRevealed[pid]}
                      onClick={() => {
                        const next = revealIndex + 1;
                        setRevealIndex(next);
                        setIsOpen(false);
                      }}
                      className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black disabled:opacity-40"
                    >
                      {revealIndex + 1 >= state.players.length ? "Finish Reveal" : "Next Player"}
                    </button>
                  </div>
                );
              })()
            )}
            <button disabled={!canStartRound} onClick={startRound} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black disabled:opacity-40">
              Start Round
            </button>
          </div>
        )}

        {view === "round" && (
          <div className="space-y-3">
            <div className="text-center">
              <h2 className="heading text-lg">Round</h2>
            </div>
            <div className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="heading text-base">Speaking Order</h3>
                <div className="text-xs text-muted-foreground">Round {state.rounds.length}</div>
              </div>
              <ol className="space-y-2">
                {state.rounds[state.rounds.length - 1]?.speakingOrder.map((pid: string, i: number) => (
                  <li key={pid} className="rounded bg-muted-surface px-3 py-2">
                    <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                    {state.players.find((p) => p.id === pid)?.name}
                  </li>
                ))}
              </ol>
            </div>
            <div className="text-xs text-muted-foreground">Remaining: {alivePlayers.map((p) => p.name).join(", ")}</div>
            <button onClick={proceedVoting} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black">
              Proceed to Voting
            </button>
          </div>
        )}

        {view === "vote" && (
          <div className="space-y-3">
            <div className="text-center">
              <h2 className="heading text-lg">{tiedIds ? "Tie Face-off" : "Voting"}</h2>
              <p className="text-xs text-muted-foreground">
                {tiedIds ? "Revote among tied players only." : `Select the player to eliminate${tieMode ? " (multi-select tie)" : ""}.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(tiedIds ? alivePlayers.filter((p) => tiedIds.includes(p.id)) : alivePlayers).map((p) => {
                const active = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleVote(p.id)}
                    className={`rounded-lg border p-4 text-center ${active ? "border-danger bg-danger/20" : "border-white/10 bg-muted-surface"}`}
                  >
                    <div className="heading">{p.name}</div>
                  </button>
                );
              })}
            </div>
            {!tiedIds ? (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={tieMode} onChange={(e) => setTieMode(e.target.checked)} />
                  <span className="text-sm">Mark tie</span>
                </label>
                <div className="flex gap-2">
                  {tieMode && selected.length >= 2 && (
                    <button
                      onClick={() => {
                        setTiedIds([...selected]);
                        setSelected([]);
                        setTieMode(false);
                      }}
                      className="tap-target rounded-lg border border-accent/40 px-4 py-2 font-medium"
                    >
                      Start Tie Face-off
                    </button>
                  )}
                  <button
                    onClick={confirmElimination}
                    disabled={selected.length === 0 || (tieMode && selected.length < 2)}
                    className="tap-target rounded-lg bg-accent px-4 py-2 font-medium text-black disabled:opacity-40"
                  >
                    {tieMode ? "Resolve Tie (random among tied)" : "Confirm Elimination"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={confirmElimination}
                  disabled={selected.length === 0}
                  className="tap-target rounded-lg bg-accent px-4 py-2 font-medium text-black disabled:opacity-40"
                >
                  Confirm Elimination
                </button>
              </div>
            )}
          </div>
        )}

        {view === "eliminated" && (
          <div className="mx-auto max-w-md space-y-6 text-center animate-pop">
            <h1 className="heading text-2xl">Eliminated</h1>
            <div className="card p-6 animate-pulse-fade">
              {(() => {
                const pid = state.rounds[state.rounds.length - 1]?.eliminatedPlayerId ?? "";
                const player = state.players.find((p) => p.id === pid);
                const role = roleMap.get(pid);
                return (
                  <>
                    <div className="heading text-xl">{player?.name}</div>
                    <div className="mt-2 text-sm text-muted-foreground">was</div>
                    <div className="mt-2 text-2xl font-semibold">
                      {role === "CIVILIAN" ? "Civilian" : role === "UNDERCOVER" ? "Undercover" : "Mr. White"}
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="text-xs text-muted-foreground">Remaining: {alivePlayers.map((p) => p.name).join(", ")}</div>
            <button onClick={eliminatedContinue} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black">
              Continue
            </button>
          </div>
        )}

        {view === "mrwhite" && (
          <div className="space-y-3">
            <div className="text-center">
              <h2 className="heading text-lg">Mr. White Guess</h2>
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const pid = state.rounds[state.rounds.length - 1]?.eliminatedPlayerId ?? "";
                  const player = state.players.find((p) => p.id === pid);
                  return `${player?.name || "Mr. White"} is guessing. Guess the Civilians' word.`;
                })()}
              </p>
            </div>
            <div className="card p-4 space-y-3">
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type the civilians' word"
                className="w-full rounded-md bg-background border border-white/10 p-3 outline-none focus:ring-2 focus:ring-[--ring]"
              />
              <button onClick={submitGuess} className="tap-target w-full rounded-md bg-accent px-4 py-2 font-medium text-black">
                Submit
              </button>
            </div>
          </div>
        )}

        {view === "win" && (
          <div className="space-y-4 text-center">
            <h1 className="heading text-3xl">
              {state.winners?.group === "CIVILIANS" ? "Civilians Win!" : state.winners?.group === "MR_WHITE" ? "Mr. White Wins!" : "Infiltrators Win!"}
            </h1>
            <div className="card p-4 space-y-2">
              <h2 className="heading text-lg">Winners</h2>
              <ul className="space-y-1">
                {(state.winners?.playerIds ?? []).map((id) => (
                  <li key={id}>{state.players.find((p) => p.id === id)?.name}</li>
                ))}
              </ul>
            </div>
            <div className="card p-4 space-y-2 text-left">
              <h3 className="heading text-base text-center">Full Reveal</h3>
              <ul className="space-y-2">
                {state.players.map((p) => {
                  const role = roleMap.get(p.id);
                  const badge =
                    role === "CIVILIAN" ? "bg-green-600/20 text-green-300" : role === "UNDERCOVER" ? "bg-red-600/20 text-red-300" : "bg-yellow-600/20 text-yellow-300";
                  const word = role === "MR_WHITE" ? "—" : role === "CIVILIAN" ? state.civilianWord : state.undercoverWord;
                  const lastElim = state.rounds[state.rounds.length - 1]?.eliminatedPlayerId;
                  let earned = 0;
                  if (state.winners?.group === "CIVILIANS" && role === "CIVILIAN") earned = 2;
                  if (state.winners?.group === "INFILTRATORS") earned = role === "UNDERCOVER" ? 10 : role === "MR_WHITE" ? 6 : 0;
                  if (state.winners?.group === "MR_WHITE") earned = role === "MR_WHITE" && p.id === lastElim ? 6 : 0;
                  return (
                    <li key={p.id} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="heading">{p.name}</span>
                        <span className={`rounded px-2 py-0.5 text-xs ${badge}`}>{role === "CIVILIAN" ? "Civilian" : role === "UNDERCOVER" ? "Undercover" : "Mr. White"}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground mr-2">{word}</span>
                        <span className="font-medium">{earned > 0 ? `+${earned}` : ""}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={playAgain} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black">
                Play Again
              </button>
              <button onClick={toLeaderboard} className="tap-target w-full rounded-lg border border-accent/40 px-4 py-3 font-medium">
                Leaderboard
              </button>
            </div>
          </div>
        )}

        {view === "leaderboard" && (
          <div className="space-y-3">
            <div className="text-center">
              <h2 className="heading text-lg">Leaderboard</h2>
            </div>
            <div className="card p-4">
              <ol className="space-y-2">
                {[...state.players].sort((a, b) => b.score - a.score).map((p, i) => (
                  <li key={p.id} className="flex items-center justify-between rounded bg-muted-surface px-3 py-2">
                    <div>
                      <span className="mr-2 text-muted-foreground">#{i + 1}</span>
                      <span className="heading">{p.name}</span>
                    </div>
                    <div className="text-sm">{p.score}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
