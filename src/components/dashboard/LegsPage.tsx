"use client"

import { useState, useEffect, useCallback } from "react"
import { useApp } from "@/lib/app-context"
import { api } from "@/lib/api"
import { Modal, StatusBadge } from "@/components/shared"
import { ar } from "@/lib/ar"
import type { Driver } from "@/lib/store"
const l = ar.legs

export function LegsPage() {
  const { data, openModal, closeModal, toggleDriverActive, setEditingDriver, sidebarOpen, toggleSidebar, setPage, setPendingVehicleView, pendingDriverView, setPendingDriverView, setEditingLicenseGrade, deleteLicenseGrade, setCurrentSubtitle } = useApp()
  const [legsTab, setLegsTab] = useState<"drivers" | "grades">("drivers")

  useEffect(() => {
    setCurrentSubtitle(legsTab === "grades" ? "/ درجات الرخصة" : "")
  }, [legsTab, setCurrentSubtitle])
  useEffect(() => {
    if (pendingDriverView != null) {
      setSelectedId(pendingDriverView)
      setLegsTab("drivers")
      setPendingDriverView(null)
    }
  }, [pendingDriverView])
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
  const [sortBy, setSortBy] = useState<"name" | "salary" | "">("")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [tableDrivers, setTableDrivers] = useState<Driver[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const buildParams = useCallback(() => {
    const params: Record<string, string> = {}
    if (searchQuery) params.search = searchQuery
    if (filterGrade) params.licenseGrade = filterGrade
    if (filterActive) params.isActive = filterActive === "active" ? "true" : "false"
    if (filterSalaryMin) params.salaryMin = filterSalaryMin
    if (filterSalaryMax) params.salaryMax = filterSalaryMax
    if (filterHireDateFrom) params.hireDateFrom = filterHireDateFrom
    if (filterHireDateTo) params.hireDateTo = filterHireDateTo
    if (sortBy) params.sortBy = sortBy
    if (sortDir) params.sortDir = sortDir
    params.page = String(currentPage)
    params.pageSize = String(pageSize)
    return params
  }, [searchQuery, filterGrade, filterActive, filterSalaryMin, filterSalaryMax, filterHireDateFrom, filterHireDateTo, sortBy, sortDir, currentPage, pageSize])

  useEffect(() => {
    setLoading(true)
    api.searchDrivers(buildParams()).then((res) => {
      setTableDrivers(res.data.map((d) => {
        const r = d as Record<string, unknown>
        return {
          id: parseInt(String(r.id).slice(0, 8), 16) || Math.random(),
          code: Number(r.code) || 0,
          fullName: String(r.fullName || ""),
          phone: String(r.phone || ""),
          nationalId: String(r.nationalId || ""),
          licenseGrade: String(r.licenseGrade || ""),
          insuranceNumber: r.insuranceNumber ? String(r.insuranceNumber) : undefined,
          salary: r.salary ? String(r.salary) : undefined,
          hireDate: r.hireDate ? String(r.hireDate) : undefined,
          isActive: String(r.isActive) === "true",
        } as Driver
      }))
      setTotalCount(res.total)
    }).catch(() => {
      setTableDrivers([]); setTotalCount(0)
    }).finally(() => setLoading(false))
  }, [buildParams])

  const handleSort = (field: "name" | "salary") => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field); setSortDir("asc")
    }
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(currentPage, totalPages)

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

  const selected = selectedId != null ? tableDrivers.find((d) => d.id === selectedId) : null
  const linkedVehicles = selected ? data.vehicles.filter((v) => v.driverId === selected.id) : []
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
          <input type="text" placeholder="بحث بالاسم، الهاتف، الكود، أو رقم التأمين" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} className="w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={filterGrade} onChange={(e) => { setFilterGrade(e.target.value); setCurrentPage(1) }}>
              <option value="">{l.licenseGrade}: {ar.trips.allStatuses}</option>
              {data.licenseGrades.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
            <select value={filterActive} onChange={(e) => { setFilterActive(e.target.value); setCurrentPage(1) }}>
              <option value="">{l.status}: {ar.trips.allStatuses}</option>
              <option value="active">{l.active}</option>
              <option value="inactive">{l.inactive}</option>
            </select>
            <div className="flex gap-1 items-center">
              <input type="number" placeholder={`${ar.fleetModals.salary} ${ar.modals.from}`} value={filterSalaryMin} onChange={(e) => { setFilterSalaryMin(e.target.value); setCurrentPage(1) }} className="w-full" />
              <span className="text-muted text-xs">-</span>
              <input type="number" placeholder={`${ar.modals.to}`} value={filterSalaryMax} onChange={(e) => { setFilterSalaryMax(e.target.value); setCurrentPage(1) }} className="w-full" />
            </div>
            <div className="flex gap-1 items-center">
              <input type="date" placeholder={`${ar.fleetModals.hireDate} ${ar.modals.from}`} value={filterHireDateFrom} onChange={(e) => { setFilterHireDateFrom(e.target.value); setCurrentPage(1) }} className="w-full" />
              <span className="text-muted text-xs">-</span>
              <input type="date" placeholder={`${ar.modals.to}`} value={filterHireDateTo} onChange={(e) => { setFilterHireDateTo(e.target.value); setCurrentPage(1) }} className="w-full" />
            </div>
          </div>
        </div>
        <div className={`grid gap-4 ${selectedId != null ? "grid-cols-1 md:grid-cols-[1fr_500px]" : "grid-cols-1"}`}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                  <th className="text-right p-4 font-medium">{l.code}</th>
                  <th className="text-right p-4 font-medium cursor-pointer select-none hover:text-fg" onClick={() => handleSort("name")}>
                    {l.fullName} {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="text-right p-4 font-medium">{l.phone}</th>
                  <th className="text-right p-4 font-medium">{l.licenseGrade}</th>
                  <th className="text-right p-4 font-medium">{l.status}</th>
                  <th className="text-right p-4 font-medium cursor-pointer select-none hover:text-fg" onClick={() => handleSort("salary")}>
                    {ar.fleetModals.salary} {sortBy === "salary" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="text-right p-4 font-medium">{l.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted text-sm">جار التحميل...</td></tr>
                ) : tableDrivers.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted text-sm">لا يوجد سائقون مطابقون</td></tr>
                ) : tableDrivers.map((d) => (
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
                    <td className="p-4 font-mono text-xs text-muted">{d.salary || "—"}</td>
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
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{l.code}:</span> <span className="font-mono">{selected.code}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{l.fullName}:</span> <span className="font-medium">{selected.fullName}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{l.phone}:</span> <span className="font-mono" dir="ltr">{selected.phone}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{l.licenseGrade}:</span> <span className="font-mono">{selected.licenseGrade}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">{l.status}:</span> <span>{selected.isActive ? <StatusBadge status="Active" /> : <StatusBadge status="Inactive" />}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">الرقم القومي:</span> <span className="font-mono">{selected.nationalId}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">رقم التأمين:</span> <span className="font-mono">{selected.insuranceNumber || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">الراتب:</span> <span className="font-mono">{selected.salary || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">تاريخ التعيين:</span> <span className="font-mono">{selected.hireDate || "—"}</span></div>
                  <div className="flex justify-between items-center gap-2 border-b border-border/30 pb-1"><span className="text-muted shrink-0">المركبات:</span> <span>{linkedVehicles.length ? linkedVehicles.map((lv) => <button key={lv.id} className="font-mono text-accent hover:underline cursor-pointer" onClick={() => goToVehicle(lv.id)}>{lv.code}</button>) : <span className="font-mono text-muted">غير مرتبط</span>}</span></div>
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
