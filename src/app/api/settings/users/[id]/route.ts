import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const [data] = await db.update(users).set({ ...body, updatedAt: new Date() }).where(eq(users.id, params.id)).returning()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
