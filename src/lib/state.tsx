/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { GameSettings, GameState, Player, TieBreaker, SpecialRolesConfig } from "./types";
import { WORD_PAIRS_ALL } from "@/data/word-pairs";
import { applyVictoryScoring, beginRound, castVotes, checkVictory, eliminatePlayer, initPlayersFromNames, isLooseMatch, mrWhiteGuessVictory, startNewGame } from "./engine";

type Action =
  | { type: "INIT_PLAYERS"; names: string[] }
  | { type: "LOAD_STATE"; state: GameState }
  | { type: "UPDATE_SETTINGS"; settings: Partial<GameSettings> }
  | { type: "START_GAME" }
  | { type: "FINISH_REVEAL" }
  | { type: "START_ROUND" }
  | { type: "SET_TIE_MODE"; mode: TieBreaker }
  | { type: "ELIMINATE"; playerId: string }
  | { type: "SET_STATUS"; status: GameState["status"] }
  | { type: "START_FACEOFF"; playerIds: string[] }
  | { type: "GODDESS_DECIDE"; playerId: string }
  | { type: "SET_FALAFEL"; targetId: string; effect: "PROTECT" | "SABOTAGE" }
  | { type: "MARK_BOOMERANG_USED" }
  | { type: "RESTART_SAME_PLAYERS" }
  | { type: "RESET_ALL" }
  | { type: "ADD_CUSTOM_PAIR"; a: string; b: string; category?: string; difficulty?: GameSettings["difficulties"][number] }
  | { type: "END_WITH_VICTORY"; victory: NonNullable<GameState["winners"]> };

const defaultSettings: GameSettings = {
  numUndercovers: 1,
  numMrWhites: 1,
  revealOnElimination: true,
  allowRecheckWord: true,
  soundsEnabled: false,
  tieBreaker: "revote",
  includeSpicy: false,
  categories: [],
  difficulties: ["easy", "medium", "hard"],
  specials: {
    goddessOfJustice: false,
    lovers: false,
    mrMeme: false,
    revenger: false,
    duelists: false,
    ghost: false,
    falafelVendor: false,
    boomerang: false,
    joyFool: false,
  },
};

const initialState: GameState = {
  players: [],
  alivePlayerIds: [],
  usedWordIndices: [],
  settings: defaultSettings,
  rounds: [],
  status: "idle",
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "INIT_PLAYERS": {
      const players: Player[] = initPlayersFromNames(action.names);
      return { ...initialState, players, alivePlayerIds: players.map((p) => p.id) };
    }
    case "LOAD_STATE":
      return action.state;
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "START_GAME": {
      let pool = WORD_PAIRS_ALL.slice();
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("subtext_custom_pairs");
          if (raw) {
            const extras = JSON.parse(raw) as any[];
            for (const e of extras) {
              pool.push({
                a: String(e.a),
                b: String(e.b),
                category: String(e.category || "custom"),
                difficulty: (e.difficulty || "easy") as any,
              });
            }
          }
        } catch {}
      }
      const started = startNewGame(state.players, state.settings, pool, state.usedWordIndices);
      return started;
    }
    case "FINISH_REVEAL": {
      return { ...state, status: "in_round" };
    }
    case "START_ROUND": {
      return beginRound(state);
    }
    case "START_FACEOFF": {
      const rounds = state.rounds.slice();
      if (rounds.length > 0) {
        rounds[rounds.length - 1] = { ...rounds[rounds.length - 1], faceOffIds: action.playerIds };
      }
      return { ...state, rounds, status: "faceoff" };
    }
    case "GODDESS_DECIDE": {
      // Eliminate chosen by Goddess
      const next = eliminatePlayer(state, action.playerId);
      return { ...next, status: "voting" };
    }
    case "SET_FALAFEL": {
      const rounds = state.rounds.slice();
      if (rounds.length > 0) {
        rounds[rounds.length - 1] = {
          ...rounds[rounds.length - 1],
          falafelGivenToId: action.targetId,
          falafelEffect: action.effect,
        };
      }
      return { ...state, rounds };
    }
    case "SET_TIE_MODE":
      return { ...state, settings: { ...state.settings, tieBreaker: action.mode } };
    case "ELIMINATE": {
      return eliminatePlayer(state, action.playerId);
    }
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "MARK_BOOMERANG_USED":
      return { ...state, specials: { ...state.specials, boomerangUsed: true } };
    case "RESTART_SAME_PLAYERS": {
      // keep players & scores, start new game with next word
      const restarted = startNewGame(state.players, state.settings, WORD_PAIRS_ALL, state.usedWordIndices);
      return restarted;
    }
    case "RESET_ALL":
      return initialState;
    case "ADD_CUSTOM_PAIR": {
      // For extensibility: in this version, we store in localStorage external to WORD_PAIRS
      // handled in provider persistCustomPair.
      return state;
    }
    case "END_WITH_VICTORY": {
      const next = applyVictoryScoring(state, action.victory);
      return next;
    }
    default:
      return state;
  }
}

