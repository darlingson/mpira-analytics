# Mpira Stats — Current Analytics

## Team Performance (per team, all seasons)

Shown on `/team-performance/[id]` with 3 tabs.

### Overview Tab (via `GET /api/team-overview/[teamId]`)

| Stat | Definition |
|------|-----------|
| **Matches Played** | Total matches involving the team |
| **Goals For** | Goals scored by the team (counted from goal events) |
| **Goals Against** | Goals conceded (parsed from `final_score`) |
| **Goals Per Match** | `goalsFor / matchesPlayed` |
| **Top Scorers** | Top 5 players by goals for this team |
| **Biggest Win** | Match with largest goal margin |
| **High-Scoring Matches** | Matches where the team scored ≥3 goals (top 4) |

### Attack Tab (via `GET /api/team-attack-insights/[teamId]`)

| Stat | Definition |
|------|-----------|
| **Fastest Goal** | Earliest minute the team has ever scored |
| **Latest Winning Goal** | Latest minute the team scored a goal that put them ahead |
| **Equalizers** | Goals where the team was behind and the goal tied the match (grouped by player) |
| **First 5' Win Rate** | % of matches where the team scored in the first 5 minutes AND won — `(first5Won / first5Scored) × 100` |

### Defense Tab (via `GET /api/team-insights/[teamId]`)

| Stat | Definition |
|------|-----------|
| **Comeback Wins** | Matches the team won after being behind at any point during the match |
| **Scored First & Won** | Matches where the team scored the first goal and won |
| **Scored First & Lost** | Matches where the team scored first but lost (heartbreakers) |
| **Clean Sheets** | Matches where the opponent scored 0 |

---

## Season Stats (comparative)

Shown on `/seasons` via `GET /api/seasons/performance`.

| Stat | Definition |
|------|-----------|
| **Matches Played** | Total games per team per season |
| **Wins / Draws / Losses** | Win-draw-loss record |
| **Goals Scored / Conceded** | From `final_score` parsing |
| **Goal Difference** | `goals_scored - goals_conceded` |
| **Home / Away Goals** | Split by venue |
| **Avg Goals Per Game** | `goals_scored / matches_played` |
| **Avg Goals Conceded Per Game** | `goals_conceded / matches_played` |
| **Clean Sheets** | Matches where opponent scored 0 |
| **Failed to Score** | Matches where the team scored 0 |
| **Home / Away Record** | e.g. `10W-3D-2L` |

Displayed in 3 tabs: Table View (all teams), Team Comparison (multi-select), Season Comparison (single team across seasons).

---

## Event Stats (via `GET /api/events/stats`)

| Stat | Definition |
|------|-----------|
| **Event Counts** | Total goals, yellow cards, red cards across all matches |
| **Average Events Per Match** | `total events / total matches` |
| **Discipline Per Team** | Yellow card and red card counts per team |

---

## Goal Timings (via `GET /api/goals/timings`)

| Stat | Definition |
|------|-----------|
| **Average Goal Time Per Team** | Mean minute of all goals scored by each team |
| **Goals By Period** | Goals distributed into 15-minute intervals: 0-15, 16-30, 31-45, 46-60, 61-75, 76-90 |
| **Minute Histogram** | Per-minute goal count (minute-by-minute breakdown) |

---

## Top Scorers (via `GET /api/top-scorers`)

| Stat | Definition |
|------|-----------|
| **Player** | Scorer name |
| **Team** | The scorer's team |
| **Goals** | Total goals (filtered by optional season) |

---

## Cross-Team Insights

Shown on the `/home` page. Note: API endpoints exist but most frontend components currently use hardcoded data.

### Comeback Kings (`GET /api/insights/comeback-kings`)
Teams ranked by number of comeback wins. A comeback is when the winner was behind at any point during the match's goal timeline.

### Heart Breakers (`GET /api/insights/heart-breakers`)
Teams ranked by how many times they scored first but ended up losing.

### Latest Winning Goal Minute (`GET /api/insights/latest-winning-goal-minute`)
For each team, the latest minute they've scored a winning goal (the goal that put them ahead to win).

### Score First & Win (`GET /api/insights/score-first-win`)
For each non-draw match, the team that scored first. If they won, it counts. Shows count and win rate.

### Lead at Half-Time → Win (`GET /api/insights/lead-hf-win`)
Teams that led at half-time and went on to win. Shows win rate: `(games_won_after_fh_goal / games_with_fh_goals) × 100`.

### The Equalizers (`GET /api/insights/the-equalizers`)
Individual players ranked by number of equalizing goals scored (goals that tied the match when their team was behind).

### Win Rate When Scoring Inside 5' (`GET /api/insights/win-rate-when-scoring-inside-five`)
Per team, how often they win when scoring in the first 5 minutes. Rate = `(first5_and_win / scored_first5) × 100`.

### Clean Sheet When Scoring First (`GET /api/insights/clean-sheet-when-scoring-first`)
Teams that score first AND keep a clean sheet in the same match.

### Clean Sheet HT → Clean Sheet FT (`GET /api/insights/clean-sheet-ht-clean-sheet-ft`)
Teams that kept a clean sheet in the first half AND also kept a clean sheet full-time.

### Red Card Survival (`GET /api/insights/red-card-survival`)
When a team receives a red card, how often they avoid defeat (win or draw).

### Fastest Goal & Result (`GET /api/insights/fastest-goal-and-result`)
Each team's fastest goal ever scored, and whether they won that match.

### Penalty Dependency (`GET /api/insights/penalty-dependency`)
What percentage of each team's goals come from penalties.

### Disciplined Then Deadly (`GET /api/insights/disciplined-then-deadly`)
Matches where a team received a card in the first half AND scored a goal in the second half.

### Late Drama (`GET /api/insights/late-drama`)
Points gained or lost due to goals scored after the 75th minute. Computed by comparing actual results with hypothetical results without late goals.

---

## Admin

Shown on `/admin/dashboard`.

| Feature | Definition |
|---------|-----------|
| **Recent Matches** | Last 10 matches (via `GET /api/matches/recent`) |
| **Match List** | Paginated, searchable, sortable match table (via `GET /api/matches`) |
| **Create Match** | Form to insert a new match row |
| **Match Detail** | Match info + all events; form to record new events (goals, cards) |
| **Team List** | All teams with metadata (via `GET /api/teams`) |
| **Create Team** | Form to add a new team |
