"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Modal } from "@/components/shared"
import { ar } from "@/lib/ar"
const f = ar.fleet

export function FleetPage() {
  const { data, openModal, closeModal, toggleVehicleActive, fetchVehicleHistory, deleteVehicleType, setEditingVehicle, setEditingVehicleType, pendingVehicleView, setPendingVehicleView, setCurrentSubtitle, toggleSidebar, sidebarOpen } = useApp()
  const [fleetTab, setFleetTab] = useState<"vehicles" | "types">("vehicles")
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterModel, setFilterModel] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterExpiry, setFilterExpiry] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    setCurrentSubtitle(`/ ${fleetTab === "vehicles" ? f.vehicles : f.types}`)
  }, [fleetTab, setCurrentSubtitle])

  useEffect(() => {
    if (sidebarOpen && selectedVehicleId != null) setSelectedVehicleId(null)
  }, [sidebarOpen])

  useEffect(() => {
    if (pendingVehicleView != null) {
      setSelectedVehicleId(pendingVehicleView)
      setFleetTab("vehicles")
      setPendingVehicleView(null)
    }
  }, [pendingVehicleView])

  const selectedVehicle = selectedVehicleId != null ? data.vehicles.find((v) => v.id === selectedVehicleId) : null
  const history = selectedVehicleId != null ? data.vehicleHistory[selectedVehicleId] || [] : []
  const [pendingToggleId, setPendingToggleId] = useState<number | null>(null)
  const pendingVehicle = pendingToggleId != null ? data.vehicles.find((v) => v.id === pendingToggleId) : null

  const filteredVehicles = data.vehicles.filter((v) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const match = String(v.code).includes(q) || v.plateNumber.toLowerCase().includes(q) || (v.chassisNumber || "").toLowerCase().includes(q) || (v.engineNumber || "").toLowerCase().includes(q)
      if (!match) return false
    }
    if (filterModel && v.model !== filterModel) return false
    if (filterYear && String(v.year) !== filterYear) return false
    if (filterExpiry && (!v.licenseExpiryDate || v.licenseExpiryDate > filterExpiry)) return false
    if (filterStatus) {
      if (filterStatus === "active" && v.status !== "Active") return false
      if (filterStatus === "inactive" && v.status !== "Inactive") return false
    }
    return true
  })

  const handleToggle = () => {
    if (pendingToggleId == null) return
    toggleVehicleActive(pendingToggleId)
    setPendingToggleId(null)
    closeModal()
  }

  const openToggleConfirm = (id: number) => {
    setPendingToggleId(id)
    openModal("toggleVehicleConfirm")
  }

  const closeToggleConfirm = () => {
    setPendingToggleId(null)
    closeModal()
  }

  const handleVehicleClick = async (id: number) => {
    if (selectedVehicleId === id) { setSelectedVehicleId(null); return }
    setSelectedVehicleId(id)
    if (sidebarOpen) toggleSidebar()
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
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${fleetTab === "types" ? "active" : "text-muted"}`}
            onClick={() => { setFleetTab("types"); setSelectedVehicleId(null) }}
          >{f.types}</button>
        </div>
        <button
          className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          onClick={() => openModal(fleetTab === "vehicles" ? "addVehicleModal" : "addVehicleTypeModal")}
        >
          <i className="fa-solid fa-plus text-xs"></i> {fleetTab === "vehicles" ? f.addVehicle : f.addType}
        </button>
      </div>

      {fleetTab === "vehicles" && (
        <>
        <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <input type="text" placeholder={f.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)}>
              <option value="">{f.model}: {f.allModels}</option>
              {data.vehicleTypes.map((vt) => (
                <option key={vt.id} value={`${vt.code} - ${vt.model}`}>{vt.name} ({vt.model})</option>
              ))}
            </select>
            <div><label className="text-xs text-muted mb-1 block">موديل السنة</label><input type="number" placeholder="السنة..." value={filterYear} onChange={(e) => setFilterYear(e.target.value)} /></div>
            <div><label className="text-xs text-muted mb-1 block">{f.licenseExpiry}</label><input type="date" value={filterExpiry} onChange={(e) => setFilterExpiry(e.target.value)} /></div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">{f.status}: {f.allStatuses}</option>
              <option value="active">{f.active}</option>
              <option value="inactive">{f.inactive}</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4" style={selectedVehicleId != null ? { gridTemplateColumns: "1fr 1fr" } : {}}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                <th className="text-left p-4 font-medium">{f.code}</th><th className="text-left p-4 font-medium">{f.plate}</th><th className="text-left p-4 font-medium">{f.model}</th><th className="text-left p-4 font-medium">{f.year}</th><th className="text-left p-4 font-medium">{f.capacity}</th><th className="text-left p-4 font-medium">{f.driver}</th><th className="text-left p-4 font-medium">{f.status}</th><th className="text-right p-4 font-medium">{f.actions}</th>
              </tr></thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className={`data-row border-b border-border/50 cursor-pointer ${selectedVehicleId === v.id ? "bg-accent/5" : ""}`} onClick={() => handleVehicleClick(v.id)}>
                    <td className="p-4 font-mono text-xs text-muted">{v.code}</td>
                    <td className="p-4 font-mono font-semibold text-accent">{v.plateNumber}</td>
                    <td className="p-4 text-fg">{v.model}</td>
                    <td className="p-4 text-muted">{v.year}</td>
                    <td className="p-4 text-muted">{v.capacity}</td>
                    <td className="p-4 text-muted text-xs">{v.driverName || "—"}</td>
                    <td className="p-4">
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${v.status === "Active" ? "bg-success" : "bg-danger"}`}
                        onClick={(e) => { e.stopPropagation(); openToggleConfirm(v.id) }}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${v.status === "Active" ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="text-muted hover:text-accent transition-colors mr-2" title={f.edit} onClick={() => { setEditingVehicle(v); openModal("editVehicleModal") }}><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedVehicle && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{selectedVehicle.plateNumber} — {f.details}</h3>
                  <p className="text-xs text-muted mt-1">{selectedVehicle.model}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-muted hover:text-accent transition-colors" title={f.edit} onClick={() => { setEditingVehicle(selectedVehicle); openModal("editVehicleModal") }}>
                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                  <button className="text-muted hover:text-fg transition-colors" onClick={() => setSelectedVehicleId(null)} title="إغلاق">
                    <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div><span className="text-muted">{f.codeLabel}</span> <span className="font-mono">{selectedVehicle.code}</span></div>
                  <div><span className="text-muted">{f.plateLabel}</span> <span className="font-mono">{selectedVehicle.plateNumber}</span></div>
                  <div><span className="text-muted">{f.chassisNumber}:</span> <span className="font-mono">{selectedVehicle.chassisNumber || "—"}</span></div>
                  <div><span className="text-muted">{f.engineNumber}:</span> <span className="font-mono">{selectedVehicle.engineNumber || "—"}</span></div>
                  <div><span className="text-muted">{f.model}:</span> {selectedVehicle.model}</div>
                  <div><span className="text-muted">{f.gps}:</span> <span className={selectedVehicle.hasGps ? "text-success" : "text-muted"}>{selectedVehicle.hasGps ? f.gpsFound : f.gpsNotFound}</span></div>
                  <div><span className="text-muted">{f.yearLabel}</span> {selectedVehicle.year}</div>
                  <div><span className="text-muted">{f.capacityLabel}</span> {selectedVehicle.capacity} {f.capacityUnit}</div>
                  <div><span className="text-muted">{f.ownerName}:</span> {selectedVehicle.ownerName || "—"}</div>
                  <div><span className="text-muted">{f.licenseDate}:</span> {selectedVehicle.licenseDate || "—"}</div>
                  <div><span className="text-muted">{f.licenseExpiry}:</span> {selectedVehicle.licenseExpiryDate || "—"}</div>
                  <div><span className="text-muted">{f.licenseTypeLabel}:</span> {selectedVehicle.licenseType || "—"}</div>
                  <div><span className="text-muted">{f.purchaseDate}:</span> {selectedVehicle.purchaseDate || "—"}</div>
                  <div><span className="text-muted">{f.driverLabel}</span> {selectedVehicle.driverName || f.unassigned}</div>
                  <div><span className="text-muted">{f.statusLabel}</span>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors align-middle mr-2 ${selectedVehicle.status === "Active" ? "bg-success" : "bg-danger"}`}
                      onClick={() => openToggleConfirm(selectedVehicle.id)}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${selectedVehicle.status === "Active" ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-t border-border">
                <div className="p-3 bg-surface/30 text-xs font-medium text-muted border-b border-border">{f.history}</div>
                {historyLoading ? (
                  <div className="p-4 text-center text-muted text-xs">{f.loading}</div>
                ) : history.length === 0 ? (
                  <div className="p-4 text-center text-muted text-xs">{f.noHistory}</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto scrollbar-light">
                    <table className="w-full text-xs">
                      <thead><tr className="text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                        <th className="text-left p-2 font-medium">{f.date}</th><th className="text-left p-2 font-medium">{f.plateCol}</th><th className="text-left p-2 font-medium">{f.engineNumber}</th><th className="text-left p-2 font-medium">{f.licenseDate}</th><th className="text-left p-2 font-medium">{f.licenseExpiry}</th><th className="text-left p-2 font-medium">{f.licenseTypeLabel}</th><th className="text-left p-2 font-medium">{f.active}</th><th className="text-left p-2 font-medium">{f.ownerName}</th>
                      </tr></thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.id} className="border-b border-border/50">
                            <td className="p-2 text-muted font-mono">{new Date(h.modifiedAt).toLocaleDateString()}</td>
                            <td className="p-2 font-mono">{h.plateNumber}</td>
                            <td className="p-2 font-mono">{h.engineNumber || "—"}</td>
                            <td className="p-2">{h.licenseDate || "—"}</td>
                            <td className="p-2">{h.licenseExpiryDate || "—"}</td>
                            <td className="p-2">{h.licenseType || "—"}</td>
                            <td className="p-2">{h.isActive ? "نشط" : h.isActive === false ? "غير نشط" : "—"}</td>
                            <td className="p-2">{h.ownerName || "—"}</td>
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
        </>
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
      <Modal id="toggleVehicleConfirm" title={f.toggleConfirmTitle} width="w-[400px]">
        {pendingVehicle && (
          <>
            <p className="text-sm text-muted mb-6">
              {pendingVehicle.status === "Active" ? f.toggleDeactivateMsg : f.toggleActivateMsg}
              <br />
              <span className="text-fg font-semibold">{pendingVehicle.plateNumber}</span>
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn-ghost px-4 py-2 rounded-lg text-sm" onClick={closeToggleConfirm}>
                {f.cancel}
              </button>
              <button className="btn-primary px-4 py-2 rounded-lg text-sm" onClick={handleToggle}>
                {f.confirm}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
