CREATE TABLE "leagues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"tier" integer NOT NULL,
	"country" varchar(100)
);
--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "league_id" integer;--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "fk_competitions_league" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;