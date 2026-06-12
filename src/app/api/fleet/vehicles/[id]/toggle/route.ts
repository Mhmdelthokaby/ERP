import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicles, vehicleHistory } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [current] = await db.select({ isActive: vehicles.isActive, plateNumber: vehicles.plateNumber, engineNumber: vehicles.engineNumber, licenseDate: vehicles.licenseDate, licenseExpiryDate: vehicles.licenseExpiryDate, licenseType: vehicles.licenseType }).from(vehicles).where(eq(vehicles.id, params.id))
    if (!current) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    const newActive = !current.isActive
    const [data] = await db.update(vehicles).set({ isActive: newActive, updatedAt: new Date() }).where(eq(vehicles.id, params.id)).returning()
    await db.insert(vehicleHistory).values({
      vehicleId: data.id,
      plateNumber: data.plateNumber,
      engineNumber: data.engineNumber,
      licenseDate: data.licenseDate,
      licenseExpiryDate: data.licenseExpiryDate,
      licenseType: data.licenseType,
      isActive: data.isActive,
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to toggle vehicle" }, { status: 500 })
  }
}
