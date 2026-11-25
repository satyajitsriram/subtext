"use client";
import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/lib/state";
import { eliminatePlayer, beginRound, checkVictory, isLooseMatch, startNewGame } from "@/lib/engine";
import { WORD_PAIRS_ALL } from "@/data/word-pairs";
import { Avatar } from "@/components/Avatar";
import { BrandMark } from "@/components/Brand";

type View =
  | "home"
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
  const [view, setView] = useState<View>("home");
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
  // Manual navigation only; no auto-advance to avoid UI flakiness

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
    if (state.players.length < 3 || state.players.length > 20) {
      alert("Enter between 3 and 20 player names");
      return;
    }
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
    <main className="min-h-[100dvh] px-4 pt-4 pb-[120px]">
      <div className="mx-auto max-w-md space-y-4">
        {/* top bar intentionally minimal per screen; remove redundant small 'Subtext' */}

        {view === "home" && (
          <div className="text-center">
            <div className="mx-auto mb-4 mt-8 w-[200px] h-[200px] relative">
              <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%),repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0_8px,rgba(0,0,0,0.02)_8px_16px),linear-gradient(180deg,var(--surface),var(--muted-surface))] shadow-[0_18px_40px_rgba(0,0,0,0.45)] border border-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BrandMark size={120} />
              </div>
            </div>
            <h1 className="heading text-5xl font-semibold tracking-wide">Subtext</h1>
            <p className="mt-3 text-base text-muted-foreground">Pass‑and‑play social deduction word game</p>
            <nav className="mt-6 flex items-center justify-center gap-4">
              <button onClick={() => setView("leaderboard")} className="underline text-sm underline-offset-4 text-foreground/90">Leaderboard</button>
              <button onClick={() => { if (typeof window !== "undefined") window.location.href = "/rules"; }} className="underline text-sm underline-offset-4 text-foreground/70">How to play</button>
            </nav>
            <div className="action-bar">
              <button onClick={() => setView("players")} className="btn-primary w-full">Start</button>
            </div>
          </div>
        )}

        {view === "players" && (
          <div className="card p-4 space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground">Add players (3–20)</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  className="flex-1 rounded-md bg-background border border-white/10 p-2"
                  placeholder="Enter player name"
                  value={namesText}
                  onChange={(e) => setNamesText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const name = namesText.trim();
                      if (!name) return;
                      const current = [...state.players.map((p) => p.name), name];
                      dispatch({ type: "INIT_PLAYERS", names: current });
                      setNamesText("");
                    }
                  }}
                />
                <button
                  className="rounded-md border border-accent/40 px-3 py-2"
                  onClick={() => {
                    const name = namesText.trim();
                    if (!name) return;
                    const current = [...state.players.map((p) => p.name), name];
                    dispatch({ type: "INIT_PLAYERS", names: current });
                    setNamesText("");
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            <ol className="max-h-[50vh] overflow-y-auto pr-1 space-y-2">
              {state.players.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 bg-muted-surface/40">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.name} />
                    <span className="heading">{p.name}</span>
                  </div>
                  <button
                    aria-label={`Remove ${p.name}`}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const remaining = state.players.filter((x) => x.id !== p.id).map((x) => x.name);
                      dispatch({ type: "INIT_PLAYERS", names: remaining });
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
            <div className="h-4" />
            <div className="action-bar">
              <button disabled={state.players.length < 3} onClick={onSavePlayers} className="btn-primary w-full" aria-disabled={state.players.length < 3}>
                Continue to Setup
              </button>
              <button onClick={() => setView("home")} className="btn-secondary w-full">
                Back
              </button>
            </div>
          </div>
        )}

        {view === "setup" && (
          <div className="min-h-[calc(100dvh-150px)] flex flex-col justify-center gap-3">
            <div className="card p-4 space-y-3">
              <div className="text-sm text-muted-foreground">Players: {state.players.length}</div>
              {/* Role summary */}
              <div className="flex flex-wrap gap-2">
                <span className="role-badge bg-green-600/15 text-green-300">Civilians {Math.max(0, state.players.length - state.settings.numUndercovers - state.settings.numMrWhites)}</span>
                <span className="role-badge bg-red-600/15 text-red-300">Undercovers {state.settings.numUndercovers}</span>
                <span className="role-badge bg-yellow-600/20 text-yellow-300">Mr. White {state.settings.numMrWhites}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Undercovers</label>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      aria-label="Decrease Undercovers"
                      className="rounded-md border border-white/15 px-3 py-2"
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_SETTINGS",
                          settings: { numUndercovers: Math.max(0, state.settings.numUndercovers - 1) },
                        })
                      }
                    >
                      −
                    </button>
                    <div className="flex-1 text-center rounded-md bg-background border border-white/10 py-2 heading">
                      {state.settings.numUndercovers}
                    </div>
                    <button
                      aria-label="Increase Undercovers"
                      className="rounded-md border border-white/15 px-3 py-2"
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_SETTINGS",
                          settings: {
                            numUndercovers: Math.min(state.players.length - 1, state.settings.numUndercovers + 1),
                          },
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Mr. Whites</label>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      aria-label="Decrease Mr. Whites"
                      className="rounded-md border border-white/15 px-3 py-2"
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_SETTINGS",
                          settings: { numMrWhites: Math.max(0, state.settings.numMrWhites - 1) },
                        })
                      }
                    >
                      −
                    </button>
                    <div className="flex-1 text-center rounded-md bg-background border border-white/10 py-2 heading">
                      {state.settings.numMrWhites}
                    </div>
                    <button
                      aria-label="Increase Mr. Whites"
                      className="rounded-md border border-white/15 px-3 py-2"
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_SETTINGS",
                          settings: {
                            numMrWhites: Math.min(state.players.length - 1, state.settings.numMrWhites + 1),
                          },
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-muted-foreground">Extra roles & word pool</summary>
                <div className="mt-2 grid gap-2 text-sm text-foreground/90">
                  <div className="flex flex-wrap gap-2">
                    {(state.settings.categories.length === 0 ? ["All categories"] : state.settings.categories).map((c) => (
                      <span key={c} className="role-badge border border-white/10">{c}</span>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">Optional specials are off by default to keep the classic game.</div>
                </div>
              </details>
            </div>
            <div className="action-bar">
              <button onClick={onDealWords} className="btn-primary w-full">Deal Words</button>
            </div>
          </div>
        )}

        {view === "reveal" && (
          <div className="min-h-[calc(100dvh-150px)] flex flex-col justify-center gap-3">
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
                className="btn-secondary w-full"
              >
                Reveal all (test)
              </button>
            )}
            {e2e ? (
              <div className="space-y-2">
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
                      <div className={`flip-inner h-full w-full`} style={{ transform: open ? "rotateY(180deg)" : "none" }} data-open={open ? "true" : "false"}>
                        <div className="flip-front absolute inset-0 flex items-center justify-center p-3">
                          <div className="text-center">
                            <div className="heading text-lg">{p.name}</div>
                            <div className="text-xs text-muted-foreground">Tap to reveal</div>
                          </div>
                        </div>
                        <div className={`flip-back absolute inset-0 flex items-center justify-center p-3`}>
                          <div className="text-center">
                            <div className="heading text-lg">{p.name}</div>
                            <div
                              className={`mt-2 rounded-md px-3 py-2 word-text word-card ${
                                role === "MR_WHITE" ? "mrwhite" : role === "CIVILIAN" ? "civilian" : "undercover"
                              }`}
                            >
                              {secret}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
                </div>
                <div className="action-bar">
                  <button
                    disabled={!canStartRound}
                    onClick={startRound}
                    className="btn-primary w-full"
                    aria-disabled={!canStartRound}
                  >
                    Start Round
                  </button>
                </div>
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
                      <div className={`flip-inner h-full w-full`} style={{ transform: isOpen ? "rotateY(180deg)" : "none" }} data-open={isOpen ? "true" : "false"}>
                        <div className="flip-front absolute inset-0 flex items-center justify-center p-3">
                          <div className="text-center">
                            <div className="heading text-lg">{p?.name}</div>
                            <div className="text-xs text-muted-foreground">Tap to reveal</div>
                          </div>
                        </div>
                        <div className="flip-back absolute inset-0 flex items-center justify-center p-3">
                          <div className="text-center">
                            <div className="heading text-lg">{p?.name}</div>
                            <div
                              className={`mt-2 rounded-md px-3 py-2 word-text word-card ${
                                role === "MR_WHITE" ? "mrwhite" : role === "CIVILIAN" ? "civilian" : "undercover"
                              }`}
                            >
                              {secret}
                            </div>
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
                    <div className="action-bar">
                      {revealIndex + 1 < state.players.length ? (
                        <button
                          disabled={!pid || !hasRevealed[pid]}
                          onClick={() => {
                            const next = revealIndex + 1;
                            setRevealIndex(next);
                            setIsOpen(false);
                          }}
                          className="btn-primary w-full"
                        >
                          Next Player
                        </button>
                      ) : null}
                      {revealIndex + 1 >= state.players.length ? (
                        <button disabled={!state.players.every((pl) => hasRevealed[pl.id])} onClick={startRound} className="btn-primary w-full" aria-disabled={!state.players.every((pl) => hasRevealed[pl.id])}>
                          Start Round
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })()
            )}
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
                  <li key={pid} className="rounded bg-muted-surface px-3 py-2 flex items-center gap-2">
                    <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                    <Avatar name={state.players.find((p) => p.id === pid)?.name || "?"} />
                    <span>{state.players.find((p) => p.id === pid)?.name}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="text-xs text-muted-foreground">Remaining: {alivePlayers.map((p) => p.name).join(", ")}</div>
            <div className="action-bar">
              <button onClick={proceedVoting} className="btn-primary w-full">
                Proceed to Voting
              </button>
            </div>
          </div>
        )}

        {view === "vote" && (
          <div className="min-h-[calc(100dvh-150px)] flex flex-col justify-center gap-3">
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
                    className={`vote-card rounded-lg border p-4 text-center ${active ? "active border-accent bg-muted-surface" : "border-white/10 bg-muted-surface"}`}
                  >
                    <span className="check">✓</span>
                    <div className="mb-1"><Avatar name={p.name} /></div>
                    <div className="heading">{p.name}</div>
                  </button>
                );
              })}
            </div>
            {!tiedIds ? (
              <div className="action-bar">
                <button
                  onClick={() => setTieMode((m) => !m)}
                  className={`btn-secondary w-full ${tieMode ? "btn-toggle-on" : ""}`}
                >
                  {tieMode ? "Tie mode: On" : "It's a tie"}
                </button>
                {tieMode && selected.length >= 2 && (
                  <button
                    onClick={() => {
                      setTiedIds([...selected]);
                      setSelected([]);
                      setTieMode(false);
                    }}
                    className="btn-secondary w-full"
                  >
                    Start Tie Face-off
                  </button>
                )}
                <button
                  onClick={confirmElimination}
                  disabled={selected.length === 0 || (tieMode && selected.length < 2)}
                  className="btn-primary w-full"
                  aria-disabled={selected.length === 0 || (tieMode && selected.length < 2)}
                >
                  {tieMode ? "Resolve Tie (random among tied)" : "Confirm Elimination"}
                </button>
              </div>
            ) : (
              <div className="action-bar">
                <button
                  onClick={confirmElimination}
                  disabled={selected.length === 0}
                  className="btn-primary w-full"
                  aria-disabled={selected.length === 0}
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
            <div className="card p-6">
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
                    <div className="mt-4">
                      <span className="stamp">{role === "UNDERCOVER" ? "Undercover" : role === "CIVILIAN" ? "Civilian" : "Mr. White"}</span>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="text-xs text-muted-foreground">Remaining: {alivePlayers.map((p) => p.name).join(", ")}</div>
            <div className="action-bar">
              <button onClick={eliminatedContinue} className="btn-primary w-full">Continue</button>
            </div>
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
              <div className="h-10" />
              <div className="action-bar">
                <button onClick={submitGuess} className="btn-primary w-full">Submit</button>
              </div>
            </div>
          </div>
        )}

        {view === "win" && (
          <div className="space-y-4 text-center">
            <h1
              className={`heading text-4xl font-semibold ${
                state.winners?.group === "CIVILIANS"
                  ? "text-green-300"
                  : state.winners?.group === "MR_WHITE"
                  ? "text-yellow-300"
                  : "text-red-300"
              } confetti`}
            >
              {state.winners?.group === "CIVILIANS" ? "Civilians Win!" : state.winners?.group === "MR_WHITE" ? "Mr. White Wins!" : "Infiltrators Win!"}
            </h1>
            <div className="card p-4">
              <div className="heading text-base">Words</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="word-card civilian rounded-md px-3 py-2">
                  <div className="text-muted-foreground text-xs">Civilian</div>
                  <div className="heading">{state.civilianWord}</div>
                </div>
                <div className="word-card undercover rounded-md px-3 py-2">
                  <div className="text-muted-foreground text-xs">Undercover</div>
                  <div className="heading">{state.undercoverWord}</div>
                </div>
              </div>
            </div>
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
            <div className="action-bar">
              <button onClick={playAgain} className="btn-primary w-full">Play Again</button>
              <button onClick={toLeaderboard} className="btn-secondary w-full">Leaderboard</button>
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
