import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicles, vehicleTypes, drivers, vehicleHistory } from "@/db/schema"
import { eq, or } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db
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
      .orderBy(vehicles.createdAt)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch vehicles" }, { status: 500 })
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
