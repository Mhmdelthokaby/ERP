import { NextResponse } from "next/server"
import { db } from "@/db"
import { auditLogs } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
