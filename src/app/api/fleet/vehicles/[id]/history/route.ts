import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicleHistory } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await db
      .select()
      .from(vehicleHistory)
      .where(eq(vehicleHistory.vehicleId, params.id))
      .orderBy(desc(vehicleHistory.modifiedAt))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch history" }, { status: 500 })
  }
}
