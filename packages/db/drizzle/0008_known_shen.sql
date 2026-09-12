CREATE TYPE "public"."information_usage" AS ENUM('owns', 'creates', 'uses');--> statement-breakpoint
CREATE TABLE "capability_information" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_id" text NOT NULL,
	"information_object_id" text NOT NULL,
	"usage" "information_usage" DEFAULT 'uses' NOT NULL,
	"valid_from" date,
	"valid_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "information_objects" (
	"id" text PRIMARY KEY NOT NULL,
	"enterprise_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "capability_information" ADD CONSTRAINT "capability_information_capability_id_business_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."business_capabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_information" ADD CONSTRAINT "capability_information_information_object_id_information_objects_id_fk" FOREIGN KEY ("information_object_id") REFERENCES "public"."information_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "information_objects" ADD CONSTRAINT "information_objects_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "capability_information_capability_id_idx" ON "capability_information" USING btree ("capability_id");--> statement-breakpoint
CREATE INDEX "capability_information_information_object_id_idx" ON "capability_information" USING btree ("information_object_id");--> statement-breakpoint
CREATE INDEX "information_objects_enterprise_id_idx" ON "information_objects" USING btree ("enterprise_id");