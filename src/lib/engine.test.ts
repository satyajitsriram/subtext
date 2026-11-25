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
} from "./engine";
import { WORD_PAIRS } from "@/data/word-pairs";
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
    const res = pickWordPair(WORD_PAIRS, [], { includeSpicy: false, categories: [], difficulties: ["easy", "medium", "hard"] }, () => 0.1);
    expect(res.civilianWord).toBeTruthy();
    expect(res.undercoverWord).toBeTruthy();
  });

  it("mr white forgiving guess", () => {
    expect(isLooseMatch("Pineapple", "pine apples")).toBe(true);
    expect(isLooseMatch("tomatoes", "tomato")).toBe(true);
    expect(isLooseMatch("tortoise", "tortiose")).toBe(true);
  });

  it("civilian victory when no infiltrators remain", () => {
    const players = initPlayersFromNames(["A", "B", "C", "D"]);
    const st = startNewGame(players, { ...baseSettings, numUndercovers: 1, numMrWhites: 1 }, WORD_PAIRS, [], () => 0.2);
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
    const st = startNewGame(players, { ...baseSettings, numUndercovers: 2, numMrWhites: 0 }, WORD_PAIRS, [], () => 0.3);
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
    let st = startNewGame(players, { ...baseSettings, numUndercovers: 1, numMrWhites: 1 }, WORD_PAIRS, [], () => 0.31);
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
});
