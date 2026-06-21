import { pgTable, unique, text, timestamp, index, foreignKey, serial, varchar, date, check, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const users = pgTable("users", {
	id: text().default(sql`gen_random_uuid()`).primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`now()`),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const refreshTokens = pgTable("refresh_tokens", {
	id: text().default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: text("user_id"),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`now()`),
}, (table) => [
	index("idx_rt_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "refresh_tokens_user_id_fkey"
		}).onDelete("cascade"),
	unique("refresh_tokens_token_hash_key").on(table.tokenHash),
]);

export const players = pgTable("players", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	shortName: varchar("short_name", { length: 100 }),
	dateOfBirth: date("date_of_birth"),
	nationality: varchar({ length: 100 }),
	photoUrl: text("photo_url"),
	position: varchar({ length: 50 }),
});

export const teams = pgTable("teams", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	shortName: varchar("short_name", { length: 50 }),
	logoUrl: text("logo_url"),
	country: varchar({ length: 100 }),
});

export const competitions = pgTable("competitions", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	season: varchar({ length: 50 }).notNull(),
});

export const playerTeamHistory = pgTable("player_team_history", {
	id: serial().primaryKey().notNull(),
	playerId: integer("player_id").notNull(),
	teamId: integer("team_id").notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
}, (table) => [
	index("idx_player_team_history_dates").using("btree", table.playerId.asc().nullsLast().op("date_ops"), table.startDate.asc().nullsLast().op("date_ops"), table.endDate.asc().nullsLast().op("date_ops")),
	index("idx_player_team_history_player").using("btree", table.playerId.asc().nullsLast().op("int4_ops")),
	index("idx_player_team_history_team").using("btree", table.teamId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.playerId],
			foreignColumns: [players.id],
			name: "fk_player_team_history_player"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "fk_player_team_history_team"
		}),
	check("check_dates_valid", sql`(end_date IS NULL) OR (end_date >= start_date)`),
]);

export const matches = pgTable("matches", {
	id: serial().primaryKey().notNull(),
	competitionId: integer("competition_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	homeTeamId: integer("home_team_id").notNull(),
	awayTeamId: integer("away_team_id").notNull(),
	scoreHome: integer("score_home"),
	scoreAway: integer("score_away"),
	venue: varchar({ length: 255 }),
}, (table) => [
	index("idx_matches_away_team").using("btree", table.awayTeamId.asc().nullsLast().op("int4_ops")),
	index("idx_matches_competition_date").using("btree", table.competitionId.asc().nullsLast().op("int4_ops"), table.date.asc().nullsLast().op("int4_ops")),
	index("idx_matches_home_team").using("btree", table.homeTeamId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.competitionId],
			foreignColumns: [competitions.id],
			name: "fk_matches_competition"
		}),
	foreignKey({
			columns: [table.homeTeamId],
			foreignColumns: [teams.id],
			name: "fk_matches_home_team"
		}),
	foreignKey({
			columns: [table.awayTeamId],
			foreignColumns: [teams.id],
			name: "fk_matches_away_team"
		}),
	check("check_teams_different", sql`home_team_id <> away_team_id`),
]);

export const matchEvents = pgTable("match_events", {
	id: serial().primaryKey().notNull(),
	matchId: integer("match_id").notNull(),
	playerId: integer("player_id").notNull(),
	eventType: varchar("event_type", { length: 50 }).notNull(),
	minute: integer().notNull(),
	assistingPlayerId: integer("assisting_player_id"),
}, (table) => [
	index("idx_match_events_assisting_player").using("btree", table.assistingPlayerId.asc().nullsLast().op("int4_ops")),
	index("idx_match_events_match").using("btree", table.matchId.asc().nullsLast().op("int4_ops")),
	index("idx_match_events_player").using("btree", table.playerId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.matchId],
			foreignColumns: [matches.id],
			name: "fk_match_events_match"
		}),
	foreignKey({
			columns: [table.playerId],
			foreignColumns: [players.id],
			name: "fk_match_events_player"
		}),
	foreignKey({
			columns: [table.assistingPlayerId],
			foreignColumns: [players.id],
			name: "fk_match_events_assisting_player"
		}),
	check("check_minute_valid", sql`(minute >= 0) AND (minute <= 130)`),
]);
