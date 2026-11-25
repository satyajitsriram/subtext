export type Role = "CIVILIAN" | "UNDERCOVER" | "MR_WHITE";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface AssignedRole {
  playerId: string;
  role: Role;
  word?: string; // undefined for Mr. White
}

export interface WordPair {
  a: string;
  b: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  spicy?: boolean;
}

export type TieBreaker =
  | "revote" // tied players give one more clue, then re-vote among them
  | "random" // Goddess of Justice
  | "manual"; // facilitator decides (e.g., rock-paper-scissors)

export interface SpecialRolesConfig {
  goddessOfJustice: boolean;
  lovers: boolean;
  mrMeme: boolean;
  revenger: boolean;
  duelists: boolean;
  ghost: boolean; // eliminated can still vote
  falafelVendor: boolean;
  boomerang: boolean;
  joyFool: boolean;
}

export interface SpecialAssignments {
  goddessId?: string;
  loversPair?: [string, string];
  duelistsPair?: [string, string];
  revengerId?: string;
  falafelVendorId?: string;
  boomerangId?: string;
  joyFoolId?: string;
  boomerangUsed?: boolean;
}

export interface GameSettings {
  numUndercovers: number;
  numMrWhites: number;
  revealOnElimination: boolean; // official app reveals; toggleable
  allowRecheckWord: boolean;
  soundsEnabled?: boolean; // off by default
  tieBreaker: TieBreaker;
  includeSpicy: boolean; // off by default
  categories: string[]; // empty = all
  difficulties: Array<"easy" | "medium" | "hard">; // defaults to all
  specials: SpecialRolesConfig;
}

export interface RoundState {
  roundNumber: number;
  speakingOrder: string[]; // playerIds, randomized each round
  votes?: Record<string, string>; // voterId -> targetId
  faceOffIds?: string[]; // when tie occurs
  eliminatedPlayerId?: string;
  mrMemeId?: string; // for this round
  falafelGivenToId?: string; // target of vendor this round
}

export interface GameState {
  players: Player[];
  alivePlayerIds: string[];
  assignedRoles?: AssignedRole[]; // present after setup
  civilianWord?: string;
  undercoverWord?: string;
  mrWhiteAlive?: boolean;
  usedWordIndices: number[]; // indices into master word list for no-repeat
  currentWordIndex?: number; // index of pair in play
  settings: GameSettings;
  specials?: SpecialAssignments;
  rounds: RoundState[];
  status:
    | "idle" // before setup
    | "revealing" // pass-and-play reveal words
    | "in_round" // describing + discussion
    | "voting" // voting/faceoff
    | "faceoff" // tie faceoff phase
    | "goddess_tie" // goddess of justice resolving tie
    | "revenger_pick" // revenger picks someone to eliminate
    | "boomerang_bounce" // boomerang choose target among voters
    | "finished";
  winners?: {
    group: "CIVILIANS" | "INFILTRATORS" | "MR_WHITE";
    playerIds: string[];
  };
}
