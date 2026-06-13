import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  numeric,
  date,
  integer,
  boolean,
  jsonb,
  serial,
} from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", [
  "Admin",
  "Operator",
  "Accountant",
  "Viewer",
])

export const orderStatusEnum = pgEnum("order_status", [
  "Pending",
  "InProgress",
  "Completed",
  "Cancelled",
])

export const outboxStatusEnum = pgEnum("outbox_status", [
  "Pending",
  "Processed",
  "Failed",
])

export const journalEntryStatusEnum = pgEnum("journal_entry_status", [
  "Draft",
  "Posted",
  "Reversed",
])

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("Viewer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
})

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const vehicleTypes = pgTable("vehicle_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  model: text("model").notNull(),
  modelCode: text("model_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  plateNumber: text("plate_number").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  capacity: integer("capacity").notNull(),
  chassisNumber: text("chassis_number"),
  engineNumber: text("engine_number"),
  licenseDate: date("license_date"),
  licenseExpiryDate: date("license_expiry_date"),
  ownerName: text("owner_name"),
  licenseType: text("license_type"),
  purchaseDate: date("purchase_date"),
  hasGps: boolean("has_gps").notNull().default(false),
  vehicleTypeId: uuid("vehicle_type_id").references(() => vehicleTypes.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const drivers = pgTable("drivers", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: serial("code").notNull().unique(),
  fullName: text("full_name").notNull(),
  nationalId: text("national_id").unique(),
  insuranceNumber: text("insurance_number").unique(),
  phone: text("phone").notNull().unique(),
  licenseGrade: text("license_grade"),
  salary: numeric("salary"),
  hireDate: date("hire_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const licenseGrades = pgTable("license_grades", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const vehicleHistory = pgTable("vehicle_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  plateNumber: text("plate_number").notNull(),
  engineNumber: text("engine_number"),
  licenseDate: date("license_date"),
  licenseExpiryDate: date("license_expiry_date"),
  licenseType: text("license_type"),
  isActive: boolean("is_active"),
  modifiedAt: timestamp("modified_at").notNull().defaultNow(),
  modifiedBy: text("modified_by"),
})

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  taxId: text("tax_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const routesTable = pgTable("routes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  distanceKm: numeric("distance_km").notNull(),
  estimatedDuration: integer("estimated_duration"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const operationOrders = pgTable("operation_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  routeId: uuid("route_id")
    .notNull()
    .references(() => routesTable.id),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  driverId: uuid("driver_id")
    .notNull()
    .references(() => drivers.id),
  scheduledDate: date("scheduled_date").notNull(),
  status: orderStatusEnum("status").notNull().default("Pending"),
  priceAmount: numeric("price_amount").notNull(),
  priceCurrency: text("price_currency").notNull().default("USD"),
  baseAmount: numeric("base_amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
})

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => expenseCategories.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  operationOrderId: uuid("operation_order_id").references(
    () => operationOrders.id,
  ),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  baseAmount: numeric("base_amount").notNull(),
  expenseDate: date("expense_date").notNull(),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const fiscalPeriods = pgTable("fiscal_periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isClosed: boolean("is_closed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryNumber: text("entry_number").notNull().unique(),
  description: text("description").notNull(),
  entryDate: date("entry_date").notNull(),
  status: journalEntryStatusEnum("status").notNull().default("Draft"),
  fiscalPeriodId: uuid("fiscal_period_id").references(
    () => fiscalPeriods.id,
  ),
  createdFromIp: text("created_from_ip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const journalEntryLines = pgTable("journal_entry_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  journalEntryId: uuid("journal_entry_id")
    .notNull()
    .references(() => journalEntries.id, { onDelete: "cascade" }),
  accountId: uuid("account_id")
    .notNull()
    .references(() => chartOfAccounts.id),
  debitAmount: numeric("debit_amount").notNull().default("0"),
  creditAmount: numeric("credit_amount").notNull().default("0"),
  currency: text("currency").notNull().default("USD"),
  baseAmount: numeric("base_amount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const accountsReceivable = pgTable("accounts_receivable", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  journalEntryLineId: uuid("journal_entry_line_id")
    .notNull()
    .references(() => journalEntryLines.id),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  baseAmount: numeric("base_amount").notNull(),
  dueDate: date("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const accountsPayable = pgTable("accounts_payable", {
  id: uuid("id").defaultRandom().primaryKey(),
  vendorName: text("vendor_name").notNull(),
  journalEntryLineId: uuid("journal_entry_line_id")
    .notNull()
    .references(() => journalEntryLines.id),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  baseAmount: numeric("base_amount").notNull(),
  dueDate: date("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const outboxMessages = pgTable("outbox_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  status: outboxStatusEnum("status").notNull().default("Pending"),
  retryCount: integer("retry_count").notNull().default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
})

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
