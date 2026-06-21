import { relations } from "drizzle-orm/relations";
import { users, refreshTokens, players, playerTeamHistory, teams, leagues, competitions, matches, matchEvents } from "./schema";

export const refreshTokensRelations = relations(refreshTokens, ({one}) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	refreshTokens: many(refreshTokens),
}));

export const playerTeamHistoryRelations = relations(playerTeamHistory, ({one}) => ({
	player: one(players, {
		fields: [playerTeamHistory.playerId],
		references: [players.id]
	}),
	team: one(teams, {
		fields: [playerTeamHistory.teamId],
		references: [teams.id]
	}),
}));

export const playersRelations = relations(players, ({many}) => ({
	playerTeamHistories: many(playerTeamHistory),
	matchEvents_playerId: many(matchEvents, {
		relationName: "matchEvents_playerId_players_id"
	}),
	matchEvents_assistingPlayerId: many(matchEvents, {
		relationName: "matchEvents_assistingPlayerId_players_id"
	}),
}));

export const teamsRelations = relations(teams, ({many}) => ({
	playerTeamHistories: many(playerTeamHistory),
	matches_homeTeamId: many(matches, {
		relationName: "matches_homeTeamId_teams_id"
	}),
	matches_awayTeamId: many(matches, {
		relationName: "matches_awayTeamId_teams_id"
	}),
}));

export const matchesRelations = relations(matches, ({one, many}) => ({
	competition: one(competitions, {
		fields: [matches.competitionId],
		references: [competitions.id]
	}),
	team_homeTeamId: one(teams, {
		fields: [matches.homeTeamId],
		references: [teams.id],
		relationName: "matches_homeTeamId_teams_id"
	}),
	team_awayTeamId: one(teams, {
		fields: [matches.awayTeamId],
		references: [teams.id],
		relationName: "matches_awayTeamId_teams_id"
	}),
	matchEvents: many(matchEvents),
}));

export const leaguesRelations = relations(leagues, ({many}) => ({
	competitions: many(competitions),
}));

export const competitionsRelations = relations(competitions, ({one, many}) => ({
	league: one(leagues, {
		fields: [competitions.leagueId],
		references: [leagues.id],
	}),
	matches: many(matches),
}));

export const matchEventsRelations = relations(matchEvents, ({one}) => ({
	match: one(matches, {
		fields: [matchEvents.matchId],
		references: [matches.id]
	}),
	player_playerId: one(players, {
		fields: [matchEvents.playerId],
		references: [players.id],
		relationName: "matchEvents_playerId_players_id"
	}),
	player_assistingPlayerId: one(players, {
		fields: [matchEvents.assistingPlayerId],
		references: [players.id],
		relationName: "matchEvents_assistingPlayerId_players_id"
	}),
}));