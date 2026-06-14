CREATE TABLE IF NOT EXISTS "maintenance_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" integer NOT NULL UNIQUE,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE SEQUENCE IF NOT EXISTS "maintenance_types_code_seq" OWNED BY "maintenance_types"."code";
ALTER TABLE "maintenance_types" ALTER COLUMN "code" SET DEFAULT nextval('maintenance_types_code_seq');
