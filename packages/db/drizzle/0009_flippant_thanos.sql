CREATE TYPE "public"."actor_involvement" AS ENUM('accountable', 'performs', 'consulted');--> statement-breakpoint
CREATE TYPE "public"."actor_kind" AS ENUM('role', 'team', 'individual', 'external');--> statement-breakpoint
CREATE TABLE "actors" (
	"id" text PRIMARY KEY NOT NULL,
	"enterprise_id" text NOT NULL,
	"kind" "actor_kind" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_unit_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capability_actors" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"involvement" "actor_involvement" DEFAULT 'performs' NOT NULL,
	"valid_from" date,
	"valid_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_organization_unit_id_organization_units_id_fk" FOREIGN KEY ("organization_unit_id") REFERENCES "public"."organization_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_actors" ADD CONSTRAINT "capability_actors_capability_id_business_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."business_capabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_actors" ADD CONSTRAINT "capability_actors_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "actors_enterprise_id_idx" ON "actors" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "actors_organization_unit_id_idx" ON "actors" USING btree ("organization_unit_id");--> statement-breakpoint
CREATE INDEX "capability_actors_capability_id_idx" ON "capability_actors" USING btree ("capability_id");--> statement-breakpoint
CREATE INDEX "capability_actors_actor_id_idx" ON "capability_actors" USING btree ("actor_id");