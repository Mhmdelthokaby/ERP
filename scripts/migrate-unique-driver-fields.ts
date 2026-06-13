import { config } from "dotenv"
config({ path: ".env.local" })
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!)

async function main() {
  await sql.unsafe(`
    DO $$ BEGIN
      ALTER TABLE "drivers" ADD CONSTRAINT "drivers_phone_unique" UNIQUE("phone");
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "drivers" ADD CONSTRAINT "drivers_insurance_number_unique" UNIQUE("insurance_number");
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)
  console.log("✓ Added unique constraints on drivers.phone and drivers.insurance_number")
  await sql.end()
}

main().catch((e) => {
  console.error("Failed:", e.message)
  process.exit(1)
})
