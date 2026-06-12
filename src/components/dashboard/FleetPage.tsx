"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { StatusBadge } from "@/components/shared"
import { ar } from "@/lib/ar"
const f = ar.fleet

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
          >{f.vehicles}</button>
          <button
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${fleetTab === "drivers" ? "active" : "text-muted"}`}
            onClick={() => { setFleetTab("drivers"); setSelectedVehicleId(null) }}
          >{f.drivers}</button>
          <button
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${fleetTab === "types" ? "active" : "text-muted"}`}
            onClick={() => { setFleetTab("types"); setSelectedVehicleId(null) }}
          >{f.types}</button>
        </div>
        <button
          className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          onClick={() => openModal(fleetTab === "vehicles" ? "addVehicleModal" : fleetTab === "drivers" ? "addDriverModal" : "addVehicleTypeModal")}
        >
          <i className="fa-solid fa-plus text-xs"></i> {fleetTab === "vehicles" ? f.addVehicle : fleetTab === "drivers" ? f.addDriver : f.addType}
        </button>
      </div>

      {fleetTab === "vehicles" && (
        <div className="grid grid-cols-1 gap-4" style={selectedVehicleId != null ? { gridTemplateColumns: "1fr 1fr" } : {}}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                <th className="text-left p-4 font-medium">{f.code}</th><th className="text-left p-4 font-medium">{f.plate}</th><th className="text-left p-4 font-medium">{f.model}</th><th className="text-left p-4 font-medium">{f.year}</th><th className="text-left p-4 font-medium">{f.capacity}</th><th className="text-left p-4 font-medium">{f.type}</th><th className="text-left p-4 font-medium">{f.driver}</th><th className="text-left p-4 font-medium">{f.status}</th><th className="text-right p-4 font-medium">{f.actions}</th>
              </tr></thead>
              <tbody>
                {data.vehicles.map((v) => (
                  <tr key={v.id} className={`data-row border-b border-border/50 cursor-pointer ${selectedVehicleId === v.id ? "bg-accent/5" : ""}`} onClick={() => handleVehicleClick(v.id)}>
                    <td className="p-4 font-mono text-xs text-muted">{v.code}</td>
                    <td className="p-4 font-mono font-semibold text-accent">{v.plateNumber}</td>
                    <td className="p-4 text-fg">{v.model}</td>
                    <td className="p-4 text-muted">{v.year}</td>
                    <td className="p-4 text-muted">{v.capacity} {f.capacityUnit}</td>
                    <td className="p-4 text-muted">{v.vehicleType}</td>
                    <td className="p-4 text-muted text-xs">{v.driverName || "—"}</td>
                    <td className="p-4"><StatusBadge status={v.status} /></td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="text-muted hover:text-accent transition-colors mr-2" title={f.toggleActive} onClick={() => toggleVehicleActive(v.id)}><i className="fa-solid fa-power-off text-xs"></i></button>
                      <button className="text-muted hover:text-accent transition-colors mr-2" title={f.edit} onClick={() => { setEditingVehicle(v); openModal("editVehicleModal") }}><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedVehicle && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold">{selectedVehicle.plateNumber} — {f.details}</h3>
                <p className="text-xs text-muted mt-1">{selectedVehicle.model}</p>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted">{f.codeLabel}</span> <span className="font-mono">{selectedVehicle.code}</span></div>
                  <div><span className="text-muted">{f.plateLabel}</span> <span className="font-mono">{selectedVehicle.plateNumber}</span></div>
                  <div><span className="text-muted">{f.yearLabel}</span> {selectedVehicle.year}</div>
                  <div><span className="text-muted">{f.capacityLabel}</span> {selectedVehicle.capacity} {f.capacityUnit}</div>
                  <div><span className="text-muted">{f.typeLabel}</span> {selectedVehicle.vehicleType}</div>
                  <div><span className="text-muted">{f.driverLabel}</span> {selectedVehicle.driverName || f.unassigned}</div>
                  <div><span className="text-muted">{f.statusLabel}</span> <StatusBadge status={selectedVehicle.status} /></div>
                </div>
              </div>
              <div className="border-t border-border">
                <div className="p-3 bg-surface/30 text-xs font-medium text-muted border-b border-border">{f.history}</div>
                {historyLoading ? (
                  <div className="p-4 text-center text-muted text-xs">{f.loading}</div>
                ) : history.length === 0 ? (
                  <div className="p-4 text-center text-muted text-xs">{f.noHistory}</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                        <th className="text-left p-2 font-medium">{f.date}</th><th className="text-left p-2 font-medium">{f.plateCol}</th><th className="text-left p-2 font-medium">{f.active}</th>
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
              <th className="text-left p-4 font-medium">{f.code}</th><th className="text-left p-4 font-medium">{f.fullName}</th><th className="text-left p-4 font-medium">{f.phone}</th><th className="text-left p-4 font-medium">{f.nationalId}</th><th className="text-left p-4 font-medium">{f.licenseGrade}</th><th className="text-left p-4 font-medium">{f.status}</th><th className="text-right p-4 font-medium">{f.actions}</th>
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
                    <button className="text-muted hover:text-accent transition-colors mr-2" title={f.edit} onClick={() => { setEditingDriver(d); openModal("editDriverModal") }}><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    <button className="text-muted hover:text-accent transition-colors mr-2" title={f.delete} onClick={() => deleteDriver(d.id)}><i className="fa-solid fa-trash-can text-xs"></i></button>
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
              <th className="text-left p-4 font-medium">{f.code}</th><th className="text-left p-4 font-medium">{f.name}</th><th className="text-left p-4 font-medium">{f.model}</th><th className="text-left p-4 font-medium">{f.modelCode}</th><th className="text-right p-4 font-medium">{f.actions}</th>
            </tr></thead>
            <tbody>
              {data.vehicleTypes.map((vt) => (
                <tr key={vt.id} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono text-xs text-muted">{vt.code}</td>
                  <td className="p-4 text-fg font-medium">{vt.name}</td>
                  <td className="p-4 text-muted">{vt.model}</td>
                  <td className="p-4 text-muted font-mono text-xs">{vt.modelCode}</td>
                  <td className="p-4 text-right">
                    <button className="text-muted hover:text-accent transition-colors mr-2" title={f.edit} onClick={() => { setEditingVehicleType(vt); openModal("editVehicleTypeModal") }}><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    <button className="text-muted hover:text-accent transition-colors mr-2" title={f.delete} onClick={() => deleteVehicleType(vt.id)}><i className="fa-solid fa-trash-can text-xs"></i></button>
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
