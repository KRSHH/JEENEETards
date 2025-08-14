
export interface SlurCounts {
  [slur: string]: number;
}

export interface UserTotalSlurs {
  [user: string]: number;
}

export interface UserSlurBreakdown {
  [user: string]: {
    [slur: string]: number;
  };
}

export interface InsultTargets {
  [user: string]: number;
}

export interface UserActivity {
  [user: string]: number;
}

export interface SlursBySub {
  [sub: string]: number;
}

export interface SlursByDay {
  [day: string]: number; // "0" (Mon) to "6" (Sun)
}

export interface SlursByHour {
  [hour: string]: number; // "0" to "23"
}

export interface SlurCombos {
  [combo: string]: number; // "slur1|slur2"
}

export interface AuthorMap {
  [id: string]: string;
}

export interface AnalysisData {
  slur_counts: SlurCounts;
  user_total_slurs: UserTotalSlurs;
  user_slur_breakdown: UserSlurBreakdown;
  insult_targets: InsultTargets;
  user_activity: UserActivity;
  slurs_by_sub: SlursBySub;
  slurs_by_day: SlursByDay;
  slurs_by_hour: SlursByHour;
  slur_combos: SlurCombos;
  time_series: number[]; // Unix timestamps
  author_map: AuthorMap;
}
