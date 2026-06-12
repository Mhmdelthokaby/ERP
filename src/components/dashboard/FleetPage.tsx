"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { StatusBadge } from "@/components/shared"

export function FleetPage() {
  const { data, openModal } = useApp()
  const [fleetTab, setFleetTab] = useState<"vehicles" | "drivers">("vehicles")

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          <button
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${fleetTab === "vehicles" ? "active" : "text-muted"}`}
            onClick={() => setFleetTab("vehicles")}
          >Vehicles</button>
          <button
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${fleetTab === "drivers" ? "active" : "text-muted"}`}
            onClick={() => setFleetTab("drivers")}
          >Drivers</button>
        </div>
        <button
          className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          onClick={() => openModal("addVehicleModal")}
        >
          <i className="fa-solid fa-plus text-xs"></i> Add Vehicle
        </button>
      </div>

      {fleetTab === "vehicles" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">Code</th><th className="text-left p-4 font-medium">Plate</th><th className="text-left p-4 font-medium">Model</th><th className="text-left p-4 font-medium">Year</th><th className="text-left p-4 font-medium">Capacity</th><th className="text-left p-4 font-medium">Type</th><th className="text-left p-4 font-medium">Status</th><th className="text-right p-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {data.vehicles.map((v) => (
                <tr key={v.id} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono text-xs text-muted">{v.code}</td>
                  <td className="p-4 font-mono font-semibold text-accent">{v.plateNumber}</td>
                  <td className="p-4 text-fg">{v.model}</td>
                  <td className="p-4 text-muted">{v.year}</td>
                  <td className="p-4 text-muted">{v.capacity} tons</td>
                  <td className="p-4 text-muted">{v.vehicleType}</td>
                  <td className="p-4"><StatusBadge status={v.status} /></td>
                  <td className="p-4 text-right">
                    <button className="text-muted hover:text-accent transition-colors mr-2" title="Edit"><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    <button className="text-muted hover:text-danger transition-colors" title="Deactivate"><i className="fa-solid fa-ban text-xs"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fleetTab === "drivers" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">Code</th><th className="text-left p-4 font-medium">Full Name</th><th className="text-left p-4 font-medium">Phone</th><th className="text-left p-4 font-medium">National ID</th><th className="text-left p-4 font-medium">License Grade</th><th className="text-left p-4 font-medium">Status</th><th className="text-right p-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {data.drivers.map((d) => (
                <tr key={d.id} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono text-xs text-muted">{d.code}</td>
                  <td className="p-4 text-fg font-medium">{d.fullName}</td>
                  <td className="p-4 text-muted font-mono text-xs">{d.phone}</td>
                  <td className="p-4 text-muted font-mono text-xs">{d.nationalId}</td>
                  <td className="p-4 text-muted font-mono text-xs">{d.licenseGrade}</td>
                  <td className="p-4">{d.isActive ? <StatusBadge status="Active" /> : <StatusBadge status="Inactive" />}</td>
                  <td className="p-4 text-right">
                    <button className="text-muted hover:text-accent transition-colors mr-2"><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    <button className="text-muted hover:text-danger transition-colors"><i className="fa-solid fa-ban text-xs"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
