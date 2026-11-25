import { describe, expect, it } from "vitest";
import {
  assignRoles,
  checkVictory,
  initPlayersFromNames,
  isLooseMatch,
  pickWordPair,
  shuffleArray,
  suggestRoles,
  startNewGame,
  applyVictoryScoring,
  eliminatePlayer,
  beginRound,
  mrWhiteGuessVictory,
} from "./engine";
import { WORD_PAIRS_ALL } from "@/data/word-pairs";
import { GameSettings } from "./types";

const baseSettings: GameSettings = {
  numUndercovers: 1,
  numMrWhites: 1,
  revealOnElimination: true,
  allowRecheckWord: true,
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

describe("engine", () => {
  it("suggests sensible roles", () => {
    expect(suggestRoles(3)).toEqual({ numUndercovers: 1, numMrWhites: 0 });
    const s7 = suggestRoles(7);
    expect(s7.numUndercovers).toBeGreaterThanOrEqual(1);
  });

  it("assigns roles and preserves counts", () => {
    const players = initPlayersFromNames(["A", "B", "C", "D", "E"]);
    const roles = assignRoles(players, 1, 1, () => 0.42);
    const u = roles.filter((r) => r.role === "UNDERCOVER").length;
    const m = roles.filter((r) => r.role === "MR_WHITE").length;
    const c = roles.filter((r) => r.role === "CIVILIAN").length;
    expect(u).toBe(1);
    expect(m).toBe(1);
    expect(c).toBe(3);
  });

  it("picks word pair with filters", () => {
    const res = pickWordPair(WORD_PAIRS_ALL, [], { includeSpicy: false, categories: [], difficulties: ["easy", "medium", "hard"] }, () => 0.1);
    expect(res.civilianWord).toBeTruthy();
    expect(res.undercoverWord).toBeTruthy();
  });

  it("mr white forgiving guess", () => {
    expect(isLooseMatch("Pineapple", "pine apples")).toBe(true);
    expect(isLooseMatch("tomatoes", "tomato")).toBe(true);
    expect(isLooseMatch("tortoise", "tortiose")).toBe(true);
  });

  it("speaking order includes only alive players", () => {
    const players = initPlayersFromNames(["A", "B", "C", "D"]);
    const st = startNewGame(players, { ...baseSettings, numUndercovers: 1, numMrWhites: 0 }, WORD_PAIRS_ALL, [], () => 0.4);
    const s2 = { ...st, status: "in_round" as const };
    const roundState = beginRound(s2);
    const last = roundState.rounds[roundState.rounds.length - 1];
    expect(last.speakingOrder.every((id: string) => s2.alivePlayerIds.includes(id))).toBe(true);
  });

  it("civilian victory when no infiltrators remain", () => {
    const players = initPlayersFromNames(["A", "B", "C", "D"]);
    const st = startNewGame(players, { ...baseSettings, numUndercovers: 1, numMrWhites: 1 }, WORD_PAIRS_ALL, [], () => 0.2);
    // eliminate all infiltrators
    const roles = new Map(st.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []);
    let s = st;
    for (const [pid, role] of roles) {
      if (role !== "CIVILIAN") {
        s = eliminatePlayer(s, pid);
      }
    }
    const v = checkVictory(s);
    expect(v?.group).toBe("CIVILIANS");
  });

  it("infiltrators victory when one civilian remains", () => {
    const players = initPlayersFromNames(["A", "B", "C", "D", "E"]);
    const st = startNewGame(players, { ...baseSettings, numUndercovers: 2, numMrWhites: 0 }, WORD_PAIRS_ALL, [], () => 0.3);
    const roles = new Map(st.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []);
    let s = st;
    // eliminate civilians until 1 remains
    const civs = [...roles].filter(([, r]) => r === "CIVILIAN").map(([id]) => id);
    while (civs.length > 1) {
      const id = civs.shift()!;
      s = eliminatePlayer(s, id);
    }
    const v = checkVictory(s);
    expect(v?.group).toBe("INFILTRATORS");
  });

  it("applies scoring per official rules", () => {
    const players = initPlayersFromNames(["A", "B", "C", "D", "E"]);
    let st = startNewGame(players, { ...baseSettings, numUndercovers: 1, numMrWhites: 1 }, WORD_PAIRS_ALL, [], () => 0.31);
    const roles = new Map(st.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []);
    // pretend infiltrators won
    const infiltrators = st.players.filter((p) => roles.get(p.id) !== "CIVILIAN").map((p) => p.id);
    st = applyVictoryScoring(st, { group: "INFILTRATORS", playerIds: infiltrators });
    const u = st.players.filter((p) => roles.get(p.id) === "UNDERCOVER")[0];
    const w = st.players.filter((p) => roles.get(p.id) === "MR_WHITE")[0];
    const c = st.players.filter((p) => roles.get(p.id) === "CIVILIAN")[0];
    expect(u.score).toBe(10);
    expect(w.score).toBe(6);
    expect(c.score).toBe(0);
  });

  it("lovers elimination cascades; duelists scoring; joy fool bonus", () => {
    const players = initPlayersFromNames(["A", "B", "C", "D", "E"]);
    let st = startNewGame(
      players,
      { ...baseSettings, numUndercovers: 1, numMrWhites: 0, specials: { ...baseSettings.specials, lovers: true, duelists: true, joyFool: true } },
      WORD_PAIRS_ALL,
      [],
      () => 0.12
    );
    const lovers = st.specials?.loversPair!;
    const duel = st.specials?.duelistsPair!;
    const joy = st.specials?.joyFoolId!;
    // First eliminate joy fool: +4
    st = eliminatePlayer(st, joy);
    const joyP = st.players.find((p) => p.id === joy)!;
    expect(joyP.score).toBe(4);
    // Eliminate one lover cascades to both dead
    const l0 = lovers[0];
    const aliveBefore = new Set(st.alivePlayerIds);
    st = eliminatePlayer(st, l0);
    expect(aliveBefore.has(lovers[1])).toBe(true);
    expect(st.alivePlayerIds.includes(lovers[1])).toBe(false);
    // Duelists scoring applies when one of the pair is eliminated
    const d0 = duel[0];
    const d1 = duel[1];
    const beforeD0 = st.players.find((p) => p.id === d0)!.score;
    const beforeD1 = st.players.find((p) => p.id === d1)!.score;
    st = eliminatePlayer(st, d0);
    expect(st.players.find((p) => p.id === d0)!.score).toBe(beforeD0 - 2);
    expect(st.players.find((p) => p.id === d1)!.score).toBe(beforeD1 + 2);
  });

  it("mr white guess immediate win edge case", () => {
    const players = initPlayersFromNames(["A", "B", "C", "D"]);
    let st = startNewGame(players, { ...baseSettings, numUndercovers: 1, numMrWhites: 1 }, WORD_PAIRS_ALL, [], () => 0.45);
    // No matter if other infiltrators remain, correct guess wins
    const cw = st.civilianWord!;
    expect(mrWhiteGuessVictory(st, cw)).toBe(true);
  });
});
