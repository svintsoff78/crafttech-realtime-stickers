CREATE TABLE "stickers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"x" integer DEFAULT 0 NOT NULL,
	"y" integer DEFAULT 0 NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"color" integer DEFAULT 0 NOT NULL,
	"z_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "stickers_board_id_idx" ON "stickers" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "stickers_author_id_idx" ON "stickers" USING btree ("author_id");