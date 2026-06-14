CREATE TABLE IF NOT EXISTS "maintenance" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" integer NOT NULL UNIQUE,
  "vehicle_id" uuid REFERENCES vehicles(id),
  "plate_number" text NOT NULL,
  "maintenance_date" date NOT NULL,
  "supplier_id" uuid REFERENCES suppliers(id),
  "supplier_name" text NOT NULL,
  "supplier_code" integer,
  "invoice_number" text,
  "maintenance_type_id" uuid REFERENCES maintenance_types(id),
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE SEQUENCE IF NOT EXISTS "maintenance_code_seq" OWNED BY "maintenance"."code";
ALTER TABLE "maintenance" ALTER COLUMN "code" SET DEFAULT nextval('maintenance_code_seq');
