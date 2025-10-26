export interface Matches {
  team: string;
  comeback_wins: number;
  matches: MatchElement[];
}

export interface MatchElement {
  match: PurpleMatch;
  all_goals: AllGoal[];
  comeback_moments: ComebackMoment[];
}

export interface AllGoal {
  id: number;
  match_id: number;
  minute: string;
  player: string;
  team: string;
  type: Type;
  description: string;
  score_at_event: string;
  parsedMinute: number;
}

export enum Type {
  Goal = "goal",
}

export interface ComebackMoment {
  minute: number;
  score: string;
}

export interface PurpleMatch {
  id: number;
  season: string;
  match_date: string;
  home_team: string;
  away_team: string;
  final_score: string;
  half_time: string;
}
