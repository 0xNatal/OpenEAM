CREATE TABLE "enterprises" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"goal" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Seed a starter enterprise. Existing rows are backfilled onto it, and a
-- fresh install needs at least one enterprise for the UI to work with.
INSERT INTO "enterprises" ("id", "name", "description") VALUES
	('00000000-0000-4000-8000-00000000e001', 'Default Enterprise', 'Created by the enterprise-scoping migration. Rename or replace it.')
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
ALTER TABLE "architecture_domains" DROP CONSTRAINT "architecture_domains_name_unique";--> statement-breakpoint
ALTER TABLE "architecture_domains" ADD COLUMN "enterprise_id" text;--> statement-breakpoint
ALTER TABLE "building_blocks" ADD COLUMN "enterprise_id" text;--> statement-breakpoint
ALTER TABLE "business_capabilities" ADD COLUMN "enterprise_id" text;--> statement-breakpoint
ALTER TABLE "business_processes" ADD COLUMN "enterprise_id" text;--> statement-breakpoint
ALTER TABLE "organization_units" ADD COLUMN "enterprise_id" text;--> statement-breakpoint
ALTER TABLE "value_streams" ADD COLUMN "enterprise_id" text;--> statement-breakpoint
UPDATE "architecture_domains" SET "enterprise_id" = '00000000-0000-4000-8000-00000000e001' WHERE "enterprise_id" IS NULL;--> statement-breakpoint
UPDATE "building_blocks" SET "enterprise_id" = '00000000-0000-4000-8000-00000000e001' WHERE "enterprise_id" IS NULL;--> statement-breakpoint
UPDATE "business_capabilities" SET "enterprise_id" = '00000000-0000-4000-8000-00000000e001' WHERE "enterprise_id" IS NULL;--> statement-breakpoint
UPDATE "business_processes" SET "enterprise_id" = '00000000-0000-4000-8000-00000000e001' WHERE "enterprise_id" IS NULL;--> statement-breakpoint
UPDATE "organization_units" SET "enterprise_id" = '00000000-0000-4000-8000-00000000e001' WHERE "enterprise_id" IS NULL;--> statement-breakpoint
UPDATE "value_streams" SET "enterprise_id" = '00000000-0000-4000-8000-00000000e001' WHERE "enterprise_id" IS NULL;--> statement-breakpoint
ALTER TABLE "architecture_domains" ALTER COLUMN "enterprise_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "building_blocks" ALTER COLUMN "enterprise_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "business_capabilities" ALTER COLUMN "enterprise_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "business_processes" ALTER COLUMN "enterprise_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_units" ALTER COLUMN "enterprise_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "value_streams" ALTER COLUMN "enterprise_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "architecture_domains" ADD CONSTRAINT "architecture_domains_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_blocks" ADD CONSTRAINT "building_blocks_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_capabilities" ADD CONSTRAINT "business_capabilities_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_processes" ADD CONSTRAINT "business_processes_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "value_streams" ADD CONSTRAINT "value_streams_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "architecture_domains_enterprise_id_idx" ON "architecture_domains" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "building_blocks_enterprise_id_idx" ON "building_blocks" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "business_capabilities_enterprise_id_idx" ON "business_capabilities" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "business_processes_enterprise_id_idx" ON "business_processes" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "organization_units_enterprise_id_idx" ON "organization_units" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "value_streams_enterprise_id_idx" ON "value_streams" USING btree ("enterprise_id");--> statement-breakpoint
ALTER TABLE "architecture_domains" ADD CONSTRAINT "architecture_domains_enterprise_id_name_unique" UNIQUE("enterprise_id","name");
