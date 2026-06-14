"use client"

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react"
import {
  defaultData, type AppData, type Vehicle, type VehicleType, type Driver, type Trip,
  type VehicleExpense, type JournalEntry, type JournalLine,
  type User, type PageName, type CoaNode, type VehicleHistoryEntry, type Leg,
  type LicenseGrade, type Supplier,
} from "./store"
import { api } from "./api"

interface Toast { id: number; message: string; type: "success" | "error" | "info" | "warning" }

interface AppContextType {
  data: AppData
  loading: boolean
  apiAvailable: boolean
  currentPage: PageName
  setPage: (p: PageName) => void
  currentSubtitle: string
  setCurrentSubtitle: (s: string) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  toasts: Toast[]
  showToast: (message: string, type?: Toast["type"]) => void
  removeToast: (id: number) => void
  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
  editingVehicle: Vehicle | null
  editingDriver: Driver | null
  editingVehicleType: VehicleType | null
  setEditingVehicle: (v: Vehicle | null) => void
  setEditingDriver: (d: Driver | null) => void
  setEditingVehicleType: (vt: VehicleType | null) => void
  editingLicenseGrade: LicenseGrade | null
  setEditingLicenseGrade: (lg: LicenseGrade | null) => void
  addLicenseGrade: (lg: Omit<LicenseGrade, "id">) => void
  updateLicenseGrade: (id: number, lg: Partial<LicenseGrade>) => void
  deleteLicenseGrade: (id: number) => void
  editingSupplier: Supplier | null
  setEditingSupplier: (s: Supplier | null) => void
  addSupplier: (s: Omit<Supplier, "id" | "code" | "dbId">) => Promise<void>
  updateSupplier: (id: number, updates: Partial<Supplier>) => void
  deleteSupplier: (id: number) => void
  addVehicleType: (vt: Omit<VehicleType, "id">) => void
  updateVehicleType: (id: number, vt: Partial<VehicleType>) => void
  deleteVehicleType: (id: number) => void
  addVehicle: (v: Omit<Vehicle, "id" | "status" | "code">) => Promise<void>
  updateVehicle: (id: number, v: Partial<Vehicle>) => Promise<void>
  toggleVehicleActive: (id: number) => void
  deactivateVehicle: (id: number) => void
  addDriver: (d: Omit<Driver, "id" | "code">) => void
  updateDriver: (id: number, d: Partial<Driver>) => void
  deleteDriver: (id: number) => void
  fetchVehicleHistory: (id: number) => Promise<void>
  addTrip: (t: { from: string; to: string; customer: string; date: string; price: number; rate: number }) => void
  changeTripStatus: (id: number, newStatus: string) => void
  addExpense: (e: Omit<VehicleExpense, "id">) => void
  addJournalLine: () => void
  updateJournalBalance: () => { totalDebit: number; totalCredit: number }
  submitJournalEntry: (desc: string, date: string, lines: JournalLine[]) => void
  reverseEntry: (id: number) => void
  addAccount: (code: string, name: string, type: string) => void
  addUser: (u: { name: string; email: string; password: string; role: string }) => void
  deactivateUser: (id: number) => void
  toggleLegActive: (id: number) => void
  toggleDriverActive: (id: number) => void
  pendingVehicleView: number | null
  setPendingVehicleView: (id: number | null) => void
  pendingDriverView: number | null
  setPendingDriverView: (id: number | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

function dbVehicleToMock(v: Record<string, unknown>): Vehicle {
  const rawId = String(v.id ?? "")
  return {
    dbId: rawId,
    id: parseInt(rawId.slice(0, 8), 16) || Math.random(),
    code: Number(v.code) || 0,
    plateNumber: String(v.plateNumber || ""),
    model: String(v.model || ""),
    year: Number(v.year) || 0,
    capacity: Number(v.capacity) || 0,
    status: String(v.isActive) === "true" ? "Active" : "Inactive",
    vehicleType: String(v.vehicleTypeName || ""),
    vehicleTypeId: v.vehicleTypeId ? parseInt(String(v.vehicleTypeId).slice(0, 8), 16) || null : null,
    driverId: v.driverId ? parseInt(String(v.driverId).slice(0, 8), 16) || null : null,
    driverName: String(v.driverName || ""),
    chassisNumber: String(v.chassisNumber || ""),
    engineNumber: String(v.engineNumber || ""),
    licenseDate: String(v.licenseDate || ""),
    licenseExpiryDate: String(v.licenseExpiryDate || ""),
    ownerName: String(v.ownerName || ""),
    licenseType: String(v.licenseType || ""),
    purchaseDate: String(v.purchaseDate || ""),
    hasGps: String(v.hasGps) === "true",
    fuelConsumption: v.fuelConsumption != null ? Number(v.fuelConsumption) : null,
  }
}

function dbDriverToMock(d: Record<string, unknown>): Driver {
  const rawId = String(d.id ?? "")
  return {
    id: parseInt(rawId.slice(0, 8), 16) || Math.random(),
    dbId: rawId,
    code: Number(d.code) || 0,
    fullName: String(d.fullName || ""),
    phone: String(d.phone || ""),
    nationalId: String(d.nationalId || ""),
    licenseGrade: String(d.licenseGrade || ""),
    insuranceNumber: d.insuranceNumber ? String(d.insuranceNumber) : undefined,
    salary: d.salary ? String(d.salary) : undefined,
    hireDate: d.hireDate ? String(d.hireDate) : undefined,
    isActive: String(d.isActive) === "true",
  }
}

function dbHistoryToMock(h: Record<string, unknown>): VehicleHistoryEntry {
  return {
    id: parseInt(String(h.id ?? "").slice(0, 8), 16) || Math.random(),
    plateNumber: String(h.plateNumber || ""),
    engineNumber: String(h.engineNumber || ""),
    licenseDate: String(h.licenseDate || ""),
    licenseExpiryDate: String(h.licenseExpiryDate || ""),
    licenseType: String(h.licenseType || ""),
    ownerName: String(h.ownerName || ""),
    isActive: h.isActive != null ? String(h.isActive) === "true" : null,
    modifiedAt: String(h.modifiedAt || ""),
    modifiedBy: String(h.modifiedBy || ""),
  }
}

function dbLicenseGradeToMock(lg: Record<string, unknown>): LicenseGrade {
  const rawId = String(lg.id ?? "")
  return {
    id: parseInt(rawId.slice(0, 8), 16) || Math.random(),
    dbId: rawId,
    name: String(lg.name || ""),
  }
}

function dbSupplierToMock(s: Record<string, unknown>): Supplier {
  const rawId = String(s.id ?? "")
  return {
    id: parseInt(rawId.slice(0, 8), 16) || Math.random(),
    dbId: rawId,
    code: Number(s.code) || 0,
    name: String(s.name || ""),
    taxNumber: String(s.taxNumber || ""),
    phone: String(s.phone || ""),
    notes: String(s.notes || ""),
  }
}

function dbVehicleTypeToMock(vt: Record<string, unknown>): VehicleType {
  const rawId = String(vt.id ?? "")
  return {
    dbId: rawId,
    id: parseInt(rawId.slice(0, 8), 16) || Math.random(),
    name: String(vt.name || ""),
    code: String(vt.code || ""),
    model: String(vt.model || ""),
    modelCode: String(vt.modelCode || ""),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData)
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [pendingVehicleView, setPendingVehicleView] = useState<number | null>(null)
  const [pendingDriverView, setPendingDriverView] = useState<number | null>(null)
  const [toastId, setToastId] = useState(0)
  const [loading, setLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(false)

  useEffect(() => {
    api.getVehicleTypes().then((res) => {
      setData((prev) => ({ ...prev, vehicleTypes: res.data.map((vt) => dbVehicleTypeToMock(vt as Record<string, unknown>)) }))
    }).catch(() => {})
    api.getVehicles().then((res) => {
      setData((prev) => ({ ...prev, vehicles: res.data.map((v) => dbVehicleToMock(v as Record<string, unknown>)) }))
    }).catch(() => {})
    api.getDrivers().then((res) => {
      setData((prev) => ({ ...prev, drivers: res.data.map((d) => dbDriverToMock(d as Record<string, unknown>)) }))
    }).catch(() => {})
    api.getLicenseGrades().then((res) => {
      setData((prev) => ({ ...prev, licenseGrades: res.data.map((lg) => dbLicenseGradeToMock(lg as Record<string, unknown>)) }))
    }).catch(() => {})
    api.getSuppliers().then((res) => {
      setData((prev) => ({ ...prev, suppliers: res.data.map((s) => dbSupplierToMock(s as Record<string, unknown>)) }))
    }).catch(() => {})
    Promise.all([
      api.getOrders().catch(() => null),
      api.getExpenses().catch(() => null),
      api.getJournalEntries().catch(() => null),
      api.getChartOfAccounts().catch(() => null),
      api.getFiscalPeriods().catch(() => null),
      api.getUsers().catch(() => null),
      api.getOutboxMessages().catch(() => null),
      api.getAuditLogs().catch(() => null),
    ]).then(([ordersRes, expensesRes, journalRes, coaRes, periodsRes, usersRes, outboxRes, auditRes]) => {
      const allOk = [ordersRes, expensesRes, journalRes, coaRes, periodsRes, usersRes, outboxRes, auditRes].every(Boolean)
      if (!allOk) {
        setLoading(false)
        return
      }
      setApiAvailable(true)
      setData((prev) => ({
        ...prev,
        journalEntries: journalRes!.data as unknown as JournalEntry[],
        chartOfAccounts: coaRes!.data as unknown as CoaNode[],
        users: usersRes!.data as unknown as User[],
        outboxMessages: outboxRes!.data as unknown as AppData["outboxMessages"],
        auditLogs: auditRes!.data as unknown as AppData["auditLogs"],
      }))
      setLoading(false)
    })
  }, [])

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = toastId + 1
    setToastId(id)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)) }, 3000)
  }, [toastId])

  const removeToast = useCallback((id: number) => { setToasts((prev) => prev.filter((t) => t.id !== id)) }, [])
  const openModal = useCallback((id: string) => setActiveModal(id), [])
  const closeModal = useCallback(() => setActiveModal(null), [])
  const [currentSubtitle, setCurrentSubtitle] = useState("")
  const setPage = useCallback((p: PageName) => {
    setCurrentPage(p); setCurrentSubtitle("")
  }, [])
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null)
  const [editingLicenseGrade, setEditingLicenseGrade] = useState<LicenseGrade | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const addVehicle = useCallback((v: Omit<Vehicle, "id" | "status" | "code">) => {
    const vt = v.vehicleTypeId ? data.vehicleTypes.find((t) => t.id === v.vehicleTypeId) : null
    const dr = v.driverId ? data.drivers.find((d) => d.id === v.driverId) : null
    const { vehicleType, driverName, ...dbFields } = { ...v, vehicleTypeId: vt?.dbId ?? null, driverId: dr?.dbId ?? null }
    return api.createVehicle({ ...dbFields, brand: dbFields.model.split(" ")[0] || dbFields.model, isActive: true }).then((res) => {
      const mapped = dbVehicleToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, vehicles: [...prev.vehicles, mapped] }))
    }).catch((e) => {
      if (e.status !== 409) showToast(`Failed to save vehicle: ${e.message || "server error"}`, "error")
      throw e
    })
  }, [data.vehicleTypes, data.drivers, showToast])

  const updateVehicle = useCallback((id: number, updates: Partial<Vehicle>) => {
    const v = data.vehicles.find((x) => x.id === id)
    if (!v) return Promise.reject(new Error("Vehicle not found"))
    const vt = updates.vehicleTypeId ? data.vehicleTypes.find((t) => t.id === updates.vehicleTypeId) : null
    const dr = updates.driverId ? data.drivers.find((d) => d.id === updates.driverId) : null
    const { vehicleType, driverName, status, ...dbFields } = { ...updates, vehicleTypeId: vt?.dbId ?? null, driverId: dr?.dbId ?? null }
    return api.updateVehicle(v.dbId ?? String(v.id), dbFields).then((res) => {
      const mapped = dbVehicleToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, vehicles: prev.vehicles.map((x) => x.id === id ? mapped : x) }))
    }).catch((e) => {
      if (e.status !== 409) showToast(`Failed to update vehicle: ${e.message || "server error"}`, "error")
      throw e
    })
  }, [data.vehicles, data.vehicleTypes, data.drivers, showToast])

  const fetchVehicleHistory = useCallback(async (id: number) => {
    const v = data.vehicles.find((x) => x.id === id)
    if (!v) return
    try {
      const res = await api.getVehicleHistory(v.dbId ?? String(v.id))
      const history = res.data.map((h) => dbHistoryToMock(h as Record<string, unknown>))
      setData((prev) => ({ ...prev, vehicleHistory: { ...prev.vehicleHistory, [id]: history } }))
    } catch {
      showToast("Failed to fetch vehicle history", "error")
    }
  }, [data.vehicles, showToast])

  const toggleVehicleActive = useCallback((id: number) => {
    const v = data.vehicles.find((x) => x.id === id)
    if (!v) return
    api.toggleVehicleActive(v.dbId ?? String(v.id)).then((res) => {
      const mapped = dbVehicleToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, vehicles: prev.vehicles.map((x) => x.id === id ? mapped : x) }))
      fetchVehicleHistory(id)
    }).catch(() => {
      const newStatus = v.status === "Active" ? "Inactive" : "Active"
      setData((prev) => ({ ...prev, vehicles: prev.vehicles.map((x) => x.id === id ? { ...x, status: newStatus } : x) }))
    })
    showToast(`${v.plateNumber} toggled`)
  }, [data.vehicles, fetchVehicleHistory, showToast])

  const deactivateVehicle = useCallback((id: number) => {
    const v = data.vehicles.find((x) => x.id === id)
    if (!v) return
    api.updateVehicle(v.dbId ?? String(v.id), { isActive: false }).then((res) => {
      const mapped = dbVehicleToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, vehicles: prev.vehicles.map((x) => x.id === id ? mapped : x) }))
    }).catch(() => {
      setData((prev) => ({ ...prev, vehicles: prev.vehicles.map((x) => x.id === id ? { ...x, status: "Inactive" } : x) }))
    })
    showToast(`${v.plateNumber} deactivated`, "warning")
  }, [data.vehicles, showToast])

  const addDriver = useCallback((d: Omit<Driver, "id" | "code">) => {
    return api.createDriver(d).then((res) => {
      const mapped = dbDriverToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, drivers: [...prev.drivers, mapped] }))
      showToast(`Driver ${d.fullName} added`)
    }).catch((e) => {
      if (e.status === 409) throw e
      setData((prev) => {
        const maxCode = prev.drivers.reduce((max, dr) => Math.max(max, dr.code), 0)
        return { ...prev, drivers: [...prev.drivers, { ...d, id: prev.drivers.length + 1, code: maxCode + 1 }] }
      })
      showToast(`Driver ${d.fullName} added`)
    })
  }, [showToast])

  const updateDriver = useCallback((id: number, updates: Partial<Driver>) => {
    const d = data.drivers.find((x) => x.id === id)
    if (!d) return
    return api.updateDriver(d.dbId ?? String(d.id), updates).then((res) => {
      const mapped = dbDriverToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, drivers: prev.drivers.map((x) => x.id === id ? mapped : x) }))
      showToast(`Driver ${d.fullName} updated`)
    }).catch((e) => {
      if (e.status === 409) throw e
      setData((prev) => ({ ...prev, drivers: prev.drivers.map((x) => x.id === id ? { ...x, ...updates } : x) }))
      showToast(`Driver ${d.fullName} updated`)
    })
  }, [data.drivers, showToast])

  const addSupplier = useCallback((s: Omit<Supplier, "id" | "code" | "dbId">) => {
    return api.createSupplier(s).then((res) => {
      const mapped = dbSupplierToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, suppliers: [...prev.suppliers, mapped] }))
      showToast(`Supplier ${s.name} added`)
    }).catch((e) => {
      showToast(`Failed to add supplier: ${e.message}`, "error")
      throw e
    })
  }, [showToast])

  const updateSupplier = useCallback((id: number, updates: Partial<Supplier>) => {
    const s = data.suppliers.find((x) => x.id === id)
    if (!s) return
    return api.updateSupplier(s.dbId ?? String(s.id), updates).then((res) => {
      const mapped = dbSupplierToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, suppliers: prev.suppliers.map((x) => x.id === id ? mapped : x) }))
      showToast(`Supplier ${s.name} updated`)
    }).catch((e) => {
      showToast(`Failed to update supplier: ${e.message}`, "error")
    })
  }, [data.suppliers, showToast])

  const deleteSupplier = useCallback((id: number) => {
    const s = data.suppliers.find((x) => x.id === id)
    if (!s) return
    api.deleteSupplier(s.dbId ?? String(s.id)).then(() => {
      setData((prev) => ({ ...prev, suppliers: prev.suppliers.filter((x) => x.id !== id) }))
      showToast(`Supplier ${s.name} deleted`, "warning")
    }).catch(() => {
      setData((prev) => ({ ...prev, suppliers: prev.suppliers.filter((x) => x.id !== id) }))
      showToast(`Supplier ${s.name} deleted`, "warning")
    })
  }, [data.suppliers, showToast])

  const deleteDriver = useCallback((id: number) => {
    const d = data.drivers.find((x) => x.id === id)
    if (!d) return
    api.deleteDriver(d.dbId ?? String(d.id)).then(() => {
      setData((prev) => ({ ...prev, drivers: prev.drivers.filter((x) => x.id !== id) }))
    }).catch(() => {
      setData((prev) => ({ ...prev, drivers: prev.drivers.filter((x) => x.id !== id) }))
    })
    showToast(`Driver ${d.fullName} deleted`, "warning")
  }, [data.drivers, showToast])

  const addVehicleType = useCallback((vt: Omit<VehicleType, "id">) => {
    api.createVehicleType(vt).then((res) => {
      const mapped = dbVehicleTypeToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, vehicleTypes: [...prev.vehicleTypes, mapped] }))
    }).catch(() => {
      setData((prev) => ({ ...prev, vehicleTypes: [...prev.vehicleTypes, { ...vt, id: prev.vehicleTypes.length + 1 }] }))
    })
    showToast(`Vehicle type ${vt.name} added`)
  }, [showToast])

  const updateVehicleType = useCallback((id: number, updates: Partial<VehicleType>) => {
    const vt = data.vehicleTypes.find((x) => x.id === id)
    if (!vt) return
    api.updateVehicleType(String(vt.id), updates).then((res) => {
      const mapped = dbVehicleTypeToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, vehicleTypes: prev.vehicleTypes.map((x) => x.id === id ? mapped : x) }))
    }).catch(() => {
      setData((prev) => ({ ...prev, vehicleTypes: prev.vehicleTypes.map((x) => x.id === id ? { ...x, ...updates } : x) }))
    })
    showToast(`Vehicle type ${vt.name} updated`)
  }, [data.vehicleTypes, showToast])

  const addLicenseGrade = useCallback((lg: Omit<LicenseGrade, "id">) => {
    api.createLicenseGrade(lg).then((res) => {
      const mapped = dbLicenseGradeToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, licenseGrades: [...prev.licenseGrades, mapped] }))
    }).catch(() => {
      setData((prev) => ({ ...prev, licenseGrades: [...prev.licenseGrades, { ...lg, id: prev.licenseGrades.length + 1 }] }))
    })
    showToast(`License grade ${lg.name} added`)
  }, [showToast])

  const updateLicenseGrade = useCallback((id: number, updates: Partial<LicenseGrade>) => {
    const lg = data.licenseGrades.find((x) => x.id === id)
    if (!lg) return
    api.updateLicenseGrade(lg.dbId ?? String(lg.id), updates).then((res) => {
      const mapped = dbLicenseGradeToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, licenseGrades: prev.licenseGrades.map((x) => x.id === id ? mapped : x) }))
    }).catch(() => {
      setData((prev) => ({ ...prev, licenseGrades: prev.licenseGrades.map((x) => x.id === id ? { ...x, ...updates } : x) }))
    })
    showToast(`License grade ${lg.name} updated`)
  }, [data.licenseGrades, showToast])

  const deleteLicenseGrade = useCallback((id: number) => {
    const lg = data.licenseGrades.find((x) => x.id === id)
    if (!lg) return
    api.deleteLicenseGrade(lg.dbId ?? String(lg.id)).then(() => {
      setData((prev) => ({ ...prev, licenseGrades: prev.licenseGrades.filter((x) => x.id !== id) }))
    }).catch(() => {
      setData((prev) => ({ ...prev, licenseGrades: prev.licenseGrades.filter((x) => x.id !== id) }))
    })
    showToast(`License grade ${lg.name} deleted`, "warning")
  }, [data.licenseGrades, showToast])

  const deleteVehicleType = useCallback((id: number) => {
    const vt = data.vehicleTypes.find((x) => x.id === id)
    if (!vt) return
    api.deleteVehicleType(String(vt.id)).then(() => {
      setData((prev) => ({ ...prev, vehicleTypes: prev.vehicleTypes.filter((x) => x.id !== id) }))
    }).catch(() => {
      setData((prev) => ({ ...prev, vehicleTypes: prev.vehicleTypes.filter((x) => x.id !== id) }))
    })
    showToast(`Vehicle type ${vt.name} deleted`, "warning")
  }, [data.vehicleTypes, showToast])

  const addTrip = useCallback((t: { from: string; to: string; customer: string; date: string; price: number; rate: number }) => {
    api.createOrder({ customerId: t.customer, origin: t.from, destination: t.to, scheduledDate: t.date, priceAmount: String(t.price), baseAmount: String(t.price * t.rate) }).catch(() => {})
    setData((prev) => {
      const newId = prev.trips.length + 42
      const newTrip: Trip = { id: newId, from: t.from, to: t.to, customer: t.customer, vehicle: "ABC-1234", driver: "Ahmed Hassan", date: t.date, price: t.price, priceBase: t.price * t.rate, status: "Pending" }
      return { ...prev, trips: [newTrip, ...prev.trips] }
    })
    showToast(`Trip ${t.from} → ${t.to} created`)
  }, [showToast])

  const changeTripStatus = useCallback((id: number, newStatus: string) => {
    setData((prev) => {
      const trip = prev.trips.find((t) => t.id === id)
      if (!trip) return prev
      const allowed: Record<string, string[]> = { Pending: ["InProgress", "Cancelled"], InProgress: ["Completed"], Completed: [], Cancelled: [] }
      if (!allowed[trip.status]?.includes(newStatus)) {
        showToast(`Invalid transition: ${trip.status} → ${newStatus}`, "error")
        return prev
      }
      const trips = prev.trips.map((t) => t.id === id ? { ...t, status: newStatus } : t)
      const outbox = [...prev.outboxMessages]
      if (newStatus === "Completed") {
        api.completeOrder(id.toString()).catch(() => {})
        outbox.push({ id: outbox.length + 1, event: "TripCompleted", status: "Pending", retries: 0, occurred: new Date().toISOString().slice(0, 16).replace("T", " "), error: null })
        setTimeout(() => {
          setData((p) => {
            const jeNum = p.nextJeNumber
            const newEntry: JournalEntry = {
              id: p.journalEntries.length + 1, number: `JE-2024-${String(jeNum).padStart(5, "0")}`,
              date: trip.date, desc: `Trip #${id} · ${trip.from} → ${trip.to} · ${trip.customer}`,
              source: "TripCompleted", debit: trip.priceBase, credit: trip.priceBase, reversed: false,
              lines: [
                { account: "1200 - Accounts Receivable", debit: trip.priceBase, credit: 0 },
                { account: "4100 - Transportation Revenue", debit: 0, credit: trip.priceBase },
              ],
            }
            return { ...p, journalEntries: [newEntry, ...p.journalEntries], nextJeNumber: jeNum + 1 }
          })
          showToast(`Journal entry created for Trip #${id}`, "info")
        }, 1500)
      }
      return { ...prev, trips, outboxMessages: outbox }
    })
    if (newStatus === "Completed") showToast(`Trip #${id} completed — Outbox event fired`)
    else if (newStatus === "Cancelled") showToast(`Trip #${id} cancelled`, "warning")
    else showToast(`Trip #${id} started`, "info")
  }, [showToast])

  const addExpense = useCallback((e: Omit<VehicleExpense, "id">) => {
    api.createExpense({ description: `${e.type} - ${e.vehicle}`, amount: String(e.amount), expenseDate: e.date, baseAmount: String(e.amount) }).catch(() => {})
    setData((prev) => {
      const newExp: VehicleExpense = { ...e, id: prev.vehicleExpenses.length + 1 }
      const outbox = [...prev.outboxMessages, { id: prev.outboxMessages.length + 1, event: "ExpenseRecorded", status: "Pending", retries: 0, occurred: new Date().toISOString().slice(0, 16).replace("T", " "), error: null }]
      return { ...prev, vehicleExpenses: [...prev.vehicleExpenses, newExp], outboxMessages: outbox }
    })
    showToast(`${e.type} expense EGP ${e.amount.toFixed(2)} recorded`)
  }, [showToast])

  const addJournalLine = useCallback(() => {}, [])
  const updateJournalBalance = useCallback(() => ({ totalDebit: 0, totalCredit: 0 }), [])

  const submitJournalEntry = useCallback((desc: string, date: string, lines: JournalLine[]) => {
    const totalDebit = lines.reduce((s, l) => s + l.debit, 0)
    const totalCredit = lines.reduce((s, l) => s + l.credit, 0)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      showToast("Journal entry is not balanced", "error")
      return
    }
    api.createJournalEntry({ description: desc || "Manual entry", entryDate: date, lines }).catch(() => {})
    setData((prev) => {
      const jeNum = prev.nextJeNumber
      const newEntry: JournalEntry = {
        id: prev.journalEntries.length + 1, number: `JE-2024-${String(jeNum).padStart(5, "0")}`,
        date, desc: desc || "Manual entry", source: "Manual", debit: totalDebit, credit: totalCredit, reversed: false, lines,
      }
      return { ...prev, journalEntries: [newEntry, ...prev.journalEntries], nextJeNumber: jeNum + 1 }
    })
    showToast("Journal entry posted")
  }, [showToast])

  const reverseEntry = useCallback((id: number) => {
    setData((prev) => {
      const je = prev.journalEntries.find((j) => j.id === id)
      if (!je || je.reversed) { showToast("Cannot reverse this entry", "error"); return prev }
      const revLines = je.lines.map((l) => ({ account: l.account, debit: l.credit, credit: l.debit }))
      const jeNum = prev.nextJeNumber
      const revEntry: JournalEntry = {
        id: prev.journalEntries.length + 1, number: `JE-2024-${String(jeNum).padStart(5, "0")}`,
        date: new Date().toISOString().slice(0, 10), desc: `Reversal of ${je.number}`, source: "Reversal",
        debit: je.debit, credit: je.credit, reversed: false, lines: revLines,
      }
      return { ...prev, journalEntries: prev.journalEntries.map((j) => j.id === id ? { ...j, reversed: true } : j).concat([revEntry]), nextJeNumber: jeNum + 1 }
    })
    showToast("Reversal entry created", "warning")
  }, [showToast])

  const addAccount = useCallback((code: string, name: string, type: string) => {
    api.createAccount({ code, name, type, isActive: true }).catch(() => {})
    const nb = (type === "Asset" || type === "Expense") ? "Dr" : "Cr"
    setData((prev) => {
      const newAcc: CoaNode = { code, name, type, nb, children: [] }
      const parentCode = code.slice(0, -2) + "00"
      const addToTree = (nodes: CoaNode[]): CoaNode[] =>
        nodes.map((n) => {
          if (n.code === parentCode) return { ...n, children: [...n.children, newAcc] }
          if (n.children.length) return { ...n, children: addToTree(n.children) }
          return n
        })
      const hasParent = prev.chartOfAccounts.some((n) => {
        const find = (nodes: CoaNode[]): boolean => nodes.some((x) => x.code === parentCode || (x.children.length && find(x.children)))
        return find([n])
      })
      return { ...prev, chartOfAccounts: hasParent ? addToTree(prev.chartOfAccounts) : [...prev.chartOfAccounts, newAcc] }
    })
    showToast(`Account ${code} - ${name} created`)
  }, [showToast])

  const addUser = useCallback((u: { name: string; email: string; password: string; role: string }) => {
    api.createUser({ name: u.name, email: u.email, role: u.role }).catch(() => {})
    setData((prev) => {
      const newUser: User = {
        id: prev.users.length + 1, code: `USR-${String(prev.users.length + 1).padStart(3, "0")}`,
        name: u.name, email: u.email, role: u.role, lastLogin: null, isActive: true,
      }
      return { ...prev, users: [...prev.users, newUser] }
    })
    showToast(`User ${u.name} created as ${u.role}`)
  }, [showToast])

  const toggleLegActive = useCallback((id: number) => {
    setData((prev) => ({
      ...prev, legs: prev.legs.map((l) => l.id === id ? { ...l, isActive: !l.isActive } : l),
    }))
  }, [])

  const toggleDriverActive = useCallback((id: number) => {
    const d = data.drivers.find((x) => x.id === id)
    if (!d) return
    api.toggleDriverActive(d.dbId ?? String(d.id), String(d.code)).then((res) => {
      const mapped = dbDriverToMock(res.data as Record<string, unknown>)
      setData((prev) => ({ ...prev, drivers: prev.drivers.map((x) => x.id === id ? mapped : x) }))
    }).catch(() => {
      setData((prev) => ({ ...prev, drivers: prev.drivers.map((x) => x.id === id ? { ...x, isActive: !x.isActive } : x) }))
    })
    showToast(`${d.fullName} toggled`)
  }, [data.drivers, showToast])

  const deactivateUser = useCallback((id: number) => {
    setData((prev) => {
      const u = prev.users.find((x) => x.id === id)
      if (u) {
        api.deactivateUser(id.toString()).catch(() => {})
        showToast(`${u.name} deactivated`, "warning")
      }
      return { ...prev, users: prev.users.map((x) => x.id === id ? { ...x, isActive: false } : x) }
    })
  }, [showToast])

  return (
    <AppContext.Provider value={{
      data, loading, apiAvailable, currentPage, setPage, currentSubtitle, setCurrentSubtitle, sidebarOpen, toggleSidebar, toasts, showToast, removeToast,
      activeModal, openModal, closeModal,
      editingVehicle, editingDriver, editingVehicleType, setEditingVehicle, setEditingDriver, setEditingVehicleType,
      editingLicenseGrade, setEditingLicenseGrade,
      addLicenseGrade, updateLicenseGrade, deleteLicenseGrade,
      editingSupplier, setEditingSupplier,
      addSupplier, updateSupplier, deleteSupplier,
      addVehicleType, updateVehicleType, deleteVehicleType,
      addVehicle, updateVehicle, toggleVehicleActive, deactivateVehicle,
      addDriver, updateDriver, deleteDriver, fetchVehicleHistory,
      addTrip, changeTripStatus, addExpense,
      addJournalLine, updateJournalBalance, submitJournalEntry, reverseEntry,
      addAccount, addUser, deactivateUser, toggleLegActive, toggleDriverActive,
      pendingVehicleView, setPendingVehicleView,
      pendingDriverView, setPendingDriverView,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
