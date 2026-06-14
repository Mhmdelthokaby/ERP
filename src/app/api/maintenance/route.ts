import { NextResponse } from "next/server"
import { db } from "@/db"
import { maintenance, maintenanceTypes } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

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

export async function GET() {
  try {
    const data = await db.select(MAINTENANCE_FIELDS).from(maintenance)
      .leftJoin(maintenanceTypes, eq(maintenance.maintenanceTypeId, maintenanceTypes.id))
      .orderBy(desc(maintenance.createdAt))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch maintenance records" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.plateNumber || !body.maintenanceDate || !body.supplierName) {
      return NextResponse.json({ error: "plateNumber, maintenanceDate, and supplierName are required" }, { status: 400 })
    }
    const [data] = await db.insert(maintenance).values({
      vehicleId: body.vehicleId || null,
      vehicleCode: body.vehicleCode || null,
      plateNumber: body.plateNumber,
      maintenanceDate: body.maintenanceDate,
      supplierId: body.supplierId || null,
      supplierName: body.supplierName,
      supplierCode: body.supplierCode || null,
      invoiceNumber: body.invoiceNumber || null,
      maintenanceTypeId: body.maintenanceTypeId || null,
      notes: body.notes || null,
    }).returning()
    const [enriched] = await db.select(MAINTENANCE_FIELDS).from(maintenance)
      .leftJoin(maintenanceTypes, eq(maintenance.maintenanceTypeId, maintenanceTypes.id))
      .where(eq(maintenance.id, data.id))
    return NextResponse.json({ data: enriched }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create maintenance record" }, { status: 500 })
  }
}
