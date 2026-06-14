import { NextResponse } from "next/server"
import { db } from "@/db"
import { maintenance, maintenanceTypes } from "@/db/schema"
import { eq } from "drizzle-orm"

const MAINTENANCE_FIELDS = {
  id: maintenance.id,
  code: maintenance.code,
  vehicleId: maintenance.vehicleId,
  vehicleCode: maintenance.vehicleCode,
  plateNumber: maintenance.plateNumber,
  maintenanceDate: maintenance.maintenanceDate,
  supplierId: maintenance.supplierId,
  supplierName: maintenance.supplierName,
  supplierCode: maintenance.supplierCode,
  invoiceNumber: maintenance.invoiceNumber,
  maintenanceTypeId: maintenance.maintenanceTypeId,
  maintenanceTypeName: maintenanceTypes.name,
  notes: maintenance.notes,
  createdAt: maintenance.createdAt,
  updatedAt: maintenance.updatedAt,
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.select(MAINTENANCE_FIELDS).from(maintenance)
      .leftJoin(maintenanceTypes, eq(maintenance.maintenanceTypeId, maintenanceTypes.id))
      .where(eq(maintenance.id, params.id))
    if (!data) return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch maintenance record" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const [data] = await db.update(maintenance).set({ ...body, updatedAt: new Date() }).where(eq(maintenance.id, params.id)).returning()
    if (!data) return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 })
    const [enriched] = await db.select(MAINTENANCE_FIELDS).from(maintenance)
      .leftJoin(maintenanceTypes, eq(maintenance.maintenanceTypeId, maintenanceTypes.id))
      .where(eq(maintenance.id, data.id))
    return NextResponse.json({ data: enriched })
  } catch {
    return NextResponse.json({ error: "Failed to update maintenance record" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.delete(maintenance).where(eq(maintenance.id, params.id)).returning({ id: maintenance.id })
    if (!data) return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to delete maintenance record" }, { status: 500 })
  }
}
