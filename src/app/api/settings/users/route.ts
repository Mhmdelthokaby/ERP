import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(users).orderBy(asc(users.name))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const [data] = await db.insert(users).values(body).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
