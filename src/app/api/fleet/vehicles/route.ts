import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicles, vehicleTypes, drivers, vehicleHistory } from "@/db/schema"
import { eq } from "drizzle-orm"

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const [data] = await db.insert(vehicles).values(body).returning()
    await db.insert(vehicleHistory).values({
      vehicleId: data.id,
      plateNumber: data.plateNumber,
      engineNumber: data.engineNumber,
      licenseDate: data.licenseDate,
      licenseExpiryDate: data.licenseExpiryDate,
      licenseType: data.licenseType,
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
