const BASE = ""

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.statusText}`)
  }
  return res.json()
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export const api = {
  getVehicles: () => request<{ data: JsonValue[] }>("/api/fleet/vehicles"),
  createVehicle: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/fleet/vehicles", { method: "POST", body: JSON.stringify(body) }),
  updateVehicle: (id: string, body: Record<string, unknown>) =>
    request<{ data: JsonValue }>(`/api/fleet/vehicles/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteVehicle: (id: string) =>
    request<{ data: JsonValue }>(`/api/fleet/vehicles/${id}`, { method: "DELETE" }),
  toggleVehicleActive: (id: string) =>
    request<{ data: JsonValue }>(`/api/fleet/vehicles/${id}/toggle`, { method: "PATCH" }),
  getVehicleHistory: (id: string) =>
    request<{ data: JsonValue[] }>(`/api/fleet/vehicles/${id}/history`),

  getVehicleTypes: () => request<{ data: JsonValue[] }>("/api/fleet/vehicle-types"),
  createVehicleType: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/fleet/vehicle-types", { method: "POST", body: JSON.stringify(body) }),
  updateVehicleType: (id: string, body: Record<string, unknown>) =>
    request<{ data: JsonValue }>(`/api/fleet/vehicle-types/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteVehicleType: (id: string) =>
    request<{ data: JsonValue }>(`/api/fleet/vehicle-types/${id}`, { method: "DELETE" }),

  getDrivers: () => request<{ data: JsonValue[] }>("/api/fleet/drivers"),
  createDriver: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/fleet/drivers", { method: "POST", body: JSON.stringify(body) }),
  updateDriver: (id: string, body: Record<string, unknown>) =>
    request<{ data: JsonValue }>(`/api/fleet/drivers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteDriver: (id: string) =>
    request<{ data: JsonValue }>(`/api/fleet/drivers/${id}`, { method: "DELETE" }),

  getOrders: () => request<{ data: JsonValue[] }>("/api/operations/orders"),
  createOrder: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/operations/orders", { method: "POST", body: JSON.stringify(body) }),
  completeOrder: (id: string) =>
    request<{ data: JsonValue }>(`/api/operations/orders/${id}/complete`, { method: "POST" }),

  getExpenses: () => request<{ data: JsonValue[] }>("/api/expenses"),
  createExpense: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/expenses", { method: "POST", body: JSON.stringify(body) }),

  getJournalEntries: () => request<{ data: JsonValue[] }>("/api/accounting/journal-entries"),
  createJournalEntry: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/accounting/journal-entries", { method: "POST", body: JSON.stringify(body) }),
  getChartOfAccounts: () => request<{ data: JsonValue[] }>("/api/accounting/chart-of-accounts"),
  createAccount: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/accounting/chart-of-accounts", { method: "POST", body: JSON.stringify(body) }),
  getFiscalPeriods: () => request<{ data: JsonValue[] }>("/api/accounting/fiscal-periods"),

  getReports: () => request<{ data: JsonValue }>("/api/reports"),

  getUsers: () => request<{ data: JsonValue[] }>("/api/settings/users"),
  createUser: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/settings/users", { method: "POST", body: JSON.stringify(body) }),
  deactivateUser: (id: string) =>
    request<{ data: JsonValue }>(`/api/settings/users/${id}`, { method: "PUT", body: JSON.stringify({ isActive: false }) }),
  getOutboxMessages: () => request<{ data: JsonValue[] }>("/api/settings/outbox"),
  getAuditLogs: () => request<{ data: JsonValue[] }>("/api/settings/audit-logs"),
}
