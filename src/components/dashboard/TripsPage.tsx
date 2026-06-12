"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { fmt } from "@/lib/store"
import { StatusBadge } from "@/components/shared"
import { ar } from "@/lib/ar"

export function TripsPage() {
  const { data, changeTripStatus, openModal } = useApp()
  const t = ar.trips
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const statusLabel: Record<string, string> = {
    Pending: ar.statusBadge.pending,
    InProgress: ar.statusBadge.inProgress,
    Completed: ar.statusBadge.completed,
    Cancelled: ar.statusBadge.cancelled,
  }

  const filtered = data.trips.filter((trip) => {
    if (statusFilter && trip.status !== statusFilter) return false
    if (dateFilter && trip.date !== dateFilter) return false
    return true
  })

  const counts = { Pending: 0, InProgress: 0, Completed: 0, Cancelled: 0 }
  data.trips.forEach((trip) => { if (trip.status in counts) counts[trip.status as keyof typeof counts]++ })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          <select className="!w-auto text-sm !py-1.5 !px-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">{t.allStatuses}</option>
            <option value="Pending">{t.pending}</option>
            <option value="InProgress">{t.inProgress}</option>
            <option value="Completed">{t.completed}</option>
            <option value="Cancelled">{t.cancelled}</option>
          </select>
          <input type="date" className="!w-auto text-sm !py-1.5" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2" onClick={() => openModal("addTripModal")}>
          <i className="fa-solid fa-plus text-xs"></i> {t.newTrip}
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <i className="fa-solid fa-diagram-project text-accent text-xs"></i>
          <h3 className="font-display font-semibold text-fg text-sm">{t.orderWorkflow}</h3>
        </div>
        <div className="flex items-center justify-center gap-3">
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <div className="workflow-node bg-surface border border-border rounded-lg px-5 py-3 text-center">
                <p className="text-xs text-muted mb-1">{statusLabel[status]}</p>
                <p className={`text-lg font-bold ${status === "Completed" ? "text-success" : status === "Cancelled" ? "text-danger" : "text-fg"}`}>
                  {count}
                </p>
              </div>
              {status !== "Cancelled" && <i className="fa-solid fa-arrow-right text-borderLight text-xs"></i>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
            <th className="text-left p-4 font-medium">{t.id}</th><th className="text-left p-4 font-medium">{t.route}</th><th className="text-left p-4 font-medium">{t.customer}</th><th className="text-left p-4 font-medium">{t.vehicle}</th><th className="text-left p-4 font-medium">{t.date}</th><th className="text-right p-4 font-medium">{t.salePrice}</th><th className="text-left p-4 font-medium">{t.status}</th><th className="text-right p-4 font-medium">{t.actions}</th>
          </tr></thead>
          <tbody>
            {filtered.map((trip) => (
              <tr key={trip.id} className="data-row border-b border-border/50">
                <td className="p-4 font-mono text-accent text-xs">#{trip.id}</td>
                <td className="p-4 text-fg">{trip.from} → {trip.to}</td>
                <td className="p-4 text-muted">{trip.customer}</td>
                <td className="p-4 text-muted font-mono text-xs">{trip.vehicle}</td>
                <td className="p-4 text-muted text-xs">{trip.date}</td>
                <td className="p-4 text-right font-mono">EGP {fmt(trip.priceBase)}</td>
                <td className="p-4"><StatusBadge status={trip.status} /></td>
                <td className="p-4 text-right">
                  {trip.status === "Pending" && (
                    <>
                      <button className="text-xs text-success hover:underline mr-2" onClick={() => changeTripStatus(trip.id, "InProgress")}>{t.start}</button>
                      <button className="text-xs text-danger hover:underline" onClick={() => changeTripStatus(trip.id, "Cancelled")}>{t.cancel}</button>
                    </>
                  )}
                  {trip.status === "InProgress" && (
                    <button className="text-xs text-success hover:underline" onClick={() => changeTripStatus(trip.id, "Completed")}>{t.complete}</button>
                  )}
                  {trip.status !== "Pending" && trip.status !== "InProgress" && <span className="text-xs text-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
