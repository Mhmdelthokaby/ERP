import { NextResponse } from "next/server"
import { db } from "@/db"
import { outboxMessages } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(outboxMessages).orderBy(desc(outboxMessages.createdAt))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch outbox messages" }, { status: 500 })
  }
}
