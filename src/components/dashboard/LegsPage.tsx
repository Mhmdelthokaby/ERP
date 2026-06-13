"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Modal, StatusBadge } from "@/components/shared"
import { ar } from "@/lib/ar"
const l = ar.legs

export function LegsPage() {
  const { data, openModal, closeModal, toggleDriverActive, setEditingDriver, sidebarOpen, toggleSidebar, setPage, setPendingVehicleView, setEditingLicenseGrade, deleteLicenseGrade, setCurrentSubtitle } = useApp()
  const [legsTab, setLegsTab] = useState<"drivers" | "grades">("drivers")

  useEffect(() => {
    setCurrentSubtitle(legsTab === "grades" ? "/ درجات الرخصة" : "")
  }, [legsTab, setCurrentSubtitle])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [pendingToggleId, setPendingToggleId] = useState<number | null>(null)

  // filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [filterActive, setFilterActive] = useState("")
  const [filterSalaryMin, setFilterSalaryMin] = useState("")
  const [filterSalaryMax, setFilterSalaryMax] = useState("")
  const [filterHireDateFrom, setFilterHireDateFrom] = useState("")
  const [filterHireDateTo, setFilterHireDateTo] = useState("")

  const filteredDrivers = data.drivers.filter((d) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const match = d.fullName.toLowerCase().includes(q) || d.phone.includes(q) || String(d.code).includes(q) || (d.insuranceNumber || "").toLowerCase().includes(q)
      if (!match) return false
    }
    if (filterGrade && d.licenseGrade !== filterGrade) return false
    if (filterActive === "active" && !d.isActive) return false
    if (filterActive === "inactive" && d.isActive) return false
    if (filterSalaryMin && Number(d.salary || 0) < Number(filterSalaryMin)) return false
    if (filterSalaryMax && Number(d.salary || 0) > Number(filterSalaryMax)) return false
    if (filterHireDateFrom && d.hireDate && d.hireDate < filterHireDateFrom) return false
    if (filterHireDateTo && d.hireDate && d.hireDate > filterHireDateTo) return false
    return true
  })

  const goToVehicle = (vehicleId: number) => {
    setPendingVehicleView(vehicleId)
    setPage("fleet")
  }

  useEffect(() => {
    if (sidebarOpen && selectedId != null) setSelectedId(null)
  }, [sidebarOpen])

  const selectDriver = (id: number | null) => {
    setSelectedId((prev) => id === prev ? null : id)
    if (sidebarOpen && id != null) toggleSidebar()
  }

  const selected = selectedId != null ? data.drivers.find((d) => d.id === selectedId) : null
  const linkedVehicle = selected ? data.vehicles.find((v) => v.driverId === selected.id) : null
  const pending = pendingToggleId != null ? data.drivers.find((d) => d.id === pendingToggleId) : null

  const handleToggle = () => {
    if (pendingToggleId == null) return
    toggleDriverActive(pendingToggleId)
    setPendingToggleId(null)
    closeModal()
  }

  const openToggleConfirm = (id: number) => {
    setPendingToggleId(id)
    openModal("toggleLegConfirm")
  }

  const closeToggleConfirm = () => {
    setPendingToggleId(null)
    closeModal()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          <button
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${legsTab === "drivers" ? "active" : "text-muted"}`}
            onClick={() => { setLegsTab("drivers"); setSelectedId(null) }}
          >{l.driversTab}</button>
          <button
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${legsTab === "grades" ? "active" : "text-muted"}`}
            onClick={() => { setLegsTab("grades"); setSelectedId(null) }}
          >{l.licenseGradesTab}</button>
        </div>
        <button
          className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          onClick={() => openModal(legsTab === "drivers" ? "addDriverModal" : "addLicenseGradeModal")}
        >
          <i className="fa-solid fa-plus text-xs"></i> {legsTab === "drivers" ? "إضافة سائق" : l.addLicenseGrade}
        </button>
      </div>

      {legsTab === "drivers" && (
        <>
        <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <input type="text" placeholder="بحث بالاسم، الهاتف، الكود، أو رقم التأمين" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
              <option value="">{l.licenseGrade}: {ar.trips.allStatuses}</option>
              {data.licenseGrades.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
            <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
              <option value="">{l.status}: {ar.trips.allStatuses}</option>
              <option value="active">{l.active}</option>
              <option value="inactive">{l.inactive}</option>
            </select>
            <div className="flex gap-1 items-center">
              <input type="number" placeholder={`${ar.fleetModals.salary} ${ar.modals.from}`} value={filterSalaryMin} onChange={(e) => setFilterSalaryMin(e.target.value)} className="w-full" />
              <span className="text-muted text-xs">-</span>
              <input type="number" placeholder={`${ar.modals.to}`} value={filterSalaryMax} onChange={(e) => setFilterSalaryMax(e.target.value)} className="w-full" />
            </div>
            <div className="flex gap-1 items-center">
              <input type="date" placeholder={`${ar.fleetModals.hireDate} ${ar.modals.from}`} value={filterHireDateFrom} onChange={(e) => setFilterHireDateFrom(e.target.value)} className="w-full" />
              <span className="text-muted text-xs">-</span>
              <input type="date" placeholder={`${ar.modals.to}`} value={filterHireDateTo} onChange={(e) => setFilterHireDateTo(e.target.value)} className="w-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4" style={selectedId != null ? { gridTemplateColumns: "1fr 500px" } : {}}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                  <th className="text-right p-4 font-medium">{l.code}</th>
                  <th className="text-right p-4 font-medium">{l.fullName}</th>
                  <th className="text-right p-4 font-medium">{l.phone}</th>
                  <th className="text-right p-4 font-medium">{l.licenseGrade}</th>
                  <th className="text-right p-4 font-medium">{l.status}</th>
                  <th className="text-right p-4 font-medium">{l.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted text-sm">لا يوجد سائقون مطابقون</td></tr>
                ) : filteredDrivers.map((d) => (
                  <tr
                    key={d.id}
                    className={`data-row border-b border-border/50 cursor-pointer ${selectedId === d.id ? "bg-accent/5" : ""}`}
                    onClick={() => selectDriver(d.id)}
                  >
                    <td className="p-4 font-mono text-xs text-muted">{d.code}</td>
                    <td className="p-4 text-fg font-medium">{d.fullName}</td>
                    <td className="p-4 text-muted font-mono text-xs" dir="ltr">{d.phone}</td>
                    <td className="p-4 font-mono text-xs text-muted">{d.licenseGrade}</td>
                    <td className="p-4">
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${d.isActive ? "bg-success" : "bg-danger"}`}
                        onClick={(e) => { e.stopPropagation(); openToggleConfirm(d.id) }}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${d.isActive ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="text-muted hover:text-accent transition-colors mr-2" title={l.view} onClick={() => selectDriver(d.id)}>
                        <i className="fa-solid fa-eye text-xs"></i>
                      </button>
                      <button className="text-muted hover:text-accent transition-colors mr-2" title={l.edit} onClick={() => { setEditingDriver(d); openModal("editDriverModal") }}>
                        <i className="fa-solid fa-pen-to-square text-xs"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{selected.fullName} — {l.details}</h3>
                  <p className="text-xs text-muted mt-1">{selected.code}</p>
                </div>
                <button className="text-muted hover:text-fg transition-colors" onClick={() => setSelectedId(null)}>
                  <i className="fa-solid fa-times text-sm"></i>
                </button>
              </div>
              <div className="p-4 text-sm">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  <div><span className="text-muted">{l.code}:</span> <span className="font-mono block mt-0.5">{selected.code}</span></div>
                  <div><span className="text-muted">{l.fullName}:</span> <span className="block mt-0.5 font-medium">{selected.fullName}</span></div>
                  <div><span className="text-muted">{l.phone}:</span> <span className="font-mono block mt-0.5" dir="ltr">{selected.phone}</span></div>
                  <div><span className="text-muted">{l.licenseGrade}:</span> <span className="font-mono block mt-0.5">{selected.licenseGrade}</span></div>
                  <div><span className="text-muted">{l.status}:</span> <span className="block mt-0.5">{selected.isActive ? <StatusBadge status="Active" /> : <StatusBadge status="Inactive" />}</span></div>
                  <div><span className="text-muted">الرقم القومي:</span> <span className="font-mono block mt-0.5">{selected.nationalId}</span></div>
                  <div><span className="text-muted">رقم التأمين:</span> <span className="font-mono block mt-0.5">{selected.insuranceNumber || "—"}</span></div>
                  <div><span className="text-muted">الراتب:</span> <span className="font-mono block mt-0.5">{selected.salary || "—"}</span></div>
                  <div><span className="text-muted">تاريخ التعيين:</span> <span className="font-mono block mt-0.5">{selected.hireDate || "—"}</span></div>
                  <div><span className="text-muted">المركبة:</span> {linkedVehicle ? <button className="font-mono block mt-0.5 text-accent hover:underline cursor-pointer" onClick={() => goToVehicle(linkedVehicle.id)}>{linkedVehicle.code}</button> : <span className="font-mono block mt-0.5 text-muted">غير مرتبط</span>}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        </>
      )}

      {legsTab === "grades" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-right p-4 font-medium">{l.licenseGradeName}</th><th className="text-right p-4 font-medium">{l.actions}</th>
            </tr></thead>
            <tbody>
              {data.licenseGrades.map((lg) => (
                <tr key={lg.id} className="data-row border-b border-border/50">
                  <td className="p-4 text-fg font-medium">{lg.name}</td>
                  <td className="p-4 text-right">
                    <button className="text-muted hover:text-accent transition-colors mr-2" title={l.edit} onClick={() => { setEditingLicenseGrade(lg); openModal("editLicenseGradeModal") }}><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                    <button className="text-muted hover:text-accent transition-colors mr-2" title="حذف" onClick={() => deleteLicenseGrade(lg.id)}><i className="fa-solid fa-trash-can text-xs"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal id="toggleLegConfirm" title={l.toggleConfirmTitle} width="w-[400px]">
        {pending && (
          <>
            <p className="text-sm text-muted mb-6">
              {pending.isActive ? l.toggleDeactivateMsg : l.toggleActivateMsg}
              <br />
              <span className="text-fg font-semibold">{pending.fullName}</span>
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn-ghost px-4 py-2 rounded-lg text-sm" onClick={closeToggleConfirm}>
                {l.cancel}
              </button>
              <button className="btn-primary px-4 py-2 rounded-lg text-sm" onClick={handleToggle}>
                {l.confirm}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
