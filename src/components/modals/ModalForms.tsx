"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Modal } from "@/components/shared"
import { ar } from "@/lib/ar"
const m = ar.fleetModals
const mod = ar.modals

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
    <Modal title={m.addVehicle} id="addVehicleModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.code}</label><input type="text" placeholder="VHC-010" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.plateNumber}</label><input type="text" placeholder="ABC-1234" value={plate} onChange={(e) => setPlate(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.model}</label><input type="text" placeholder="Toyota Hiace" value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.year}</label><input type="number" placeholder="2024" value={year} onChange={(e) => setYear(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.capacity}</label><input type="number" placeholder="20" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.type}</label>
            <select value={vehicleTypeId} onChange={(e) => setVehicleTypeId(e.target.value)}>
              <option value="">{m.selectType}</option>
              {data.vehicleTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.assignDriver}</label>
          <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">{m.selectDriver}</option>
            {data.drivers.filter((d) => d.isActive).map((d) => (
              <option key={d.id} value={d.id}>{d.fullName} ({d.code})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{m.add}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{m.cancel}</button>
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
  const [insuranceNumber, setInsuranceNumber] = useState("")
  const [salary, setSalary] = useState("")
  const [hireDate, setHireDate] = useState("")

  const handleSubmit = () => {
    if (!code || !fullName || !phone) return
    addDriver({ code, fullName, phone, nationalId, licenseGrade, insuranceNumber: insuranceNumber || undefined, salary: salary || undefined, hireDate: hireDate || undefined, isActive: true })
    setCode(""); setFullName(""); setPhone(""); setNationalId(""); setLicenseGrade("A"); setInsuranceNumber(""); setSalary(""); setHireDate("")
    closeModal()
  }

  return (
    <Modal title={m.addDriver} id="addDriverModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.code}</label><input type="text" placeholder="DRV-010" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.fullName}</label><input type="text" placeholder="Ahmed Hassan" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.phone}</label><input type="text" placeholder="01012345678" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.nationalId}</label><input type="text" placeholder="29801012345678" value={nationalId} onChange={(e) => setNationalId(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.insuranceNumber}</label><input type="text" placeholder="INS-001" value={insuranceNumber} onChange={(e) => setInsuranceNumber(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.salary}</label><input type="text" placeholder="5000" value={salary} onChange={(e) => setSalary(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.licenseGrade}</label>
          <select value={licenseGrade} onChange={(e) => setLicenseGrade(e.target.value)}>
            <option>A</option><option>B</option><option>C</option>
          </select>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.hireDate}</label><input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{m.add}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{m.cancel}</button>
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
    <Modal title={m.editVehicle} id="editVehicleModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.code}</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.plateNumber}</label><input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.model}</label><input type="text" value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.year}</label><input type="number" value={year} onChange={(e) => setYear(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.capacity}</label><input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.type}</label>
            <select value={vehicleTypeId} onChange={(e) => setVehicleTypeId(e.target.value)}>
              <option value="">{m.selectType}</option>
              {data.vehicleTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.assignDriver}</label>
          <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">{m.selectDriver}</option>
            {data.drivers.filter((d) => d.isActive).map((d) => (
              <option key={d.id} value={d.id}>{d.fullName} ({d.code})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{m.save}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{m.cancel}</button>
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
  const [insuranceNumber, setInsuranceNumber] = useState(editingDriver?.insuranceNumber ?? "")
  const [salary, setSalary] = useState(editingDriver?.salary ?? "")
  const [hireDate, setHireDate] = useState(editingDriver?.hireDate ?? "")

  if (!editingDriver) return null

  const handleSubmit = () => {
    if (!code || !fullName || !phone) return
    updateDriver(editingDriver.id, { code, fullName, phone, nationalId, licenseGrade, insuranceNumber: insuranceNumber || undefined, salary: salary || undefined, hireDate: hireDate || undefined })
    setEditingDriver(null); closeModal()
  }

  return (
    <Modal title={m.editDriver} id="editDriverModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.code}</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.fullName}</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.phone}</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.nationalId}</label><input type="text" value={nationalId} onChange={(e) => setNationalId(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.insuranceNumber}</label><input type="text" value={insuranceNumber} onChange={(e) => setInsuranceNumber(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.salary}</label><input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.licenseGrade}</label>
          <select value={licenseGrade} onChange={(e) => setLicenseGrade(e.target.value)}>
            <option>A</option><option>B</option><option>C</option>
          </select>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.hireDate}</label><input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{m.save}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{m.cancel}</button>
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
    <Modal title={mod.newOrder} id="addTripModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mod.customer}</label>
            <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
              <option>ABC Transport Corp</option><option>Gulf Logistics</option><option>Nile Tourism</option><option>Delta Cargo</option>
            </select>
          </div>
          <div><label className="text-xs text-muted mb-1 block">{mod.tripDate}</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mod.from}</label><input type="text" placeholder="Cairo" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{mod.to}</label><input type="text" placeholder="Alexandria" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mod.salePrice}</label><input type="number" placeholder="50000" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{mod.currency}</label>
            <select onChange={(e) => {
              const opt = e.target.selectedOptions[0]
              setRate(opt.dataset.rate || "1")
            }}>
              <option value="1" data-rate="1">EGP</option><option value="2" data-rate="31">USD</option><option value="3" data-rate="34">EUR</option>
            </select>
          </div>
          <div><label className="text-xs text-muted mb-1 block">{mod.exchangeRate}</label><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step="0.01" /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{mod.createOrder}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{mod.cancel}</button>
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
    <Modal title={mod.recordExpense} id="addExpenseModal">
      <div className="space-y-4">
        <div><label className="text-xs text-muted mb-1 block">{mod.vehicle}</label>
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            <option>ABC-1234 (Mercedes Actros)</option><option>XYZ-5678 (Volvo FH)</option><option>DEF-9012 (MAN TGX)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mod.expenseType}</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Fuel">{mod.fuel}</option><option value="Maintenance">{mod.maintenance}</option><option value="Tires">{mod.tires}</option><option value="Oil">{mod.oil}</option><option value="Tolls">{mod.tolls}</option><option value="Other">{mod.otherExpense}</option>
            </select>
          </div>
          <div><label className="text-xs text-muted mb-1 block">{mod.paymentMethod}</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="Cash">{mod.cash}</option><option value="Bank">{mod.bank}</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mod.amount}</label><input type="number" placeholder="3500" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{mod.date}</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{mod.notes}</label><textarea rows={2} placeholder="Optional notes..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{mod.recordExpense}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{mod.cancel}</button>
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
    <Modal title={mod.manualJournal} id="addJournalModal" width="w-[600px]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mod.entryDate}</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{mod.fiscalPeriod}</label>
            <select><option value="3">Mar 2024 (Normal)</option><option value="4">Apr 2024 (Normal)</option></select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{mod.description}</label><input type="text" placeholder="Manual adjustment..." value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted font-medium">{mod.lines}</label>
            <button className="text-xs text-accent hover:underline" onClick={addLine}>{mod.addLine}</button>
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
                    <button className="text-danger text-xs hover:underline" onClick={() => removeLine(i)}>{mod.remove}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-2 border-t border-border text-xs">
            <span className="text-muted">{mod.balance}</span>
            <span className={`font-mono font-bold ${balanced ? "text-success" : "text-danger"}`}>
              {balanced ? `${totalDebit.toFixed(2)} (${mod.balanced})` : `${Math.abs(totalDebit - totalCredit).toFixed(2)} (${mod.unbalanced})`}
            </span>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{mod.postEntry}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{mod.cancel}</button>
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

  const handleSubmit = () => {
    if (!code || !name) return
    addAccount(code, name, type)
    setCode(""); setName("")
    closeModal()
  }

  return (
    <Modal title={mod.newAccount} id="addAccountModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mod.code}</label><input type="text" placeholder="5900" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{mod.type}</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Asset">{mod.asset}</option><option value="Liability">{mod.liability}</option>
              <option value="Equity">{mod.equity}</option><option value="Revenue">{mod.revenue}</option><option value="Expense">{mod.expense}</option>
            </select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{mod.name}</label><input type="text" placeholder="Other Expenses" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="text-xs text-muted mb-1 block">{mod.normalBalance}</label><input type="text" value={type === "Asset" || type === "Expense" ? mod.debit : mod.credit} readOnly className="!bg-surface" /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{mod.createAccount}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{mod.cancel}</button>
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
    <Modal title={mod.createUser} id="addUserModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mod.name}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{mod.email}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mod.password}</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{mod.role}</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Admin">{ar.statusBadge.admin}</option><option value="Accountant">{ar.statusBadge.accountant}</option>
              <option value="Operator">{ar.statusBadge.operator}</option><option value="Viewer">{ar.statusBadge.viewer}</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{mod.createUser}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{mod.cancel}</button>
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
    <Modal title={m.addType} id="addVehicleTypeModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.name}</label><input type="text" placeholder="Bus" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.code}</label><input type="text" placeholder="BUS" value={code} onChange={(e) => setCode(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.model}</label><input type="text" placeholder="Hiace/Sprinter" value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div><label className="text-xs text-muted mb-1 block">{m.modelCode}</label><input type="text" placeholder="HS" value={modelCode} onChange={(e) => setModelCode(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{m.add}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{m.cancel}</button>
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
    <Modal title={m.editType} id="editVehicleTypeModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.name}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.code}</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.model}</label><input type="text" value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div><label className="text-xs text-muted mb-1 block">{m.modelCode}</label><input type="text" value={modelCode} onChange={(e) => setModelCode(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{m.save}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={() => { setEditingVehicleType(null); closeModal() }}>{m.cancel}</button>
        </div>
      </div>
    </Modal>
  )
}
