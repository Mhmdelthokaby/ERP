import { relations } from "drizzle-orm"
import {
  users, sessions, accounts, verifications,
  vehicles, drivers, vehicleTypes, vehicleHistory,
  operationOrders,
} from "./schema"

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  users: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  users: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const verificationsRelations = relations(verifications, () => ({}))

export const vehicleTypesRelations = relations(vehicleTypes, ({ many }) => ({
  vehicles: many(vehicles),
}))

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  vehicleType: one(vehicleTypes, {
    fields: [vehicles.vehicleTypeId],
    references: [vehicleTypes.id],
  }),
  driver: one(drivers, {
    fields: [vehicles.driverId],
    references: [drivers.id],
  }),
  history: many(vehicleHistory),
  operationOrders: many(operationOrders),
}))

export const vehicleHistoryRelations = relations(vehicleHistory, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleHistory.vehicleId],
    references: [vehicles.id],
  }),
}))

export const driversRelations = relations(drivers, ({ many }) => ({
  operationOrders: many(operationOrders),
}))
