ALTER TABLE "drivers" DROP CONSTRAINT IF EXISTS "drivers_code_unique"
ALTER TABLE "drivers" ALTER COLUMN "code" DROP NOT NULL
ALTER TABLE "drivers" RENAME COLUMN "code" TO "code_old"
ALTER TABLE "drivers" ADD COLUMN "code" integer
UPDATE "drivers" SET "code" = seq.seq_num FROM (SELECT id, row_number() OVER (ORDER BY created_at) AS seq_num FROM "drivers") seq WHERE "drivers".id = seq.id
CREATE SEQUENCE IF NOT EXISTS "drivers_code_seq" OWNED BY "drivers"."code"
ALTER TABLE "drivers" ALTER COLUMN "code" SET DEFAULT nextval('drivers_code_seq')
ALTER TABLE "drivers" ALTER COLUMN "code" SET NOT NULL
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_code_unique" UNIQUE("code")
SELECT setval('drivers_code_seq', COALESCE((SELECT MAX(code) FROM "drivers"), 0))
ALTER TABLE "drivers" DROP COLUMN "code_old"