import crypto from "crypto"
import { config } from "dotenv"
config({ path: ".env.local" })
import { sql } from "drizzle-orm"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"
import * as relations from "./relations"

const allSchema = { ...schema, ...relations }
const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client, { schema: allSchema })
const { users, accounts, sessions, verifications, vehicles, drivers, vehicleTypes, vehicleHistory, customers, routesTable, operationOrders, expenseCategories, expenses, chartOfAccounts, fiscalPeriods, journalEntries, journalEntryLines, accountsReceivable, accountsPayable, outboxMessages, auditLogs } = schema

const uuid = () => crypto.randomUUID()
const today = () => new Date().toISOString().slice(0, 10)
const addMonths = (d: Date, n: number) => { const r = new Date(d); r.setMonth(r.getMonth() + n); return r.toISOString().slice(0, 10) }
const tables = [auditLogs, outboxMessages, accountsPayable, accountsReceivable, journalEntryLines, journalEntries, expenses, expenseCategories, operationOrders, routesTable, customers, drivers, vehicles, sessions, accounts, verifications, users, chartOfAccounts, fiscalPeriods, vehicleHistory, vehicleTypes]

async function seed() {
  console.log("Seeding database...")
  for (const t of tables) {
    await db.execute(sql`truncate table ${t} cascade`)
  }

  // ── Manager User ──
  const userId = uuid()
  // Hash password using scrypt to match BetterAuth format (salt:hexKey)
  const salt = crypto.randomBytes(16).toString("hex")
  const key = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt("Manager123".normalize("NFKC"), salt, 64, { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 }, (err, k) =>
      err ? reject(err) : resolve(k as Buffer)
    )
  )
  const hashedPassword = `${salt}:${key.toString("hex")}`
  await db.insert(users).values({
    id: userId,
    name: "Manager",
    email: "manager@erp.com",
    emailVerified: true,
    role: "Admin",
  })
  await db.insert(accounts).values({
    id: uuid(),
    userId,
    accountId: "manager@erp.com",
    providerId: "credential",
    password: hashedPassword,
  })

  // ── Vehicle Types ──
  const vtData = [
    { name: "Bus", code: "BUS", model: "Hiace/Sprinter", modelCode: "HS" },
    { name: "Van", code: "VAN", model: "L300/Transit", modelCode: "LT" },
    { name: "Truck", code: "TRK", model: "Actros/FH", modelCode: "AF" },
  ]
  const vtIds: Record<string, string> = {}
  for (const vt of vtData) {
    const id = uuid()
    vtIds[vt.code] = id
    await db.insert(vehicleTypes).values({ id, ...vt })
  }

  // ── Vehicles ──
  const vehicleData = [
    { code: "VHC-001", plateNumber: "ABC-1234", brand: "Toyota", model: "Hiace", year: 2022, capacity: 14, chassisNumber: "CHA-001", engineNumber: "ENG-001", hasGps: true, vehicleTypeId: vtIds["BUS"] },
    { code: "VHC-002", plateNumber: "XYZ-5678", brand: "Mercedes", model: "Sprinter", year: 2023, capacity: 20, chassisNumber: "CHA-002", engineNumber: "ENG-002", hasGps: true, vehicleTypeId: vtIds["BUS"] },
    { code: "VHC-003", plateNumber: "DEF-9012", brand: "Mitsubishi", model: "L300", year: 2021, capacity: 8, chassisNumber: "CHA-003", engineNumber: "ENG-003", hasGps: false, vehicleTypeId: vtIds["VAN"] },
    { code: "VHC-004", plateNumber: "GHI-3456", brand: "Nissan", model: "Urvan", year: 2023, capacity: 15, chassisNumber: "CHA-004", engineNumber: "ENG-004", hasGps: true, vehicleTypeId: vtIds["BUS"] },
    { code: "VHC-005", plateNumber: "JKL-7890", brand: "Ford", model: "Transit", year: 2022, capacity: 12, chassisNumber: "CHA-005", engineNumber: "ENG-005", hasGps: false, vehicleTypeId: vtIds["VAN"] },
  ]
  const vehicleIds: string[] = []
  for (const v of vehicleData) {
    const id = uuid()
    vehicleIds.push(id)
    await db.insert(vehicles).values({ id, ...v })
  }

  // ── Drivers ──
  const driverData = [
    { code: "DRV-001", fullName: "Ahmed Hassan", nationalId: "29801012345678", insuranceNumber: "INS-001", phone: "+201001234567", licenseGrade: "A", salary: "5000", hireDate: "2023-01-15" },
    { code: "DRV-002", fullName: "Mohamed Ali", nationalId: "29001012345679", insuranceNumber: "INS-002", phone: "+201001234568", licenseGrade: "B", salary: "4500", hireDate: "2023-03-20" },
    { code: "DRV-003", fullName: "Khaled Omar", nationalId: "29201012345680", insuranceNumber: "INS-003", phone: "+201001234569", licenseGrade: "A", salary: "5200", hireDate: "2022-11-01" },
  ]
  const driverIds: string[] = []
  for (const d of driverData) {
    const id = uuid()
    driverIds.push(id)
    await db.insert(drivers).values({ id, ...d })
  }

  // ── Customers ──
  const customerData = [
    { name: "Egypt Travel Co.", email: "info@egypttravel.com", phone: "+20212345678", address: "Cairo, Egypt", taxId: "TX-001" },
    { name: "Nile Logistics", email: "contact@nilelogistics.com", phone: "+20212345679", address: "Alexandria, Egypt", taxId: "TX-002" },
    { name: "Sinai Tours", email: "info@sinaitours.com", phone: "+20212345680", address: "Sharm El Sheikh, Egypt", taxId: "TX-003" },
    { name: "Delta Shipping", email: "ops@deltashipping.com", phone: "+20212345681", address: "Damietta, Egypt", taxId: "TX-004" },
  ]
  const customerIds: string[] = []
  for (const c of customerData) {
    const id = uuid()
    customerIds.push(id)
    await db.insert(customers).values({ id, ...c })
  }

  // ── Routes ──
  const routeData = [
    { name: "Cairo→Alexandria", origin: "Cairo", destination: "Alexandria", distanceKm: "220", estimatedDuration: 180 },
    { name: "Cairo→Sharm El Sheikh", origin: "Cairo", destination: "Sharm El Sheikh", distanceKm: "500", estimatedDuration: 360 },
    { name: "Alexandria→Marsa Matruh", origin: "Alexandria", destination: "Marsa Matruh", distanceKm: "300", estimatedDuration: 240 },
    { name: "Cairo→Luxor", origin: "Cairo", destination: "Luxor", distanceKm: "670", estimatedDuration: 480 },
  ]
  const routeIds: string[] = []
  for (const r of routeData) {
    const id = uuid()
    routeIds.push(id)
    await db.insert(routesTable).values({ id, ...r })
  }

  // ── Orders ──
  const d = new Date()
  const orderInputs = [
    { customerId: customerIds[0], routeId: routeIds[0], vehicleId: vehicleIds[0], driverId: driverIds[0], scheduledDate: today(), status: "InProgress" as const, priceAmount: "15000", priceCurrency: "USD", baseAmount: "300000" },
    { customerId: customerIds[1], routeId: routeIds[1], vehicleId: vehicleIds[1], driverId: driverIds[1], scheduledDate: addMonths(d, 1), status: "Pending" as const, priceAmount: "25000", priceCurrency: "USD", baseAmount: "500000" },
    { customerId: customerIds[2], routeId: routeIds[2], vehicleId: vehicleIds[2], driverId: driverIds[2], scheduledDate: addMonths(d, -1), status: "Completed" as const, priceAmount: "12000", priceCurrency: "USD", baseAmount: "240000" },
  ]
  for (const o of orderInputs) {
    await db.insert(operationOrders).values({
      id: uuid(),
      orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      ...o,
    })
  }

  // ── Expense Categories ──
  const catData = [
    { name: "Fuel", description: "Fuel and lubricants" },
    { name: "Maintenance", description: "Vehicle maintenance and repairs" },
    { name: "Tolls", description: "Toll road fees" },
    { name: "Salaries", description: "Driver and staff salaries" },
  ]
  const catIds: string[] = []
  for (const c of catData) {
    const id = uuid()
    catIds.push(id)
    await db.insert(expenseCategories).values({ id, ...c })
  }

  // ── Expenses ──
  await db.insert(expenses).values([
    { id: uuid(), categoryId: catIds[0], vehicleId: vehicleIds[0], description: "Diesel fill-up", amount: "4500", baseAmount: "4500", expenseDate: today() },
    { id: uuid(), categoryId: catIds[1], vehicleId: vehicleIds[1], description: "Oil change", amount: "2200", baseAmount: "2200", expenseDate: addMonths(d, -1) },
    { id: uuid(), categoryId: catIds[2], vehicleId: vehicleIds[2], description: "Toll fees Cairo-Alex", amount: "800", baseAmount: "800", expenseDate: today() },
  ])

  // ── Chart of Accounts ──
  const accountsData = [
    { code: "1000", name: "Assets", type: "Asset" },
    { code: "1100", name: "Cash & Bank", type: "Asset" },
    { code: "1200", name: "Accounts Receivable", type: "Asset" },
    { code: "1300", name: "Vehicles", type: "Asset" },
    { code: "2000", name: "Liabilities", type: "Liability" },
    { code: "2100", name: "Accounts Payable", type: "Liability" },
    { code: "3000", name: "Equity", type: "Equity" },
    { code: "3100", name: "Retained Earnings", type: "Equity" },
    { code: "4000", name: "Revenue", type: "Revenue" },
    { code: "4100", name: "Transportation Revenue", type: "Revenue" },
    { code: "5000", name: "Expenses", type: "Expense" },
    { code: "5100", name: "Fuel Expense", type: "Expense" },
    { code: "5200", name: "Maintenance Expense", type: "Expense" },
    { code: "5300", name: "Salary Expense", type: "Expense" },
  ]
  for (const a of accountsData) {
    await db.insert(chartOfAccounts).values({ id: uuid(), ...a })
  }

  // ── Fiscal Periods ──
  await db.insert(fiscalPeriods).values([
    { id: uuid(), name: "Q1 2026", startDate: "2026-01-01", endDate: "2026-03-31" },
    { id: uuid(), name: "Q2 2026", startDate: "2026-04-01", endDate: "2026-06-30" },
    { id: uuid(), name: "Q3 2026", startDate: "2026-07-01", endDate: "2026-09-30" },
  ])

  // ── Audit Log ──
  await db.insert(auditLogs).values([
    { id: uuid(), userId, action: "Seed", entityType: "System", newValues: JSON.stringify({ message: "Database seeded successfully" }) },
  ])

  console.log("Seed complete!")
}

seed().catch((e) => {
  console.error("Seed failed:", e)
  process.exit(1)
})
