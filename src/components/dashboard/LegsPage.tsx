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
                {data.drivers.map((d) => (
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
