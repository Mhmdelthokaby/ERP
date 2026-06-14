CREATE TABLE IF NOT EXISTS "suppliers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" integer NOT NULL UNIQUE,
  "name" text NOT NULL,
  "tax_number" text,
  "phone" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE SEQUENCE IF NOT EXISTS "suppliers_code_seq" OWNED BY "suppliers"."code";
ALTER TABLE "suppliers" ALTER COLUMN "code" SET DEFAULT nextval('suppliers_code_seq');
