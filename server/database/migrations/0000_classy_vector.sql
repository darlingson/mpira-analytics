CREATE TABLE "competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"season" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"minute" integer NOT NULL,
	"assisting_player_id" integer,
	CONSTRAINT "check_minute_valid" CHECK ((minute >= 0) AND (minute <= 130))
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"competition_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"home_team_id" integer NOT NULL,
	"away_team_id" integer NOT NULL,
	"score_home" integer,
	"score_away" integer,
	"venue" varchar(255),
	CONSTRAINT "check_teams_different" CHECK (home_team_id <> away_team_id)
);
--> statement-breakpoint
CREATE TABLE "player_team_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	CONSTRAINT "check_dates_valid" CHECK ((end_date IS NULL) OR (end_date >= start_date))
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(100),
	"date_of_birth" date,
	"nationality" varchar(100),
	"photo_url" text,
	"position" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "refresh_tokens_token_hash_key" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(50),
	"logo_url" text,
	"country" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "fk_match_events_match" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "fk_match_events_player" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "fk_match_events_assisting_player" FOREIGN KEY ("assisting_player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "fk_matches_competition" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "fk_matches_home_team" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "fk_matches_away_team" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_team_history" ADD CONSTRAINT "fk_player_team_history_player" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_team_history" ADD CONSTRAINT "fk_player_team_history_team" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_match_events_assisting_player" ON "match_events" USING btree ("assisting_player_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_match_events_match" ON "match_events" USING btree ("match_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_match_events_player" ON "match_events" USING btree ("player_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_matches_away_team" ON "matches" USING btree ("away_team_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_matches_competition_date" ON "matches" USING btree ("competition_id" int4_ops,"date" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_matches_home_team" ON "matches" USING btree ("home_team_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_player_team_history_dates" ON "player_team_history" USING btree ("player_id" date_ops,"start_date" date_ops,"end_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_player_team_history_player" ON "player_team_history" USING btree ("player_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_player_team_history_team" ON "player_team_history" USING btree ("team_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_rt_user" ON "refresh_tokens" USING btree ("user_id" text_ops);