const BASE = ""

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || `Request failed: ${res.statusText}`) as Error & { status: number; fields?: string[] }
    err.status = res.status
    err.fields = body.fields
    throw err
  }
  return res.json()
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export const api = {
  getVehicles: () => request<{ data: JsonValue[] }>("/api/fleet/vehicles"),
  searchVehicles: (params: Record<string, string>) =>
    request<{ data: JsonValue[]; total: number }>(`/api/fleet/vehicles?${new URLSearchParams(params).toString()}`),
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

  getLicenseGrades: () => request<{ data: JsonValue[] }>("/api/fleet/license-grades"),
  createLicenseGrade: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/fleet/license-grades", { method: "POST", body: JSON.stringify(body) }),
  updateLicenseGrade: (id: string, body: Record<string, unknown>) =>
    request<{ data: JsonValue }>(`/api/fleet/license-grades/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteLicenseGrade: (id: string) =>
    request<{ data: JsonValue }>(`/api/fleet/license-grades/${id}`, { method: "DELETE" }),

  getDrivers: () => request<{ data: JsonValue[] }>("/api/fleet/drivers"),
  searchDrivers: (params: Record<string, string>) =>
    request<{ data: JsonValue[]; total: number }>(`/api/fleet/drivers?${new URLSearchParams(params).toString()}`),
  createDriver: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/fleet/drivers", { method: "POST", body: JSON.stringify(body) }),
  updateDriver: (id: string, body: Record<string, unknown>) =>
    request<{ data: JsonValue }>(`/api/fleet/drivers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteDriver: (id: string) =>
    request<{ data: JsonValue }>(`/api/fleet/drivers/${id}`, { method: "DELETE" }),
  toggleDriverActive: (id: string, code?: string) =>
    request<{ data: JsonValue }>(`/api/fleet/drivers/${id}/toggle${code ? `?code=${encodeURIComponent(code)}` : ""}`, { method: "PATCH" }),

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

  getSuppliers: () => request<{ data: JsonValue[] }>("/api/suppliers"),
  createSupplier: (body: Record<string, unknown>) =>
    request<{ data: JsonValue }>("/api/suppliers", { method: "POST", body: JSON.stringify(body) }),
  updateSupplier: (id: string, body: Record<string, unknown>) =>
    request<{ data: JsonValue }>(`/api/suppliers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSupplier: (id: string) =>
    request<{ data: JsonValue }>(`/api/suppliers/${id}`, { method: "DELETE" }),
}
