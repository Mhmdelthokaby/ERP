import { NextResponse } from "next/server"
import { db } from "@/db"
import { drivers } from "@/db/schema"
import { ilike, or, and, gte, lte, eq, ne, asc, desc, sql, count } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hasFilters = searchParams.toString().length > 0

    // if no params, return all (backward compat for dropdowns)
    if (!hasFilters) {
      const data = await db.select().from(drivers).orderBy(drivers.createdAt)
      return NextResponse.json({ data })
    }

    const search = searchParams.get("search")
    const licenseGrade = searchParams.get("licenseGrade")
    const isActive = searchParams.get("isActive")
    const salaryMin = searchParams.get("salaryMin")
    const salaryMax = searchParams.get("salaryMax")
    const hireDateFrom = searchParams.get("hireDateFrom")
    const hireDateTo = searchParams.get("hireDateTo")
    const sortBy = searchParams.get("sortBy")
    const sortDir = searchParams.get("sortDir")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    const conditions: any[] = []
    if (search) {
      conditions.push(or(
        ilike(drivers.fullName, `%${search}%`),
        ilike(drivers.phone, `%${search}%`),
        ilike(drivers.insuranceNumber, `%${search}%`),
        sql`CAST(${drivers.code} AS TEXT) ILIKE ${`%${search}%`}`,
      ))
    }
    if (licenseGrade) conditions.push(eq(drivers.licenseGrade, licenseGrade))
    if (isActive === "true") conditions.push(eq(drivers.isActive, true))
    if (isActive === "false") conditions.push(eq(drivers.isActive, false))
    if (salaryMin) conditions.push(gte(drivers.salary, salaryMin))
    if (salaryMax) conditions.push(lte(drivers.salary, salaryMax))
    if (hireDateFrom) conditions.push(gte(drivers.hireDate, hireDateFrom))
    if (hireDateTo) conditions.push(lte(drivers.hireDate, hireDateTo))

    const where = conditions.length ? and(...conditions) : undefined

    const [{ total }] = await db.select({ total: count() }).from(drivers).where(where)

    let orderBy: any = drivers.createdAt
    if (sortBy === "name") orderBy = sortDir === "desc" ? desc(drivers.fullName) : asc(drivers.fullName)
    else if (sortBy === "salary") orderBy = sortDir === "desc" ? desc(drivers.salary) : asc(drivers.salary)

    const data = await db.select().from(drivers).where(where).orderBy(orderBy).limit(pageSize).offset((page - 1) * pageSize)
    return NextResponse.json({ data, total })
  } catch (e) {
    return NextResponse.json({ data: [], total: 0, error: "Failed to fetch drivers" }, { status: 500 })
  }
}

async function checkUnique(body: any, excludeId?: string) {
  const errors: string[] = []
  const conditions: any[] = []

  if (body.phone) {
    const c = eq(drivers.phone, body.phone as string)
    conditions.push(excludeId ? and(c, ne(drivers.id, excludeId)) : c)
  }
  if (body.nationalId) {
    const c = eq(drivers.nationalId, body.nationalId as string)
    conditions.push(excludeId ? and(c, ne(drivers.id, excludeId)) : c)
  }
  if (body.insuranceNumber) {
    const c = eq(drivers.insuranceNumber, body.insuranceNumber as string)
    conditions.push(excludeId ? and(c, ne(drivers.id, excludeId)) : c)
  }

  if (conditions.length === 0) return errors

  const existing = await db.select({ phone: drivers.phone, nationalId: drivers.nationalId, insuranceNumber: drivers.insuranceNumber }).from(drivers).where(or(...conditions))
  for (const row of existing) {
    if (row.phone === body.phone) errors.push("phone")
    if (body.nationalId && row.nationalId === body.nationalId) errors.push("nationalId")
    if (body.insuranceNumber && row.insuranceNumber === body.insuranceNumber) errors.push("insuranceNumber")
  }
  return errors
}

function cleanBody(body: any) {
  for (const k of ["nationalId", "insuranceNumber", "salary", "hireDate"]) {
    if (body[k] === "") body[k] = undefined
  }
  return body
}

export async function POST(request: Request) {
  try {
    const body = cleanBody(await request.json())
    const conflicts = await checkUnique(body)
    if (conflicts.length) {
      return NextResponse.json({ error: "duplicate", fields: conflicts }, { status: 409 })
    }
    const [data] = await db.insert(drivers).values(body).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create driver" }, { status: 500 })
  }
}
