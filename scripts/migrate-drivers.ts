import { config } from "dotenv"
config({ path: ".env.local" })
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!)

async function main() {
  // 1. Drop old constraints & defaults
  await sql.unsafe(`ALTER TABLE "drivers" DROP CONSTRAINT IF EXISTS "drivers_code_unique"`)
  await sql.unsafe(`ALTER TABLE "drivers" ALTER COLUMN "code" DROP DEFAULT`)
  await sql.unsafe(`ALTER TABLE "drivers" ALTER COLUMN "code" DROP NOT NULL`)
  console.log("✓ Dropped old constraints")

  // 2. Rename old text column, add new integer column
  await sql.unsafe(`ALTER TABLE "drivers" RENAME COLUMN "code" TO "code_old"`)
  await sql.unsafe(`ALTER TABLE "drivers" ADD COLUMN "code" integer`)
  console.log("✓ Renamed old column, added new integer column")

  // 3. Assign sequential numbers to existing rows
  await sql.unsafe(`
    UPDATE "drivers" SET "code" = seq.seq_num
    FROM (SELECT id, row_number() OVER (ORDER BY created_at) AS seq_num FROM "drivers") seq
    WHERE "drivers".id = seq.id
  `)
  console.log("✓ Assigned sequential numbers to existing rows")

  // 4. Create sequence and wire it
  await sql.unsafe(`DROP SEQUENCE IF EXISTS "drivers_code_seq"`)
  await sql.unsafe(`CREATE SEQUENCE "drivers_code_seq" OWNED BY "drivers"."code"`)
  await sql.unsafe(`ALTER TABLE "drivers" ALTER COLUMN "code" SET DEFAULT nextval('drivers_code_seq')`)
  await sql.unsafe(`ALTER TABLE "drivers" ALTER COLUMN "code" SET NOT NULL`)
  await sql.unsafe(`ALTER TABLE "drivers" ADD CONSTRAINT "drivers_code_unique" UNIQUE("code")`)
  console.log("✓ Created sequence, set NOT NULL + UNIQUE")

  // 5. Sync sequence to start after max existing code
  await sql.unsafe(`SELECT setval('drivers_code_seq', COALESCE((SELECT MAX(code) FROM "drivers"), 0))`)
  console.log("✓ Synced sequence")

  // 6. Drop old text column
  await sql.unsafe(`ALTER TABLE "drivers" DROP COLUMN "code_old"`)
  console.log("✓ Dropped old column")

  // 7. Verify
  const colInfo = await sql`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'drivers' AND column_name = 'code'
  `
  console.log("\ncode column:", JSON.stringify(colInfo, null, 2))

  const drivers = await sql`SELECT id, code, full_name FROM "drivers" ORDER BY code`
  console.log("drivers:", JSON.stringify(drivers, null, 2))

  await sql.end()
}

main().catch((e) => {
  console.error("Failed:", e.message)
  process.exit(1)
})
