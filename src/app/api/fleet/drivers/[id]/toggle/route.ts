import { NextResponse } from "next/server"
import { db } from "@/db"
import { drivers } from "@/db/schema"
import { eq, or } from "drizzle-orm"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const codeParam = searchParams.get("code")
    const code = codeParam ? Number(codeParam) : undefined
    const whereClause = code ? or(eq(drivers.id, params.id), eq(drivers.code, code)) : eq(drivers.id, params.id)
    const [current] = await db.select({ isActive: drivers.isActive, id: drivers.id }).from(drivers).where(whereClause).limit(1)
    if (!current) return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    const [data] = await db.update(drivers).set({ isActive: !current.isActive, updatedAt: new Date() }).where(eq(drivers.id, current.id)).returning()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to toggle driver" }, { status: 500 })
  }
}
