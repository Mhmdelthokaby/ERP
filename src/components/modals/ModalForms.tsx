"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Modal } from "@/components/shared"

export function AddVehicleModal() {
  const { addVehicle, closeModal, data } = useApp()
  const [code, setCode] = useState("")
  const [plate, setPlate] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [capacity, setCapacity] = useState("")
  const [vehicleTypeId, setVehicleTypeId] = useState<number | string>("")
  const [driverId, setDriverId] = useState<number | string>("")

  const handleSubmit = () => {
    if (!code || !plate || !model || !year) return
    const vt = vehicleTypeId !== "" ? data.vehicleTypes.find((t) => t.id === Number(vehicleTypeId)) : null
    const driver = driverId !== "" ? data.drivers.find((d) => d.id === Number(driverId)) : null
    addVehicle({
      code, plateNumber: plate, model, year: parseInt(year),
      capacity: parseFloat(capacity) || 0, vehicleType: vt?.name ?? "",
      vehicleTypeId: vt?.id ?? null,
      driverId: driver?.id ?? null, driverName: driver?.fullName ?? "",
    })
    setCode(""); setPlate(""); setModel(""); setYear(""); setCapacity(""); setVehicleTypeId(""); setDriverId("")
    closeModal()
  }

  return (
    <Modal title="Add Vehicle" id="addVehicleModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Code</label><input type="text" placeholder="VHC-010" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Plate Number</label><input type="text" placeholder="ABC-1234" value={plate} onChange={(e) => setPlate(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">Model</label><input type="text" placeholder="Toyota Hiace" value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Year</label><input type="number" placeholder="2024" value={year} onChange={(e) => setYear(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Capacity (tons)</label><input type="number" placeholder="20" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Type</label>
            <select value={vehicleTypeId} onChange={(e) => setVehicleTypeId(e.target.value)}>
              <option value="">— Select Type —</option>
              {data.vehicleTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">Assign Driver (optional)</label>
          <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">— No Driver —</option>
            {data.drivers.filter((d) => d.isActive).map((d) => (
              <option key={d.id} value={d.id}>{d.fullName} ({d.code})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Add Vehicle</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddDriverModal() {
  const { addDriver, closeModal } = useApp()
  const [code, setCode] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [licenseGrade, setLicenseGrade] = useState("A")

  const handleSubmit = () => {
    if (!code || !fullName || !phone) return
    addDriver({ code, fullName, phone, nationalId, licenseGrade, isActive: true })
    setCode(""); setFullName(""); setPhone(""); setNationalId(""); setLicenseGrade("A")
    closeModal()
  }

  return (
    <Modal title="Add Driver" id="addDriverModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Code</label><input type="text" placeholder="DRV-010" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Full Name</label><input type="text" placeholder="Ahmed Hassan" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Phone</label><input type="text" placeholder="01012345678" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">National ID</label><input type="text" placeholder="29801012345678" value={nationalId} onChange={(e) => setNationalId(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">License Grade</label>
          <select value={licenseGrade} onChange={(e) => setLicenseGrade(e.target.value)}>
            <option>A</option><option>B</option><option>C</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Add Driver</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function EditVehicleModal() {
  const { editingVehicle, updateVehicle, closeModal, data, setEditingVehicle } = useApp()
  const [code, setCode] = useState(editingVehicle?.code ?? "")
  const [plate, setPlate] = useState(editingVehicle?.plateNumber ?? "")
  const [model, setModel] = useState(editingVehicle?.model ?? "")
  const [year, setYear] = useState(String(editingVehicle?.year ?? ""))
  const [capacity, setCapacity] = useState(String(editingVehicle?.capacity ?? ""))
  const [vehicleTypeId, setVehicleTypeId] = useState<number | string>(editingVehicle?.vehicleTypeId ?? "")
  const [driverId, setDriverId] = useState<number | string>(editingVehicle?.driverId ?? "")

  if (!editingVehicle) return null

  const handleSubmit = () => {
    if (!code || !plate || !model || !year) return
    const vt = vehicleTypeId !== "" ? data.vehicleTypes.find((t) => t.id === Number(vehicleTypeId)) : null
    const driver = driverId !== "" ? data.drivers.find((d) => d.id === Number(driverId)) : null
    updateVehicle(editingVehicle.id, {
      code, plateNumber: plate, model, year: parseInt(year),
      capacity: parseFloat(capacity) || 0, vehicleType: vt?.name ?? "",
      vehicleTypeId: vt?.id ?? null,
      driverId: driver?.id ?? null, driverName: driver?.fullName ?? "",
    })
    setEditingVehicle(null); closeModal()
  }

  return (
    <Modal title="Edit Vehicle" id="editVehicleModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Code</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Plate Number</label><input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">Model</label><input type="text" value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Year</label><input type="number" value={year} onChange={(e) => setYear(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Capacity (tons)</label><input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Type</label>
            <select value={vehicleTypeId} onChange={(e) => setVehicleTypeId(e.target.value)}>
              <option value="">— Select Type —</option>
              {data.vehicleTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">Assign Driver (optional)</label>
          <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">— No Driver —</option>
            {data.drivers.filter((d) => d.isActive).map((d) => (
              <option key={d.id} value={d.id}>{d.fullName} ({d.code})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Save Changes</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={() => { setEditingVehicle(null); closeModal() }}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function EditDriverModal() {
  const { editingDriver, updateDriver, closeModal, setEditingDriver } = useApp()
  const [code, setCode] = useState(editingDriver?.code ?? "")
  const [fullName, setFullName] = useState(editingDriver?.fullName ?? "")
  const [phone, setPhone] = useState(editingDriver?.phone ?? "")
  const [nationalId, setNationalId] = useState(editingDriver?.nationalId ?? "")
  const [licenseGrade, setLicenseGrade] = useState(editingDriver?.licenseGrade ?? "A")

  if (!editingDriver) return null

  const handleSubmit = () => {
    if (!code || !fullName || !phone) return
    updateDriver(editingDriver.id, { code, fullName, phone, nationalId, licenseGrade })
    setEditingDriver(null); closeModal()
  }

  return (
    <Modal title="Edit Driver" id="editDriverModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Code</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Full Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Phone</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">National ID</label><input type="text" value={nationalId} onChange={(e) => setNationalId(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">License Grade</label>
          <select value={licenseGrade} onChange={(e) => setLicenseGrade(e.target.value)}>
            <option>A</option><option>B</option><option>C</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Save Changes</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={() => { setEditingDriver(null); closeModal() }}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddTripModal() {
  const { addTrip, closeModal } = useApp()
  const [customer, setCustomer] = useState("ABC Transport Corp")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [price, setPrice] = useState("")
  const [rate, setRate] = useState("1")

  const handleSubmit = () => {
    if (!from || !to || !date || !price) return
    addTrip({ from, to, customer, date, price: parseFloat(price), rate: parseFloat(rate) })
    setFrom(""); setTo(""); setPrice(""); setRate("1")
    closeModal()
  }

  return (
    <Modal title="New Operation Order" id="addTripModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Customer</label>
            <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
              <option>ABC Transport Corp</option><option>Gulf Logistics</option><option>Nile Tourism</option><option>Delta Cargo</option>
            </select>
          </div>
          <div><label className="text-xs text-muted mb-1 block">Trip Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">From</label><input type="text" placeholder="Cairo" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">To</label><input type="text" placeholder="Alexandria" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Sale Price</label><input type="number" placeholder="50000" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Currency</label>
            <select onChange={(e) => {
              const opt = e.target.selectedOptions[0]
              setRate(opt.dataset.rate || "1")
            }}>
              <option value="1" data-rate="1">EGP</option><option value="2" data-rate="31">USD</option><option value="3" data-rate="34">EUR</option>
            </select>
          </div>
          <div><label className="text-xs text-muted mb-1 block">Exchange Rate</label><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step="0.01" /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Create Order</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddExpenseModal() {
  const { addExpense, closeModal } = useApp()
  const [vehicle, setVehicle] = useState("ABC-1234")
  const [type, setType] = useState("Fuel")
  const [method, setMethod] = useState("Cash")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    if (!amount || !date) return
    addExpense({ vehicle, type, method, amount: parseFloat(amount), date, notes })
    setAmount(""); setNotes("")
    closeModal()
  }

  return (
    <Modal title="Record Vehicle Expense" id="addExpenseModal">
      <div className="space-y-4">
        <div><label className="text-xs text-muted mb-1 block">Vehicle</label>
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            <option>ABC-1234 (Mercedes Actros)</option><option>XYZ-5678 (Volvo FH)</option><option>DEF-9012 (MAN TGX)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Expense Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>Fuel</option><option>Maintenance</option><option>Tires</option><option>Oil</option><option>Tolls</option><option>Other</option>
            </select>
          </div>
          <div><label className="text-xs text-muted mb-1 block">Payment Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Cash</option><option>Bank</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Amount</label><input type="number" placeholder="3500" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">Notes</label><textarea rows={2} placeholder="Optional notes..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Record Expense</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddJournalModal() {
  const { submitJournalEntry, closeModal } = useApp()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [desc, setDesc] = useState("")
  const [lines, setLines] = useState([
    { account: "1100 - Cash on Hand", debit: 0, credit: 0 },
    { account: "1101 - Cash at Bank", debit: 0, credit: 0 },
  ])

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0)
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0)
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01

  const addLine = () => setLines([...lines, { account: "1100 - Cash on Hand", debit: 0, credit: 0 }])

  const updateLine = (idx: number, field: "account" | "debit" | "credit", value: string | number) => {
    setLines(lines.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const removeLine = (idx: number) => {
    if (lines.length <= 2) return
    setLines(lines.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    if (!balanced || lines.length < 2) return
    const validLines = lines.filter(l => l.debit > 0 || l.credit > 0)
    if (validLines.length < 2) return
    submitJournalEntry(desc || "Manual entry", date, validLines)
    setDesc("")
    closeModal()
  }

  return (
    <Modal title="Manual Journal Entry" id="addJournalModal" width="w-[600px]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Entry Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Fiscal Period</label>
            <select><option value="3">Mar 2024 (Normal)</option><option value="4">Apr 2024 (Normal)</option></select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">Description</label><input type="text" placeholder="Manual adjustment..." value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted font-medium">Lines</label>
            <button className="text-xs text-accent hover:underline" onClick={addLine}>+ Add Line</button>
          </div>
          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <select className="!text-xs" value={l.account} onChange={(e) => updateLine(i, "account", e.target.value)}>
                    <option value="1100 - Cash on Hand">1100 - Cash on Hand</option>
                    <option value="1101 - Cash at Bank">1101 - Cash at Bank</option>
                    <option value="1200 - Accounts Receivable">1200 - Accounts Receivable</option>
                    <option value="2100 - Accounts Payable">2100 - Accounts Payable</option>
                    <option value="4100 - Transportation Revenue">4100 - Transportation Revenue</option>
                    <option value="5100 - Fuel Expense">5100 - Fuel Expense</option>
                    <option value="5200 - Maintenance Expense">5200 - Maintenance Expense</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <input type="number" className="!text-xs" placeholder="0" value={l.debit || ""} onChange={(e) => updateLine(i, "debit", parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-3">
                  <input type="number" className="!text-xs" placeholder="0" value={l.credit || ""} onChange={(e) => updateLine(i, "credit", parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-2">
                  {lines.length > 2 && (
                    <button className="text-danger text-xs hover:underline" onClick={() => removeLine(i)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-2 border-t border-border text-xs">
            <span className="text-muted">Balance:</span>
            <span className={`font-mono font-bold ${balanced ? "text-success" : "text-danger"}`}>
              {balanced ? `${totalDebit.toFixed(2)} (Balanced)` : `${Math.abs(totalDebit - totalCredit).toFixed(2)} (Unbalanced)`}
            </span>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Post Entry</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddAccountModal() {
  const { addAccount, closeModal } = useApp()
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [type, setType] = useState("Asset")
  const nb = (type === "Asset" || type === "Expense") ? "Debit" : "Credit"

  const handleSubmit = () => {
    if (!code || !name) return
    addAccount(code, name, type)
    setCode(""); setName("")
    closeModal()
  }

  return (
    <Modal title="New Account" id="addAccountModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Code</label><input type="text" placeholder="5900" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Asset">Asset</option><option value="Liability">Liability</option>
              <option value="Equity">Equity</option><option value="Revenue">Revenue</option><option value="Expense">Expense</option>
            </select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">Name</label><input type="text" placeholder="Other Expenses" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="text-xs text-muted mb-1 block">Normal Balance</label><input type="text" value={nb} readOnly className="!bg-surface" /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Create Account</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddUserModal() {
  const { addUser, closeModal } = useApp()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [role, setRole] = useState("Operator")

  const handleSubmit = () => {
    if (!name || !email || !pass || pass.length < 8) return
    addUser({ name, email, password: pass, role })
    setName(""); setEmail(""); setPass("")
    closeModal()
  }

  return (
    <Modal title="Create User" id="addUserModal">
      <div className="space-y-4">
        <div><label className="text-xs text-muted mb-1 block">Full Name</label><input type="text" placeholder="Ahmed Mohamed" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="text-xs text-muted mb-1 block">Email</label><input type="email" placeholder="ahmed@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="text-xs text-muted mb-1 block">Password</label><input type="password" placeholder="Min 8 characters" value={pass} onChange={(e) => setPass(e.target.value)} /></div>
        <div><label className="text-xs text-muted mb-1 block">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Admin</option><option>Accountant</option><option>Operator</option><option>Viewer</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Create User</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddVehicleTypeModal() {
  const { addVehicleType, closeModal } = useApp()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [model, setModel] = useState("")
  const [modelCode, setModelCode] = useState("")

  const handleSubmit = () => {
    if (!name || !code) return
    addVehicleType({ name, code, model, modelCode })
    setName(""); setCode(""); setModel(""); setModelCode("")
    closeModal()
  }

  return (
    <Modal title="Add Vehicle Type" id="addVehicleTypeModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Name</label><input type="text" placeholder="Bus" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Code</label><input type="text" placeholder="BUS" value={code} onChange={(e) => setCode(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">Model</label><input type="text" placeholder="Hiace/Sprinter" value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div><label className="text-xs text-muted mb-1 block">Model Code</label><input type="text" placeholder="HS" value={modelCode} onChange={(e) => setModelCode(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Add Type</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export function EditVehicleTypeModal() {
  const { editingVehicleType, updateVehicleType, closeModal, setEditingVehicleType } = useApp()
  const [name, setName] = useState(editingVehicleType?.name ?? "")
  const [code, setCode] = useState(editingVehicleType?.code ?? "")
  const [model, setModel] = useState(editingVehicleType?.model ?? "")
  const [modelCode, setModelCode] = useState(editingVehicleType?.modelCode ?? "")

  if (!editingVehicleType) return null

  const handleSubmit = () => {
    if (!name || !code) return
    updateVehicleType(editingVehicleType.id, { name, code, model, modelCode })
    setEditingVehicleType(null); closeModal()
  }

  return (
    <Modal title="Edit Vehicle Type" id="editVehicleTypeModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">Code</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">Model</label><input type="text" value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div><label className="text-xs text-muted mb-1 block">Model Code</label><input type="text" value={modelCode} onChange={(e) => setModelCode(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>Save Changes</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={() => { setEditingVehicleType(null); closeModal() }}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}
