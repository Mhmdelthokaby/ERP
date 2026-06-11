"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { fmt } from "@/lib/store"
import { StatusBadge } from "@/components/shared"

export function TripsPage() {
  const { data, changeTripStatus, openModal } = useApp()
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const filtered = data.trips.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false
    if (dateFilter && t.date !== dateFilter) return false
    return true
  })

  const counts = { Pending: 0, InProgress: 0, Completed: 0, Cancelled: 0 }
  data.trips.forEach((t) => { if (t.status in counts) counts[t.status as keyof typeof counts]++ })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          <select className="!w-auto text-sm !py-1.5 !px-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input type="date" className="!w-auto text-sm !py-1.5" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2" onClick={() => openModal("addTripModal")}>
          <i className="fa-solid fa-plus text-xs"></i> New Trip
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <i className="fa-solid fa-diagram-project text-accent text-xs"></i>
          <h3 className="font-display font-semibold text-fg text-sm">Order Workflow</h3>
        </div>
        <div className="flex items-center justify-center gap-3">
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <div className="workflow-node bg-surface border border-border rounded-lg px-5 py-3 text-center">
                <p className="text-xs text-muted mb-1">{status === "InProgress" ? "In Progress" : status}</p>
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
            <th className="text-left p-4 font-medium">ID</th><th className="text-left p-4 font-medium">Route</th><th className="text-left p-4 font-medium">Customer</th><th className="text-left p-4 font-medium">Vehicle</th><th className="text-left p-4 font-medium">Date</th><th className="text-right p-4 font-medium">Sale Price</th><th className="text-left p-4 font-medium">Status</th><th className="text-right p-4 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="data-row border-b border-border/50">
                <td className="p-4 font-mono text-accent text-xs">#{t.id}</td>
                <td className="p-4 text-fg">{t.from} → {t.to}</td>
                <td className="p-4 text-muted">{t.customer}</td>
                <td className="p-4 text-muted font-mono text-xs">{t.vehicle}</td>
                <td className="p-4 text-muted text-xs">{t.date}</td>
                <td className="p-4 text-right font-mono">EGP {fmt(t.priceBase)}</td>
                <td className="p-4"><StatusBadge status={t.status} /></td>
                <td className="p-4 text-right">
                  {t.status === "Pending" && (
                    <>
                      <button className="text-xs text-success hover:underline mr-2" onClick={() => changeTripStatus(t.id, "InProgress")}>Start</button>
                      <button className="text-xs text-danger hover:underline" onClick={() => changeTripStatus(t.id, "Cancelled")}>Cancel</button>
                    </>
                  )}
                  {t.status === "InProgress" && (
                    <button className="text-xs text-success hover:underline" onClick={() => changeTripStatus(t.id, "Completed")}>Complete</button>
                  )}
                  {t.status !== "Pending" && t.status !== "InProgress" && <span className="text-xs text-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
