CREATE TYPE "public"."building_block_relationship_type" AS ENUM('depends_on', 'data_flow');--> statement-breakpoint
CREATE TABLE "building_block_relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"source_building_block_id" text NOT NULL,
	"target_building_block_id" text NOT NULL,
	"type" "building_block_relationship_type" DEFAULT 'depends_on' NOT NULL,
	"description" text,
	"valid_from" date,
	"valid_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "building_block_relationships" ADD CONSTRAINT "building_block_relationships_source_building_block_id_building_blocks_id_fk" FOREIGN KEY ("source_building_block_id") REFERENCES "public"."building_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_block_relationships" ADD CONSTRAINT "building_block_relationships_target_building_block_id_building_blocks_id_fk" FOREIGN KEY ("target_building_block_id") REFERENCES "public"."building_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "building_block_relationships_source_id_idx" ON "building_block_relationships" USING btree ("source_building_block_id");--> statement-breakpoint
CREATE INDEX "building_block_relationships_target_id_idx" ON "building_block_relationships" USING btree ("target_building_block_id");