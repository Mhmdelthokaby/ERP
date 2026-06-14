import { NextResponse } from "next/server"
import { db } from "@/db"
import { maintenance, maintenanceTypes, vehicles, suppliers } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUUID(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v)
}

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

    let vehicleId = isUUID(body.vehicleId) ? body.vehicleId : null
    if (!vehicleId && body.plateNumber) {
      const [v] = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.plateNumber, body.plateNumber)).limit(1)
      vehicleId = v?.id ?? null
    }

    let supplierId = isUUID(body.supplierId) ? body.supplierId : null
    if (!supplierId && body.supplierName) {
      const [s] = await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.name, body.supplierName)).limit(1)
      supplierId = s?.id ?? null
    }

    const maintenanceTypeId = isUUID(body.maintenanceTypeId) ? body.maintenanceTypeId : null

    const [data] = await db.insert(maintenance).values({
      vehicleId,
      vehicleCode: body.vehicleCode != null ? Number(body.vehicleCode) : null,
      plateNumber: body.plateNumber,
      maintenanceDate: body.maintenanceDate,
      supplierId,
      supplierName: body.supplierName,
      supplierCode: body.supplierCode != null ? Number(body.supplierCode) : null,
      invoiceNumber: body.invoiceNumber || null,
      maintenanceTypeId,
      notes: body.notes || null,
    }).returning()
    const [enriched] = await db.select(MAINTENANCE_FIELDS).from(maintenance)
      .leftJoin(maintenanceTypes, eq(maintenance.maintenanceTypeId, maintenanceTypes.id))
      .where(eq(maintenance.id, data.id))
    return NextResponse.json({ data: enriched }, { status: 201 })
  } catch (e) {
    console.error("POST /api/maintenance failed:", e)
    return NextResponse.json({ error: "Failed to create maintenance record" }, { status: 500 })
  }
}
