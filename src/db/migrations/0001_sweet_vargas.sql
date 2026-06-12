ALTER TABLE "vehicle_history" ADD COLUMN "is_active" boolean;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "driver_id" uuid;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;