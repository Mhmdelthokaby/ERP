import { config } from "dotenv"
config({ path: ".env.local" })
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!)

async function main() {
  // Execute migration SQL
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "license_grades" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "license_grades_name_unique" UNIQUE("name")
    )
  `)
  console.log("✓ Created license_grades table")

  // Seed default grades if table is empty
  const count = await sql`SELECT COUNT(*) AS cnt FROM "license_grades"`
  if (Number(count[0].cnt) === 0) {
    const grades = ["أولى", "ثانية", "ثالثة", "رابعة"]
    for (const name of grades) {
      await sql`INSERT INTO "license_grades" (name) VALUES (${name}) ON CONFLICT DO NOTHING`
    }
    console.log("✓ Seeded default license grades")
  }

  const rows = await sql`SELECT id, name FROM "license_grades" ORDER BY name`
  console.log("license_grades:", JSON.stringify(rows, null, 2))

  await sql.end()
}

main().catch((e) => {
  console.error("Failed:", e.message)
  process.exit(1)
})
