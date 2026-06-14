import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicles, vehicleTypes, drivers, vehicleHistory } from "@/db/schema"
import { eq, or, and, ilike, lte, count, sql } from "drizzle-orm"

const VEHICLE_FIELDS = {
  id: vehicles.id,
  code: vehicles.code,
  plateNumber: vehicles.plateNumber,
  brand: vehicles.brand,
  model: vehicles.model,
  year: vehicles.year,
  capacity: vehicles.capacity,
  chassisNumber: vehicles.chassisNumber,
  engineNumber: vehicles.engineNumber,
  licenseDate: vehicles.licenseDate,
  licenseExpiryDate: vehicles.licenseExpiryDate,
  ownerName: vehicles.ownerName,
  licenseType: vehicles.licenseType,
  purchaseDate: vehicles.purchaseDate,
  hasGps: vehicles.hasGps,
  fuelConsumption: vehicles.fuelConsumption,
  vehicleTypeId: vehicles.vehicleTypeId,
  vehicleTypeName: vehicleTypes.name,
  driverId: vehicles.driverId,
  driverName: drivers.fullName,
  isActive: vehicles.isActive,
  createdAt: vehicles.createdAt,
  updatedAt: vehicles.updatedAt,
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hasFilters = searchParams.toString().length > 0

    if (!hasFilters) {
      const data = await db.select(VEHICLE_FIELDS).from(vehicles)
        .leftJoin(vehicleTypes, eq(vehicles.vehicleTypeId, vehicleTypes.id))
        .leftJoin(drivers, eq(vehicles.driverId, drivers.id))
        .orderBy(vehicles.createdAt)
      return NextResponse.json({ data })
    }

    const search = searchParams.get("search")
    const model = searchParams.get("model")
    const year = searchParams.get("year")
    const licenseExpiry = searchParams.get("licenseExpiry")
    const isActive = searchParams.get("isActive")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    const conditions: any[] = []
    if (search) {
      conditions.push(or(
        sql`CAST(${vehicles.code} AS TEXT) ILIKE ${`%${search}%`}`,
        ilike(vehicles.plateNumber, `%${search}%`),
        ilike(vehicles.chassisNumber, `%${search}%`),
        ilike(vehicles.engineNumber, `%${search}%`),
      ))
    }
    if (model) conditions.push(eq(vehicles.model, model))
    if (year) conditions.push(eq(vehicles.year, Number(year)))
    if (licenseExpiry) conditions.push(lte(vehicles.licenseExpiryDate, licenseExpiry))
    if (isActive === "true") conditions.push(eq(vehicles.isActive, true))
    if (isActive === "false") conditions.push(eq(vehicles.isActive, false))

    const where = conditions.length ? and(...conditions) : undefined

    const [{ total }] = await db.select({ total: count() }).from(vehicles)
      .leftJoin(vehicleTypes, eq(vehicles.vehicleTypeId, vehicleTypes.id))
      .leftJoin(drivers, eq(vehicles.driverId, drivers.id))
      .where(where)

    const data = await db.select(VEHICLE_FIELDS).from(vehicles)
      .leftJoin(vehicleTypes, eq(vehicles.vehicleTypeId, vehicleTypes.id))
      .leftJoin(drivers, eq(vehicles.driverId, drivers.id))
      .where(where)
      .orderBy(vehicles.createdAt)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
    return NextResponse.json({ data, total })
  } catch {
    return NextResponse.json({ data: [], total: 0, error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

async function checkUnique(body: Record<string, unknown>, excludeId?: string) {
  const errors: string[] = []
  const conditions: any[] = []
  if (body.plateNumber) conditions.push(eq(vehicles.plateNumber, body.plateNumber as string))
  if (body.chassisNumber) conditions.push(eq(vehicles.chassisNumber, body.chassisNumber as string))
  if (body.engineNumber) conditions.push(eq(vehicles.engineNumber, body.engineNumber as string))
  if (body.code) conditions.push(eq(vehicles.code, Number(body.code)))
  if (conditions.length === 0) return errors
  const existing = await db.select({
    plateNumber: vehicles.plateNumber, chassisNumber: vehicles.chassisNumber,
    engineNumber: vehicles.engineNumber, code: vehicles.code, id: vehicles.id,
  }).from(vehicles).where(or(...conditions))
  for (const row of existing) {
    if (excludeId && row.id === excludeId) continue
    if (row.plateNumber === body.plateNumber) errors.push("plateNumber")
    if (body.chassisNumber && row.chassisNumber === body.chassisNumber) errors.push("chassisNumber")
    if (body.engineNumber && row.engineNumber === body.engineNumber) errors.push("engineNumber")
    if (body.code && row.code === Number(body.code)) errors.push("code")
  }
  return errors
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const conflicts = await checkUnique(body)
    if (conflicts.length) {
      return NextResponse.json({ error: "duplicate", fields: conflicts }, { status: 409 })
    }
    const [data] = await db.insert(vehicles).values(body).returning()
    await db.insert(vehicleHistory).values({
      vehicleId: data.id,
      plateNumber: data.plateNumber,
      engineNumber: data.engineNumber,
      licenseDate: data.licenseDate,
      licenseExpiryDate: data.licenseExpiryDate,
      licenseType: data.licenseType,
      ownerName: data.ownerName,
      isActive: data.isActive,
    })
    const [enriched] = await db
      .select({
        id: vehicles.id,
        code: vehicles.code,
        plateNumber: vehicles.plateNumber,
        brand: vehicles.brand,
        model: vehicles.model,
        year: vehicles.year,
        capacity: vehicles.capacity,
        chassisNumber: vehicles.chassisNumber,
        engineNumber: vehicles.engineNumber,
        licenseDate: vehicles.licenseDate,
        licenseExpiryDate: vehicles.licenseExpiryDate,
        ownerName: vehicles.ownerName,
        licenseType: vehicles.licenseType,
        purchaseDate: vehicles.purchaseDate,
        hasGps: vehicles.hasGps,
        fuelConsumption: vehicles.fuelConsumption,
        vehicleTypeId: vehicles.vehicleTypeId,
        vehicleTypeName: vehicleTypes.name,
        driverId: vehicles.driverId,
        driverName: drivers.fullName,
        isActive: vehicles.isActive,
        createdAt: vehicles.createdAt,
        updatedAt: vehicles.updatedAt,
      })
      .from(vehicles)
      .leftJoin(vehicleTypes, eq(vehicles.vehicleTypeId, vehicleTypes.id))
      .leftJoin(drivers, eq(vehicles.driverId, drivers.id))
      .where(eq(vehicles.id, data.id))
    return NextResponse.json({ data: enriched }, { status: 201 })
  } catch (e) {
    console.error("Create vehicle failed:", e)
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}
