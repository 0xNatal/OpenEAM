CREATE TABLE "business_capabilities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "business_processes" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger_event" text,
	"outcome" text
);
--> statement-breakpoint
CREATE TABLE "process_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"process_id" text NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stage_capabilities" (
	"stage_id" text NOT NULL,
	"capability_id" text NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "stage_capabilities_stage_id_capability_id_pk" PRIMARY KEY("stage_id","capability_id")
);
--> statement-breakpoint
CREATE TABLE "value_stream_stages" (
	"id" text PRIMARY KEY NOT NULL,
	"value_stream_id" text NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "value_streams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "business_processes" ADD CONSTRAINT "business_processes_capability_id_business_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."business_capabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_steps" ADD CONSTRAINT "process_steps_process_id_business_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."business_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_capabilities" ADD CONSTRAINT "stage_capabilities_stage_id_value_stream_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."value_stream_stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_capabilities" ADD CONSTRAINT "stage_capabilities_capability_id_business_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."business_capabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "value_stream_stages" ADD CONSTRAINT "value_stream_stages_value_stream_id_value_streams_id_fk" FOREIGN KEY ("value_stream_id") REFERENCES "public"."value_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "business_processes_capability_id_idx" ON "business_processes" USING btree ("capability_id");--> statement-breakpoint
CREATE INDEX "process_steps_process_id_idx" ON "process_steps" USING btree ("process_id");--> statement-breakpoint
CREATE INDEX "stage_capabilities_capability_id_idx" ON "stage_capabilities" USING btree ("capability_id");--> statement-breakpoint
CREATE INDEX "value_stream_stages_value_stream_id_idx" ON "value_stream_stages" USING btree ("value_stream_id");