type Ctx = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  persist: () => void;
  load: () => void;
  persistCustomPair: (a: string, b: string, category?: string, difficulty?: GameState["settings"]["difficulties"][number]) => void;
  getCustomPairs: () => { a: string; b: string; category: string; difficulty: "easy" | "medium" | "hard" }[];
  voteAndResolve: (votesOrEliminated: { votes?: Record<string, string>; eliminatedId?: string }) => void;
  checkAndFinishVictory: (mrWhiteGuess?: string) => void;
};

const GameContext = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const persist = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("subtext_state", JSON.stringify(state));
  }, [state]);

  const load = useCallback(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("subtext_state");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as GameState;
      dispatch({ type: "LOAD_STATE", state: parsed });
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    // Load once on mount
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    persist();
  }, [persist, state]);

  const persistCustomPair = useCallback((a: string, b: string, category = "custom", difficulty: "easy" | "medium" | "hard" = "easy") => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("subtext_custom_pairs");
    const arr = raw ? (JSON.parse(raw) as any[]) : [];
    arr.push({ a, b, category, difficulty });
    localStorage.setItem("subtext_custom_pairs", JSON.stringify(arr));
  }, []);

  const getCustomPairs = useCallback(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("subtext_custom_pairs");
    const arr = raw ? (JSON.parse(raw) as any[]) : [];
    return arr;
  }, []);

  const voteAndResolve = useCallback(
    ({ votes, eliminatedId }: { votes?: Record<string, string>; eliminatedId?: string }) => {
      if (eliminatedId) {
        dispatch({ type: "ELIMINATE", playerId: eliminatedId });
        return;
      }
      if (!votes) return;
      const { topIds } = castVotes(state, votes);
      if (topIds.length === 1) {
        dispatch({ type: "ELIMINATE", playerId: topIds[0] });
      } else {
        // leave it to UI depending on tieBreaker
        // no direct state change here; caller will follow up
      }
    },
    [state]
  );

  const checkAndFinishVictory = useCallback(
    (mrWhiteGuess?: string) => {
      // If last eliminated is Mr. White and a guess is provided:
      if (mrWhiteGuess) {
        if (mrWhiteGuessVictory(state, mrWhiteGuess)) {
          // Mr. White immediate win
          dispatch({ type: "END_WITH_VICTORY", victory: { group: "MR_WHITE", playerIds: state.players.filter((p) => p.id && true).map((p) => p.id) } });
          return;
        }
      }
      const v = checkVictory(state);
      if (v) {
        dispatch({ type: "END_WITH_VICTORY", victory: v });
      }
    },
    [state]
  );

  const value = useMemo<Ctx>(
    () => ({ state, dispatch, persist, load, persistCustomPair, getCustomPairs, voteAndResolve, checkAndFinishVictory }),
    [state, persist, load, persistCustomPair, getCustomPairs, voteAndResolve, checkAndFinishVictory]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
