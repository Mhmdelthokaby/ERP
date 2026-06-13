import { NextResponse } from "next/server"
import { db } from "@/db"
import { drivers } from "@/db/schema"
import { eq, or, and, ne } from "drizzle-orm"

async function checkUnique(body: any, excludeId: string) {
  const errors: string[] = []
  const conditions: any[] = []
  if (body.phone) conditions.push(and(eq(drivers.phone, body.phone as string), ne(drivers.id, excludeId)))
  if (body.nationalId) conditions.push(and(eq(drivers.nationalId, body.nationalId as string), ne(drivers.id, excludeId)))
  if (body.insuranceNumber) conditions.push(and(eq(drivers.insuranceNumber, body.insuranceNumber as string), ne(drivers.id, excludeId)))
  if (conditions.length === 0) return errors
  const existing = await db.select({ phone: drivers.phone, nationalId: drivers.nationalId, insuranceNumber: drivers.insuranceNumber }).from(drivers).where(or(...conditions))
  for (const row of existing) {
    if (row.phone === body.phone) errors.push("phone")
    if (body.nationalId && row.nationalId === body.nationalId) errors.push("nationalId")
    if (body.insuranceNumber && row.insuranceNumber === body.insuranceNumber) errors.push("insuranceNumber")
  }
  return errors
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.select().from(drivers).where(eq(drivers.id, params.id))
    if (!data) return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch driver" }, { status: 500 })
  }
}

function cleanBody(body: any) {
  for (const k of ["nationalId", "insuranceNumber", "salary", "hireDate"]) {
    if (body[k] === "") body[k] = undefined
  }
  return body
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = cleanBody(await request.json())
    const conflicts = await checkUnique(body, params.id)
    if (conflicts.length) {
      return NextResponse.json({ error: "duplicate", fields: conflicts }, { status: 409 })
    }
    const [data] = await db.update(drivers).set({ ...body, updatedAt: new Date() }).where(eq(drivers.id, params.id)).returning()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(drivers).where(eq(drivers.id, params.id))
    return NextResponse.json({ data: { id: params.id } })
  } catch {
    return NextResponse.json({ error: "Failed to delete driver" }, { status: 500 })
  }
}
