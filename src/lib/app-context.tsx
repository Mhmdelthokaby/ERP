"use client"

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react"
import {
  defaultData, type AppData, type Vehicle, type Trip,
  type VehicleExpense, type JournalEntry, type JournalLine,
  type User, type PageName, type CoaNode,
} from "./store"
import { api } from "./api"

interface Toast { id: number; message: string; type: "success" | "error" | "info" | "warning" }

interface AppContextType {
  data: AppData
  loading: boolean
  apiAvailable: boolean
  currentPage: PageName
  setPage: (p: PageName) => void
  toasts: Toast[]
  showToast: (message: string, type?: Toast["type"]) => void
  removeToast: (id: number) => void
  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
  addVehicle: (v: Omit<Vehicle, "id" | "status">) => void
  deactivateVehicle: (id: number) => void
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
}

const AppContext = createContext<AppContextType | null>(null)

function dbVehicleToMock(v: Record<string, unknown>): Vehicle {
  return { id: parseInt(String(v.id)?.slice(0, 8) || "0", 16) || Math.random(), code: String(v.code || ""), plateNumber: String(v.plateNumber), model: `${String(v.brand)} ${String(v.model)}`, year: Number(v.year), capacity: Number(v.capacity), status: String(v.isActive) === "true" ? "Active" : "Inactive", vehicleType: "" }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData)
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [toastId, setToastId] = useState(0)
  const [loading, setLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(false)

  useEffect(() => {
    Promise.all([
      api.getVehicles().catch(() => null),
      api.getDrivers().catch(() => null),
      api.getOrders().catch(() => null),
      api.getExpenses().catch(() => null),
      api.getJournalEntries().catch(() => null),
      api.getChartOfAccounts().catch(() => null),
      api.getFiscalPeriods().catch(() => null),
      api.getUsers().catch(() => null),
      api.getOutboxMessages().catch(() => null),
      api.getAuditLogs().catch(() => null),
    ]).then(([vehiclesRes, driversRes, ordersRes, expensesRes, journalRes, coaRes, periodsRes, usersRes, outboxRes, auditRes]) => {
      const allOk = [vehiclesRes, driversRes, ordersRes, expensesRes, journalRes, coaRes, periodsRes, usersRes, outboxRes, auditRes].every(Boolean)
      if (!allOk) {
        setLoading(false)
        return
      }
      setApiAvailable(true)
      setData((prev) => ({
        ...prev,
        vehicles: vehiclesRes!.data.map((v) => dbVehicleToMock(v as Record<string, unknown>)),
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
  const setPage = useCallback((p: PageName) => setCurrentPage(p), [])

  const addVehicle = useCallback((v: Omit<Vehicle, "id" | "status">) => {
    api.createVehicle({ ...v, brand: v.model.split(" ")[0] || v.model, isActive: true }).catch(() => {})
    setData((prev) => ({ ...prev, vehicles: [...prev.vehicles, { ...v, id: prev.vehicles.length + 1, status: "Active" }] }))
    showToast(`Vehicle ${v.plateNumber} added`)
  }, [showToast])

  const deactivateVehicle = useCallback((id: number) => {
    const v = data.vehicles.find((x) => x.id === id)
    if (!v) return
    api.updateVehicle(id.toString(), { isActive: false }).catch(() => {})
    setData((prev) => ({ ...prev, vehicles: prev.vehicles.map((v) => v.id === id ? { ...v, status: "Inactive" } : v) }))
    showToast(`${v.plateNumber} deactivated`, "warning")
  }, [data.vehicles, showToast])

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
      data, loading, apiAvailable, currentPage, setPage, toasts, showToast, removeToast,
      activeModal, openModal, closeModal,
      addVehicle, deactivateVehicle, addTrip, changeTripStatus, addExpense,
      addJournalLine, updateJournalBalance, submitJournalEntry, reverseEntry,
      addAccount, addUser, deactivateUser,
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
