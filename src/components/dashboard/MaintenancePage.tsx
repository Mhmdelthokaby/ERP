"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Maintenance, MaintenanceType } from "@/lib/store"
import { ar } from "@/lib/ar"

const s = ar.maintenance

const columns: { key: keyof Maintenance; label: string; render?: (val: unknown) => string }[] = [
  { key: "code", label: s.code, render: (v) => String(v) },
  { key: "plateNumber", label: s.plateNumber },
  { key: "maintenanceDate", label: s.maintenanceDate },
  { key: "supplierName", label: s.supplierName },
  { key: "invoiceNumber", label: s.invoiceNumber },
  { key: "maintenanceType", label: s.maintenanceType },
  { key: "notes", label: s.notes },
]

export function MaintenancePage() {
  const { data, activeModal, openModal, editingMaintenance, setEditingMaintenance, editingMaintenanceType, setEditingMaintenanceType, deleteMaintenance, deleteMaintenanceType } = useApp()
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null)
  const [tab, setTab] = useState<"records" | "types">("records")

  const handleEdit = (m: Maintenance) => {
    setEditingMaintenance(m)
    openModal("editMaintenanceModal")
  }

  const handleDelete = (m: Maintenance) => {
    if (confirm(`${s.deleteConfirm} "${m.plateNumber}"؟`)) {
      deleteMaintenance(m.id)
    }
  }

  const handleEditType = (mt: MaintenanceType) => {
    setEditingMaintenanceType(mt)
    openModal("editMaintenanceTypeModal")
  }

  const handleDeleteType = (mt: MaintenanceType) => {
    if (confirm(`${s.deleteTypeConfirm} "${mt.name}"؟`)) {
      deleteMaintenanceType(mt.id)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-display font-bold text-fg">{s.title}</h2>
          <div className="flex bg-surface rounded-lg border border-border p-0.5">
            <button className={`px-3 py-1.5 text-xs rounded-md transition-colors ${tab === "records" ? "bg-accent text-bg font-semibold" : "text-muted hover:text-fg"}`} onClick={() => setTab("records")}>السجلات</button>
            <button className={`px-3 py-1.5 text-xs rounded-md transition-colors ${tab === "types" ? "bg-accent text-bg font-semibold" : "text-muted hover:text-fg"}`} onClick={() => setTab("types")}>{s.typeName}</button>
          </div>
        </div>
        {tab === "records" ? (
          <button className="btn-primary p-3 rounded-xl text-white text-sm flex items-center gap-2" onClick={() => { setEditingMaintenance(null); openModal("addMaintenanceModal") }}>
            <i className="fa-solid fa-plus text-xs"></i> {s.add}
          </button>
        ) : (
          <button className="btn-primary p-3 rounded-xl text-white text-sm flex items-center gap-2" onClick={() => { setEditingMaintenanceType(null); openModal("addMaintenanceTypeModal") }}>
            <i className="fa-solid fa-plus text-xs"></i> {s.addType}
          </button>
        )}
      </div>

      {tab === "records" ? (
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="flex-1 bg-surface rounded-xl border border-border overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
                  {columns.map((col) => (
                    <th key={col.key} className="text-right px-4 py-3 font-semibold">{col.label}</th>
                  ))}
                  <th className="text-right px-4 py-3 font-semibold w-24"></th>
                </tr>
              </thead>
              <tbody>
                {data.maintenance.map((m) => (
                  <tr key={m.id} className={`border-b border-border cursor-pointer transition-colors hover:bg-accent/5 ${selectedMaintenance?.id === m.id ? "bg-accent/10" : ""}`} onClick={() => setSelectedMaintenance(m)}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-fg">{col.render ? col.render(m[col.key]) : String(m[col.key] ?? "")}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-accent hover:text-accentDim transition-colors text-xs" onClick={(e) => { e.stopPropagation(); handleEdit(m) }}><i className="fa-solid fa-pen"></i></button>
                        <button className="text-danger hover:text-danger/80 transition-colors text-xs" onClick={(e) => { e.stopPropagation(); handleDelete(m) }}><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.maintenance.length === 0 && <tr><td colSpan={columns.length + 1} className="text-center text-muted py-8">{s.noSelection}</td></tr>}
              </tbody>
            </table>
          </div>

          {selectedMaintenance && (
            <div className="w-80 bg-surface rounded-xl border border-border p-5 flex-shrink-0 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-fg text-base">{selectedMaintenance.plateNumber}</h3>
                <button className="text-muted hover:text-fg transition-colors text-lg leading-none" onClick={() => setSelectedMaintenance(null)}>&times;</button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: s.code, value: String(selectedMaintenance.code) },
                  { label: s.plateNumber, value: selectedMaintenance.plateNumber },
                  { label: s.maintenanceDate, value: selectedMaintenance.maintenanceDate },
                  { label: s.supplierName, value: selectedMaintenance.supplierName },
                  { label: s.invoiceNumber, value: selectedMaintenance.invoiceNumber },
                  { label: s.maintenanceType, value: selectedMaintenance.maintenanceType },
                  { label: s.notes, value: selectedMaintenance.notes },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center gap-2 pb-2 border-b border-border last:border-b-0">
                    <span className="text-muted">{item.label}</span>
                    <span className="text-fg font-medium">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 bg-surface rounded-xl border border-border overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
                <th className="text-right px-4 py-3 font-semibold">{s.typeCode}</th>
                <th className="text-right px-4 py-3 font-semibold">{s.typeName}</th>
                <th className="text-right px-4 py-3 font-semibold w-24"></th>
              </tr>
            </thead>
            <tbody>
              {data.maintenanceTypes.map((mt) => (
                <tr key={mt.id} className="border-b border-border hover:bg-accent/5">
                  <td className="px-4 py-3 text-fg">{String(mt.code)}</td>
                  <td className="px-4 py-3 text-fg">{mt.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-accent hover:text-accentDim transition-colors text-xs" onClick={() => handleEditType(mt)}><i className="fa-solid fa-pen"></i></button>
                      <button className="text-danger hover:text-danger/80 transition-colors text-xs" onClick={() => handleDeleteType(mt)}><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.maintenanceTypes.length === 0 && <tr><td colSpan={3} className="text-center text-muted py-8">لا توجد أنواع صيانة</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
