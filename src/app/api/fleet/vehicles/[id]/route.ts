import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicles, vehicleTypes, drivers, vehicleHistory } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db
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
      .where(eq(vehicles.id, params.id))
    if (!data) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const [data] = await db.update(vehicles).set({ ...body, updatedAt: new Date() }).where(eq(vehicles.id, params.id)).returning()
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
    return NextResponse.json({ data: enriched })
  } catch {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(vehicles).where(eq(vehicles.id, params.id))
    return NextResponse.json({ data: { id: params.id } })
  } catch {
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
  }
}
