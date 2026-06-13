import { NextResponse } from "next/server"
import { db } from "@/db"
import { licenseGrades } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const [data] = await db.update(licenseGrades).set(body).where(eq(licenseGrades.id, id)).returning()
    if (!data) return NextResponse.json({ error: "License grade not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to update license grade" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [data] = await db.delete(licenseGrades).where(eq(licenseGrades.id, id)).returning()
    if (!data) return NextResponse.json({ error: "License grade not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to delete license grade" }, { status: 500 })
  }
}
