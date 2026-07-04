CREATE TYPE "public"."architecture_level" AS ENUM('strategic', 'segment', 'capability');--> statement-breakpoint
CREATE TYPE "public"."building_block_kind" AS ENUM('architecture', 'solution');--> statement-breakpoint
CREATE TYPE "public"."lifecycle_phase" AS ENUM('planned', 'active', 'phasing_out', 'retired');--> statement-breakpoint
CREATE TABLE "architecture_domains" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "architecture_domains_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "building_block_architecture_domains" (
	"building_block_id" text NOT NULL,
	"architecture_domain_id" text NOT NULL,
	CONSTRAINT "building_block_architecture_domains_building_block_id_architecture_domain_id_pk" PRIMARY KEY("building_block_id","architecture_domain_id")
);
--> statement-breakpoint
CREATE TABLE "building_block_capabilities" (
	"id" text PRIMARY KEY NOT NULL,
	"building_block_id" text NOT NULL,
	"capability_id" text NOT NULL,
	"valid_from" date,
	"valid_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building_block_organization_units" (
	"id" text PRIMARY KEY NOT NULL,
	"building_block_id" text NOT NULL,
	"organization_unit_id" text NOT NULL,
	"valid_from" date,
	"valid_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building_block_realizations" (
	"id" text PRIMARY KEY NOT NULL,
	"architecture_building_block_id" text NOT NULL,
	"solution_building_block_id" text NOT NULL,
	"valid_from" date,
	"valid_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" "building_block_kind" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"architecture_level" "architecture_level",
	"lifecycle_phase" "lifecycle_phase" DEFAULT 'planned' NOT NULL,
	"valid_from" date,
	"valid_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_units" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business_capabilities" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "business_capabilities" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "business_processes" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "business_processes" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "process_steps" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "process_steps" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "value_stream_stages" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "value_stream_stages" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "value_streams" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "value_streams" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "building_block_architecture_domains" ADD CONSTRAINT "building_block_architecture_domains_building_block_id_building_blocks_id_fk" FOREIGN KEY ("building_block_id") REFERENCES "public"."building_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_block_architecture_domains" ADD CONSTRAINT "building_block_architecture_domains_architecture_domain_id_architecture_domains_id_fk" FOREIGN KEY ("architecture_domain_id") REFERENCES "public"."architecture_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_block_capabilities" ADD CONSTRAINT "building_block_capabilities_building_block_id_building_blocks_id_fk" FOREIGN KEY ("building_block_id") REFERENCES "public"."building_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_block_capabilities" ADD CONSTRAINT "building_block_capabilities_capability_id_business_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."business_capabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_block_organization_units" ADD CONSTRAINT "building_block_organization_units_building_block_id_building_blocks_id_fk" FOREIGN KEY ("building_block_id") REFERENCES "public"."building_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_block_organization_units" ADD CONSTRAINT "building_block_organization_units_organization_unit_id_organization_units_id_fk" FOREIGN KEY ("organization_unit_id") REFERENCES "public"."organization_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_block_realizations" ADD CONSTRAINT "building_block_realizations_architecture_building_block_id_building_blocks_id_fk" FOREIGN KEY ("architecture_building_block_id") REFERENCES "public"."building_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_block_realizations" ADD CONSTRAINT "building_block_realizations_solution_building_block_id_building_blocks_id_fk" FOREIGN KEY ("solution_building_block_id") REFERENCES "public"."building_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_parent_id_organization_units_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."organization_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "building_block_architecture_domains_domain_id_idx" ON "building_block_architecture_domains" USING btree ("architecture_domain_id");--> statement-breakpoint
CREATE INDEX "building_block_capabilities_building_block_id_idx" ON "building_block_capabilities" USING btree ("building_block_id");--> statement-breakpoint
CREATE INDEX "building_block_capabilities_capability_id_idx" ON "building_block_capabilities" USING btree ("capability_id");--> statement-breakpoint
CREATE INDEX "building_block_organization_units_building_block_id_idx" ON "building_block_organization_units" USING btree ("building_block_id");--> statement-breakpoint
CREATE INDEX "building_block_organization_units_organization_unit_id_idx" ON "building_block_organization_units" USING btree ("organization_unit_id");--> statement-breakpoint
CREATE INDEX "building_block_realizations_architecture_id_idx" ON "building_block_realizations" USING btree ("architecture_building_block_id");--> statement-breakpoint
CREATE INDEX "building_block_realizations_solution_id_idx" ON "building_block_realizations" USING btree ("solution_building_block_id");--> statement-breakpoint
CREATE INDEX "organization_units_parent_id_idx" ON "organization_units" USING btree ("parent_id");--> statement-breakpoint
INSERT INTO "architecture_domains" ("id", "name", "description", "is_default") VALUES
	('00000000-0000-4000-8000-000000000001', 'Business Architecture', 'Business strategy, governance, organization, and key business processes.', true),
	('00000000-0000-4000-8000-000000000002', 'Data Architecture', 'Structure of logical and physical data assets and data management resources.', true),
	('00000000-0000-4000-8000-000000000003', 'Application Architecture', 'Individual applications, their interactions, and their relationships to business processes.', true),
	('00000000-0000-4000-8000-000000000004', 'Technology Architecture', 'Software and hardware capabilities required to support business, data, and application services.', true)
ON CONFLICT ("id") DO NOTHING;
