"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { StatusBadge } from "@/components/shared"

export function FleetPage() {
  const { data, openModal, toggleVehicleActive, fetchVehicleHistory, deleteDriver, deleteVehicleType, setEditingVehicle, setEditingDriver, setEditingVehicleType } = useApp()
  const [fleetTab, setFleetTab] = useState<"vehicles" | "drivers" | "types">("vehicles")
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  const selectedVehicle = selectedVehicleId != null ? data.vehicles.find((v) => v.id === selectedVehicleId) : null
  const history = selectedVehicleId != null ? data.vehicleHistory[selectedVehicleId] || [] : []

  const handleVehicleClick = async (id: number) => {
    if (selectedVehicleId === id) { setSelectedVehicleId(null); return }
    setSelectedVehicleId(id)
    setHistoryLoading(true)
    await fetchVehicleHistory(id)
    setHistoryLoading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          <button
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${fleetTab === "vehicles" ? "active" : "text-muted"}`}
            onClick={() => { setFleetTab("vehicles"); setSelectedVehicleId(null) }}
          >Vehicles</button>
          <button
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${fleetTab === "drivers" ? "active" : "text-muted"}`}
            onClick={() => { setFleetTab("drivers"); setSelectedVehicleId(null) }}
          >Drivers</button>
          <button
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${fleetTab === "types" ? "active" : "text-muted"}`}
            onClick={() => { setFleetTab("types"); setSelectedVehicleId(null) }}
          >Types</button>
        </div>
        <button
          className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          onClick={() => openModal(fleetTab === "vehicles" ? "addVehicleModal" : fleetTab === "drivers" ? "addDriverModal" : "addVehicleTypeModal")}
        >
          <i className="fa-solid fa-plus text-xs"></i> Add {fleetTab === "vehicles" ? "Vehicle" : fleetTab === "drivers" ? "Driver" : "Type"}
        </button>
      </div>

      {fleetTab === "vehicles" && (
        <div className="grid grid-cols-1 gap-4" style={selectedVehicleId != null ? { gridTemplateColumns: "1fr 1fr" } : {}}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                <th className="text-left p-4 font-medium">Code</th><th className="text-left p-4 font-medium">Plate</th><th className="text-left p-4 font-medium">Model</th><th className="text-left p-4 font-medium">Year</th><th className="text-left p-4 font-medium">Capacity</th><th className="text-left p-4 font-medium">Type</th><th className="text-left p-4 font-medium">Driver</th><th className="text-left p-4 font-medium">Status</th><th className="text-right p-4 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {data.vehicles.map((v) => (
                  <tr key={v.id} className={`data-row border-b border-border/50 cursor-pointer ${selectedVehicleId === v.id ? "bg-accent/5" : ""}`} onClick={() => handleVehicleClick(v.id)}>
                    <td className="p-4 font-mono text-xs text-muted">{v.code}</td>
                    <td className="p-4 font-mono font-semibold text-accent">{v.plateNumber}</td>
                    <td className="p-4 text-fg">{v.model}</td>
                    <td className="p-4 text-muted">{v.year}</td>
                    <td className="p-4 text-muted">{v.capacity} tons</td>
                    <td className="p-4 text-muted">{v.vehicleType}</td>
                    <td className="p-4 text-muted text-xs">{v.driverName || "—"}</td>
                    <td className="p-4"><StatusBadge status={v.status} /></td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="text-muted hover:text-accent transition-colors mr-2" title="Toggle Active" onClick={() => toggleVehicleActive(v.id)}><i className="fa-solid fa-power-off text-xs"></i></button>
                      <button className="text-muted hover:text-accent transition-colors mr-2" title="Edit" onClick={() => { setEditingVehicle(v); openModal("editVehicleModal") }}><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedVehicle && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold">{selectedVehicle.plateNumber} — Details</h3>
                <p className="text-xs text-muted mt-1">{selectedVehicle.model}</p>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted">Code:</span> <span className="font-mono">{selectedVehicle.code}</span></div>
                  <div><span className="text-muted">Plate:</span> <span className="font-mono">{selectedVehicle.plateNumber}</span></div>
                  <div><span className="text-muted">Year:</span> {selectedVehicle.year}</div>
                  <div><span className="text-muted">Capacity:</span> {selectedVehicle.capacity} tons</div>
                  <div><span className="text-muted">Type:</span> {selectedVehicle.vehicleType}</div>
                  <div><span className="text-muted">Driver:</span> {selectedVehicle.driverName || "Unassigned"}</div>
                  <div><span className="text-muted">Status:</span> <StatusBadge status={selectedVehicle.status} /></div>
                </div>
              </div>
              <div className="border-t border-border">
                <div className="p-3 bg-surface/30 text-xs font-medium text-muted border-b border-border">History</div>
                {historyLoading ? (
                  <div className="p-4 text-center text-muted text-xs">Loading...</div>
                ) : history.length === 0 ? (
                  <div className="p-4 text-center text-muted text-xs">No history entries</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                        <th className="text-left p-2 font-medium">Date</th><th className="text-left p-2 font-medium">Plate</th><th className="text-left p-2 font-medium">Active</th>
                      </tr></thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.id} className="border-b border-border/50">
                            <td className="p-2 text-muted font-mono">{new Date(h.modifiedAt).toLocaleDateString()}</td>
                            <td className="p-2 font-mono">{h.plateNumber}</td>
                            <td className="p-2">{h.isActive != null ? <StatusBadge status={h.isActive ? "Active" : "Inactive"} /> : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
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
                    <button className="text-muted hover:text-accent transition-colors mr-2" title="Edit" onClick={() => { setEditingDriver(d); openModal("editDriverModal") }}><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    <button className="text-muted hover:text-accent transition-colors mr-2" title="Delete" onClick={() => deleteDriver(d.id)}><i className="fa-solid fa-trash-can text-xs"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fleetTab === "types" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">Code</th><th className="text-left p-4 font-medium">Name</th><th className="text-left p-4 font-medium">Model</th><th className="text-left p-4 font-medium">Model Code</th><th className="text-right p-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {data.vehicleTypes.map((vt) => (
                <tr key={vt.id} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono text-xs text-muted">{vt.code}</td>
                  <td className="p-4 text-fg font-medium">{vt.name}</td>
                  <td className="p-4 text-muted">{vt.model}</td>
                  <td className="p-4 text-muted font-mono text-xs">{vt.modelCode}</td>
                  <td className="p-4 text-right">
                    <button className="text-muted hover:text-accent transition-colors mr-2" title="Edit" onClick={() => { setEditingVehicleType(vt); openModal("editVehicleTypeModal") }}><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    <button className="text-muted hover:text-accent transition-colors mr-2" title="Delete" onClick={() => deleteVehicleType(vt.id)}><i className="fa-solid fa-trash-can text-xs"></i></button>
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
