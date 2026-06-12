"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Modal } from "@/components/shared"
import { ar } from "@/lib/ar"
const l = ar.legs

export function LegsPage() {
  const { data, toggleLegActive } = useApp()
  const [pendingLegId, setPendingLegId] = useState<number | null>(null)
  const pendingLeg = pendingLegId != null ? data.legs.find((x) => x.id === pendingLegId) : null

  const handleToggle = () => {
    if (pendingLegId == null) return
    toggleLegActive(pendingLegId)
    setPendingLegId(null)
  }

  return (
    <div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-right p-4 font-medium">{l.name}</th>
              <th className="text-right p-4 font-medium">{l.origin}</th>
              <th className="text-right p-4 font-medium">{l.destination}</th>
              <th className="text-right p-4 font-medium">{l.distance}</th>
              <th className="text-right p-4 font-medium">{l.status}</th>
              <th className="text-right p-4 font-medium">{l.actions}</th>
            </tr>
          </thead>
          <tbody>
            {data.legs.map((leg) => (
              <tr key={leg.id} className="data-row border-b border-border/50">
                <td className="p-4 text-fg font-medium">{leg.name}</td>
                <td className="p-4 text-muted">{leg.origin}</td>
                <td className="p-4 text-muted">{leg.destination}</td>
                <td className="p-4 text-muted font-mono">{leg.distanceKm}</td>
                <td className="p-4">
                  <span className={`status-badge ${leg.isActive ? "bg-successDim text-success" : "bg-dangerDim text-danger"}`}>
                    {leg.isActive ? l.active : l.inactive}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${leg.isActive ? "bg-success" : "bg-border"}`}
                    onClick={() => setPendingLegId(leg.id)}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${leg.isActive ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingLeg && (
        <Modal id="toggleLegConfirm" title={l.toggleConfirmTitle} width="w-[400px]">
          <p className="text-sm text-muted mb-6">
            {pendingLeg.isActive ? l.toggleDeactivateMsg : l.toggleActivateMsg}
            <br />
            <span className="text-fg font-semibold">{pendingLeg.name}</span>
          </p>
          <div className="flex justify-end gap-3">
            <button className="btn-ghost px-4 py-2 rounded-lg text-sm" onClick={() => setPendingLegId(null)}>
              {l.cancel}
            </button>
            <button className="btn-primary px-4 py-2 rounded-lg text-sm" onClick={handleToggle}>
              {l.confirm}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
