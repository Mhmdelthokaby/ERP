"use client"

import { useState, useEffect, useCallback } from "react"
import { useApp } from "@/lib/app-context"
import { Modal } from "@/components/shared"
import { api } from "@/lib/api"
import { ar } from "@/lib/ar"
import type { Vehicle } from "@/lib/store"
const f = ar.fleet

export function FleetPage() {
  const { data, openModal, closeModal, toggleVehicleActive, fetchVehicleHistory, deleteVehicleType, setEditingVehicle, setEditingVehicleType, pendingVehicleView, setPendingVehicleView, setPage, setPendingDriverView, setCurrentSubtitle, toggleSidebar, sidebarOpen } = useApp()
  const [fleetTab, setFleetTab] = useState<"vehicles" | "types">("vehicles")
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterModel, setFilterModel] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterExpiry, setFilterExpiry] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [tableVehicles, setTableVehicles] = useState<Vehicle[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

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

  const dbVehicleToTable = useCallback((v: Record<string, unknown>): Vehicle => ({
    id: parseInt(String(v.id).slice(0, 8), 16) || Math.random(),
    dbId: String(v.id),
    code: Number(v.code) || 0,
    plateNumber: String(v.plateNumber || ""),
    model: String(v.model || ""),
    year: Number(v.year) || 0,
    capacity: Number(v.capacity) || 0,
    chassisNumber: String(v.chassisNumber || ""),
    engineNumber: String(v.engineNumber || ""),
    licenseDate: String(v.licenseDate || ""),
    licenseExpiryDate: String(v.licenseExpiryDate || ""),
    ownerName: String(v.ownerName || ""),
    licenseType: String(v.licenseType || ""),
    purchaseDate: String(v.purchaseDate || ""),
    hasGps: String(v.hasGps) === "true",
    fuelConsumption: v.fuelConsumption != null ? Number(v.fuelConsumption) : null,
    vehicleTypeId: v.vehicleTypeId ? parseInt(String(v.vehicleTypeId).slice(0, 8), 16) || null : null,
    vehicleType: String(v.vehicleTypeName || ""),
    driverId: v.driverId ? parseInt(String(v.driverId).slice(0, 8), 16) || null : null,
    driverName: String(v.driverName || ""),
    status: String(v.isActive) === "true" ? "Active" : "Inactive",
  }), [])

  const buildParams = useCallback(() => {
    const params: Record<string, string> = {}
    if (searchQuery) params.search = searchQuery
    if (filterModel) params.model = filterModel
    if (filterYear) params.year = filterYear
    if (filterExpiry) params.licenseExpiry = filterExpiry
    if (filterStatus) params.isActive = filterStatus === "active" ? "true" : "false"
    params.page = String(currentPage)
    params.pageSize = String(pageSize)
    return params
  }, [searchQuery, filterModel, filterYear, filterExpiry, filterStatus, currentPage, pageSize])

  useEffect(() => {
    setLoading(true)
    api.searchVehicles(buildParams()).then((res) => {
      setTableVehicles(res.data.map((v) => dbVehicleToTable(v as Record<string, unknown>)))
      setTotalCount(res.total)
    }).catch(() => {
      setTableVehicles([]); setTotalCount(0)
    }).finally(() => setLoading(false))
  }, [buildParams, dbVehicleToTable])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(currentPage, totalPages)

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
                {loading ? (
                  <tr><td colSpan={8} className="p-4 text-center text-muted text-xs">جاري التحميل...</td></tr>
                ) : tableVehicles.length === 0 ? (
                  <tr><td colSpan={8} className="p-4 text-center text-muted text-xs">لا توجد نتائج</td></tr>
                ) : tableVehicles.map((v) => (
                  <tr key={v.id} className={`data-row border-b border-border/50 cursor-pointer ${selectedVehicleId === v.id ? "bg-accent/5" : ""}`} onClick={() => handleVehicleClick(v.id)}>
                    <td className="p-4 font-mono text-xs text-muted">{v.code}</td>
                    <td className="p-4 font-mono font-semibold text-accent">{v.plateNumber}</td>
                    <td className="p-4 text-fg">{v.model}</td>
                    <td className="p-4 text-muted">{v.year}</td>
                    <td className="p-4 text-muted">{v.capacity}</td>
                    <td className="p-4 text-muted text-xs">{v.driverName ? <button className="text-accent hover:underline" onClick={(e) => { e.stopPropagation(); setPendingDriverView(v.driverId); setPage("legs") }}>{v.driverName}</button> : "—"}</td>
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
            <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted">
              <div className="flex items-center gap-2">
                <span>عرض</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }} className="!py-1 !text-xs">
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
                <span>من {totalCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 rounded hover:bg-surface disabled:opacity-30" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`px-2 py-1 rounded ${p === safePage ? "bg-accent text-white" : "hover:bg-surface"}`} onClick={() => setCurrentPage(p)}>{p}</button>
                ))}
                <button className="px-2 py-1 rounded hover:bg-surface disabled:opacity-30" disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)}>›</button>
              </div>
            </div>
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
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.codeLabel}</span> <span className="font-mono">{selectedVehicle.code}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.plateLabel}</span> <span className="font-mono">{selectedVehicle.plateNumber}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.chassisNumber}:</span> <span className="font-mono">{selectedVehicle.chassisNumber || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.engineNumber}:</span> <span className="font-mono">{selectedVehicle.engineNumber || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.model}:</span> <span>{selectedVehicle.model}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.gps}:</span> <span className={selectedVehicle.hasGps ? "text-success" : "text-muted"}>{selectedVehicle.hasGps ? f.gpsFound : f.gpsNotFound}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.yearLabel}</span> <span>{selectedVehicle.year}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.capacityLabel}</span> <span>{selectedVehicle.capacity}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.fuelConsumption}:</span> <span>{selectedVehicle.fuelConsumption != null ? `${selectedVehicle.fuelConsumption} L/100KM` : "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.ownerName}:</span> <span>{selectedVehicle.ownerName || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.licenseDate}:</span> <span>{selectedVehicle.licenseDate || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.licenseExpiry}:</span> <span>{selectedVehicle.licenseExpiryDate || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.licenseTypeLabel}:</span> <span>{selectedVehicle.licenseType || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.purchaseDate}:</span> <span>{selectedVehicle.purchaseDate || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{f.driverLabel}</span> {selectedVehicle.driverName ? <button className="text-accent hover:underline" onClick={() => { setPendingDriverView(selectedVehicle.driverId); setPage("legs") }}>{selectedVehicle.driverName}</button> : <span>{f.unassigned}</span>}</div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1">
                    <span className="text-muted shrink-0">{f.statusLabel}</span>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedVehicle.status === "Active" ? "bg-success" : "bg-danger"}`}
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
