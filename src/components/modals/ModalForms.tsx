"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Modal } from "@/components/shared"
import { ar } from "@/lib/ar"
const m = ar.fleetModals
const mod = ar.modals
const l = ar.legs
const sup = ar.suppliers
const mt = ar.maintenance

function formatPlate(raw: string) {
  return raw.replace(/\s/g, "").split("").join(" ")
}

export function AddVehicleModal() {
  const { addVehicle, closeModal, data } = useApp()
  const [plate, setPlate] = useState("")
  const [year, setYear] = useState("")
  const [capacity, setCapacity] = useState("")
  const [vehicleTypeId, setVehicleTypeId] = useState<number | string>("")
  const [driverId, setDriverId] = useState<number | string>("")
  const [chassis, setChassis] = useState("")
  const [engine, setEngine] = useState("")
  const [hasGps, setHasGps] = useState(false)
  const [fuelConsumption, setFuelConsumption] = useState("")
  const [licenseDate, setLicenseDate] = useState("")
  const [licenseExpiry, setLicenseExpiry] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [licenseType, setLicenseType] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [errors, setErrors] = useState<string[]>([])

  const fieldError = (f: string) => errors.includes(f)

  const handleSubmit = async () => {
    if (!plate || !year) return
    setErrors([])
    const vt = vehicleTypeId !== "" ? data.vehicleTypes.find((t) => t.id === Number(vehicleTypeId)) : null
    const driver = driverId !== "" ? data.drivers.find((d) => d.id === Number(driverId)) : null
    try {
      await addVehicle({
        plateNumber: plate, model: vt ? `${vt.code} - ${vt.model}` : "", year: parseInt(year),
        capacity: parseFloat(capacity) || 0, vehicleType: vt?.name ?? "",
        vehicleTypeId: vt?.id ?? null,
        driverId: driver?.id ?? null, driverName: driver?.fullName ?? "",
        chassisNumber: chassis, engineNumber: engine,
        hasGps, fuelConsumption: fuelConsumption ? parseFloat(fuelConsumption) : null,
        licenseDate, licenseExpiryDate: licenseExpiry,
        ownerName, licenseType, purchaseDate,
      })
      setPlate(""); setYear(""); setCapacity(""); setVehicleTypeId(""); setDriverId("")
      setChassis(""); setEngine(""); setHasGps(false); setFuelConsumption(""); setLicenseDate(""); setLicenseExpiry("")
      setOwnerName(""); setLicenseType(""); setPurchaseDate("")
      closeModal()
    } catch (e: any) {
      if (e.status === 409) setErrors(e.fields ?? [])
    }
  }

  return (
    <Modal title={m.addVehicle} id="addVehicleModal">
      <div className="space-y-4">
        <div><label className={`text-xs mb-1 block ${fieldError("plateNumber") ? "text-danger" : "text-muted"}`}>{m.plateNumber}</label><input type="text" placeholder="م ك ل 1 2 3" value={plate} onChange={(e) => { setPlate(formatPlate(e.target.value)); setErrors([]) }} className={fieldError("plateNumber") ? "!border-danger" : ""} />{fieldError("plateNumber") && <span className="text-xs text-danger mt-0.5 block">رقم اللوحة موجود مسبقاً</span>}</div>
        <div className="grid grid-cols-4 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.year}</label><input type="number" placeholder="2024" value={year} onChange={(e) => setYear(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.capacity}</label><input type="number" placeholder="20" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.fuelConsumption}</label><input type="number" step="0.1" placeholder="15 L/100KM" value={fuelConsumption} onChange={(e) => setFuelConsumption(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.type}</label>
            <select value={vehicleTypeId} onChange={(e) => setVehicleTypeId(e.target.value)}>
              <option value="">{m.selectType}</option>
              {data.vehicleTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={`text-xs mb-1 block ${fieldError("chassisNumber") ? "text-danger" : "text-muted"}`}>{m.chassisNumber}</label><input type="text" placeholder="CH-001" value={chassis} onChange={(e) => { setChassis(e.target.value); setErrors([]) }} className={fieldError("chassisNumber") ? "!border-danger" : ""} />{fieldError("chassisNumber") && <span className="text-xs text-danger mt-0.5 block">رقم الشاسية موجود مسبقاً</span>}</div>
          <div><label className={`text-xs mb-1 block ${fieldError("engineNumber") ? "text-danger" : "text-muted"}`}>{m.engineNumber}</label><input type="text" placeholder="EN-001" value={engine} onChange={(e) => { setEngine(e.target.value); setErrors([]) }} className={fieldError("engineNumber") ? "!border-danger" : ""} />{fieldError("engineNumber") && <span className="text-xs text-danger mt-0.5 block">رقم الماتور موجود مسبقاً</span>}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.ownerName}</label><input type="text" placeholder="محمد عماد" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.licenseType}</label><input type="text" placeholder="نقل عام" value={licenseType} onChange={(e) => setLicenseType(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.licenseDate}</label><input type="date" value={licenseDate} onChange={(e) => setLicenseDate(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.licenseExpiry}</label><input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.purchaseDate}</label><input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} /></div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="addGps" checked={hasGps} onChange={(e) => setHasGps(e.target.checked)} className="w-4 h-4" />
          <label htmlFor="addGps" className="text-xs text-muted">{m.gps}</label>
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
  const { addDriver, closeModal, data } = useApp()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [licenseGrade, setLicenseGrade] = useState("")
  const [insuranceNumber, setInsuranceNumber] = useState("")
  const [salary, setSalary] = useState("")
  const [hireDate, setHireDate] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const fieldError = (f: string) => errors.includes(f)

  const handleSubmit = async () => {
    if (!fullName || !phone) return
    setErrors([])
    setSubmitting(true)
    const driver = { fullName, phone, nationalId, licenseGrade, insuranceNumber: insuranceNumber || undefined, salary: salary || undefined, hireDate: hireDate || new Date().toISOString().slice(0, 10), isActive: true }
    try {
      await addDriver(driver)
      setFullName(""); setPhone(""); setNationalId(""); setLicenseGrade("A"); setInsuranceNumber(""); setSalary(""); setHireDate("")
      closeModal()
    } catch (e: any) {
      if (e.status === 409 && e.fields) setErrors(e.fields)
      else setErrors(["phone"])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={m.addDriver} id="addDriverModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.fullName}</label><input type="text" placeholder="Ahmed Hassan" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={`text-xs mb-1 block ${fieldError("phone") ? "text-danger" : "text-muted"}`}>{m.phone}</label><input type="text" placeholder="01012345678" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors([]) }} className={fieldError("phone") ? "!border-danger" : ""} />{fieldError("phone") && <span className="text-xs text-danger mt-0.5 block">رقم الهاتف موجود مسبقاً</span>}</div>
          <div><label className={`text-xs mb-1 block ${fieldError("nationalId") ? "text-danger" : "text-muted"}`}>{m.nationalId}</label><input type="text" placeholder="29801012345678" value={nationalId} onChange={(e) => { setNationalId(e.target.value); setErrors([]) }} className={fieldError("nationalId") ? "!border-danger" : ""} />{fieldError("nationalId") && <span className="text-xs text-danger mt-0.5 block">الرقم القومي موجود مسبقاً</span>}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={`text-xs mb-1 block ${fieldError("insuranceNumber") ? "text-danger" : "text-muted"}`}>{m.insuranceNumber}</label><input type="text" placeholder="INS-001" value={insuranceNumber} onChange={(e) => { setInsuranceNumber(e.target.value); setErrors([]) }} className={fieldError("insuranceNumber") ? "!border-danger" : ""} />{fieldError("insuranceNumber") && <span className="text-xs text-danger mt-0.5 block">رقم التأمين موجود مسبقاً</span>}</div>
          <div><label className="text-xs text-muted mb-1 block">{m.salary}</label><input type="text" placeholder="5000" value={salary} onChange={(e) => setSalary(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.licenseGrade}</label>
          <select value={licenseGrade} onChange={(e) => setLicenseGrade(e.target.value)}>
            <option value="">— اختر —</option>
            {data.licenseGrades.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.hireDate}</label><input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" disabled={submitting} onClick={handleSubmit}>{m.add}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{m.cancel}</button>
        </div>
      </div>
    </Modal>
  )
}

export function EditVehicleModal() {
  const { editingVehicle, updateVehicle, closeModal, data, setEditingVehicle } = useApp()
  const [plate, setPlate] = useState(editingVehicle?.plateNumber ?? "")
  const [year, setYear] = useState(String(editingVehicle?.year ?? ""))
  const [capacity, setCapacity] = useState(String(editingVehicle?.capacity ?? ""))
  const [vehicleTypeId, setVehicleTypeId] = useState<number | string>(editingVehicle?.vehicleTypeId ?? "")
  const [driverId, setDriverId] = useState<number | string>(editingVehicle?.driverId ?? "")
  const [chassis, setChassis] = useState(editingVehicle?.chassisNumber ?? "")
  const [engine, setEngine] = useState(editingVehicle?.engineNumber ?? "")
  const [hasGps, setHasGps] = useState(editingVehicle?.hasGps ?? false)
  const [fuelConsumption, setFuelConsumption] = useState(editingVehicle?.fuelConsumption != null ? String(editingVehicle.fuelConsumption) : "")
  const [licenseDate, setLicenseDate] = useState(editingVehicle?.licenseDate ?? "")
  const [licenseExpiry, setLicenseExpiry] = useState(editingVehicle?.licenseExpiryDate ?? "")
  const [ownerName, setOwnerName] = useState(editingVehicle?.ownerName ?? "")
  const [licenseType, setLicenseType] = useState(editingVehicle?.licenseType ?? "")
  const [purchaseDate, setPurchaseDate] = useState(editingVehicle?.purchaseDate ?? "")
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!editingVehicle) return
    setPlate(editingVehicle.plateNumber ?? "")
    setYear(String(editingVehicle.year ?? ""))
    setCapacity(String(editingVehicle.capacity ?? ""))
    setVehicleTypeId(editingVehicle.vehicleTypeId ?? "")
    setDriverId(editingVehicle.driverId ?? "")
    setChassis(editingVehicle.chassisNumber ?? "")
    setEngine(editingVehicle.engineNumber ?? "")
    setHasGps(editingVehicle.hasGps ?? false)
    setFuelConsumption(editingVehicle.fuelConsumption != null ? String(editingVehicle.fuelConsumption) : "")
    setLicenseDate(editingVehicle.licenseDate ?? "")
    setLicenseExpiry(editingVehicle.licenseExpiryDate ?? "")
    setOwnerName(editingVehicle.ownerName ?? "")
    setLicenseType(editingVehicle.licenseType ?? "")
    setPurchaseDate(editingVehicle.purchaseDate ?? "")
    setErrors([])
  }, [editingVehicle])

  const fieldError = (f: string) => errors.includes(f)

  if (!editingVehicle) return null

  const handleSubmit = async () => {
    if (!plate || !year) return
    setErrors([])
    const vt = vehicleTypeId !== "" ? data.vehicleTypes.find((t) => t.id === Number(vehicleTypeId)) : null
    const driver = driverId !== "" ? data.drivers.find((d) => d.id === Number(driverId)) : null
    try {
      await updateVehicle(editingVehicle.id, {
        plateNumber: plate, model: vt ? `${vt.code} - ${vt.model}` : "", year: parseInt(year),
        capacity: parseFloat(capacity) || 0, vehicleType: vt?.name ?? "",
        vehicleTypeId: vt?.id ?? null,
        driverId: driver?.id ?? null, driverName: driver?.fullName ?? "",
        chassisNumber: chassis, engineNumber: engine,
        hasGps, fuelConsumption: fuelConsumption ? parseFloat(fuelConsumption) : null,
        licenseDate, licenseExpiryDate: licenseExpiry,
        ownerName, licenseType, purchaseDate,
      })
      setEditingVehicle(null); closeModal()
    } catch (e: any) {
      if (e.status === 409) setErrors(e.fields ?? [])
    }
  }

  return (
    <Modal title={m.editVehicle} id="editVehicleModal">
      <div className="space-y-4">
        <div><label className={`text-xs mb-1 block ${fieldError("plateNumber") ? "text-danger" : "text-muted"}`}>{m.plateNumber}</label><input type="text" placeholder="م ك ل 1 2 3" value={plate} onChange={(e) => { setPlate(formatPlate(e.target.value)); setErrors([]) }} className={fieldError("plateNumber") ? "!border-danger" : ""} />{fieldError("plateNumber") && <span className="text-xs text-danger mt-0.5 block">رقم اللوحة موجود مسبقاً</span>}</div>
        <div className="grid grid-cols-4 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.year}</label><input type="number" value={year} onChange={(e) => setYear(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.capacity}</label><input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.fuelConsumption}</label><input type="number" step="0.1" placeholder="15 L/100KM" value={fuelConsumption} onChange={(e) => setFuelConsumption(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.type}</label>
            <select value={vehicleTypeId} onChange={(e) => setVehicleTypeId(e.target.value)}>
              <option value="">{m.selectType}</option>
              {data.vehicleTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={`text-xs mb-1 block ${fieldError("chassisNumber") ? "text-danger" : "text-muted"}`}>{m.chassisNumber}</label><input type="text" value={chassis} onChange={(e) => { setChassis(e.target.value); setErrors([]) }} className={fieldError("chassisNumber") ? "!border-danger" : ""} />{fieldError("chassisNumber") && <span className="text-xs text-danger mt-0.5 block">رقم الشاسية موجود مسبقاً</span>}</div>
          <div><label className={`text-xs mb-1 block ${fieldError("engineNumber") ? "text-danger" : "text-muted"}`}>{m.engineNumber}</label><input type="text" value={engine} onChange={(e) => { setEngine(e.target.value); setErrors([]) }} className={fieldError("engineNumber") ? "!border-danger" : ""} />{fieldError("engineNumber") && <span className="text-xs text-danger mt-0.5 block">رقم الماتور موجود مسبقاً</span>}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.ownerName}</label><input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.licenseType}</label><input type="text" value={licenseType} onChange={(e) => setLicenseType(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.licenseDate}</label><input type="date" value={licenseDate} onChange={(e) => setLicenseDate(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.licenseExpiry}</label><input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{m.purchaseDate}</label><input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} /></div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="editGps" checked={hasGps} onChange={(e) => setHasGps(e.target.checked)} className="w-4 h-4" />
          <label htmlFor="editGps" className="text-xs text-muted">{m.gps}</label>
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
  const { editingDriver, updateDriver, closeModal, setEditingDriver, data } = useApp()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [licenseGrade, setLicenseGrade] = useState("")
  const [insuranceNumber, setInsuranceNumber] = useState("")
  const [salary, setSalary] = useState("")
  const [hireDate, setHireDate] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!editingDriver) return
    setFullName(editingDriver.fullName)
    setPhone(editingDriver.phone)
    setNationalId(editingDriver.nationalId ?? "")
    setLicenseGrade(editingDriver.licenseGrade)
    setInsuranceNumber(editingDriver.insuranceNumber ?? "")
    setSalary(editingDriver.salary ?? "")
    setHireDate(editingDriver.hireDate ?? "")
    setErrors([])
  }, [editingDriver])

  if (!editingDriver) return null

  const fieldError = (f: string) => errors.includes(f)

  const handleSubmit = async () => {
    if (!fullName || !phone) return
    setErrors([])
    setSubmitting(true)
    try {
      await updateDriver(editingDriver.id, { fullName, phone, nationalId, licenseGrade, insuranceNumber: insuranceNumber || undefined, salary: salary || undefined, hireDate: hireDate || undefined })
      setEditingDriver(null); closeModal()
    } catch (e: any) {
      if (e.status === 409 && e.fields) setErrors(e.fields)
      else setErrors(["phone"])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={m.editDriver} id="editDriverModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{m.fullName}</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={`text-xs mb-1 block ${fieldError("phone") ? "text-danger" : "text-muted"}`}>{m.phone}</label><input type="text" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors([]) }} className={fieldError("phone") ? "!border-danger" : ""} />{fieldError("phone") && <span className="text-xs text-danger mt-0.5 block">رقم الهاتف موجود مسبقاً</span>}</div>
          <div><label className={`text-xs mb-1 block ${fieldError("nationalId") ? "text-danger" : "text-muted"}`}>{m.nationalId}</label><input type="text" value={nationalId} onChange={(e) => { setNationalId(e.target.value); setErrors([]) }} className={fieldError("nationalId") ? "!border-danger" : ""} />{fieldError("nationalId") && <span className="text-xs text-danger mt-0.5 block">الرقم القومي موجود مسبقاً</span>}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={`text-xs mb-1 block ${fieldError("insuranceNumber") ? "text-danger" : "text-muted"}`}>{m.insuranceNumber}</label><input type="text" value={insuranceNumber} onChange={(e) => { setInsuranceNumber(e.target.value); setErrors([]) }} className={fieldError("insuranceNumber") ? "!border-danger" : ""} />{fieldError("insuranceNumber") && <span className="text-xs text-danger mt-0.5 block">رقم التأمين موجود مسبقاً</span>}</div>
          <div><label className="text-xs text-muted mb-1 block">{m.salary}</label><input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.licenseGrade}</label>
          <select value={licenseGrade} onChange={(e) => setLicenseGrade(e.target.value)}>
            <option value="">— اختر —</option>
            {data.licenseGrades.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{m.hireDate}</label><input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" disabled={submitting} onClick={handleSubmit}>{m.save}</button>
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

export function AddLicenseGradeModal() {
  const { addLicenseGrade, closeModal } = useApp()
  const [name, setName] = useState("")

  const handleSubmit = () => {
    if (!name) return
    addLicenseGrade({ name })
    setName("")
    closeModal()
  }

  return (
    <Modal title={l.addLicenseGrade} id="addLicenseGradeModal">
      <div className="space-y-4">
        <div><label className="text-xs text-muted mb-1 block">{l.licenseGradeName}</label><input type="text" placeholder="أولى" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{m.add}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={closeModal}>{m.cancel}</button>
        </div>
      </div>
    </Modal>
  )
}

export function EditLicenseGradeModal() {
  const { editingLicenseGrade, updateLicenseGrade, closeModal, setEditingLicenseGrade } = useApp()
  const [name, setName] = useState(editingLicenseGrade?.name ?? "")

  if (!editingLicenseGrade) return null

  const handleSubmit = () => {
    if (!name) return
    updateLicenseGrade(editingLicenseGrade.id, { name })
    setEditingLicenseGrade(null); closeModal()
  }

  return (
    <Modal title={l.editLicenseGrade} id="editLicenseGradeModal">
      <div className="space-y-4">
        <div><label className="text-xs text-muted mb-1 block">{l.licenseGradeName}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-2 rounded-lg text-sm" onClick={handleSubmit}>{m.save}</button>
          <button className="btn-ghost flex-1 py-2 rounded-lg text-sm" onClick={() => { setEditingLicenseGrade(null); closeModal() }}>{m.cancel}</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddSupplierModal() {
  const { addSupplier, closeModal } = useApp()
  const [name, setName] = useState("")
  const [taxNumber, setTaxNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name || saving) return
    setSaving(true)
    try {
      await addSupplier({ name, taxNumber, phone, notes })
      closeModal()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={sup.add} id="add-supplier">
      <div className="space-y-4">
        <div><label className="text-xs text-muted mb-1 block">{sup.name} *</label><input type="text" className="p-3 rounded-xl text-white" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{sup.taxNumber}</label><input type="text" className="p-3 rounded-xl text-white" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{sup.phone}</label><input type="text" className="p-3 rounded-xl text-white" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{sup.notes}</label><textarea className="w-full bg-bg border border-border p-3 rounded-xl text-white outline-none focus:border-accent transition-colors resize-none" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-3 rounded-xl text-sm text-white" onClick={handleSubmit} disabled={saving}>{saving ? "..." : sup.add}</button>
          <button className="btn-ghost flex-1 py-3 rounded-xl text-sm" onClick={closeModal}>{m.cancel}</button>
        </div>
      </div>
    </Modal>
  )
}

export function EditSupplierModal() {
  const { editingSupplier, updateSupplier, closeModal, setEditingSupplier } = useApp()
  const [name, setName] = useState(editingSupplier?.name ?? "")
  const [taxNumber, setTaxNumber] = useState(editingSupplier?.taxNumber ?? "")
  const [phone, setPhone] = useState(editingSupplier?.phone ?? "")
  const [notes, setNotes] = useState(editingSupplier?.notes ?? "")
  const [saving, setSaving] = useState(false)

  if (!editingSupplier) return null

  const handleSubmit = async () => {
    if (!name || saving) return
    setSaving(true)
    try {
      await updateSupplier(editingSupplier.id, { name, taxNumber, phone, notes })
      setEditingSupplier(null); closeModal()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={sup.edit} id="edit-supplier">
      <div className="space-y-4">
        <div><label className="text-xs text-muted mb-1 block">{sup.name} *</label><input type="text" className="p-3 rounded-xl text-white" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{sup.taxNumber}</label><input type="text" className="p-3 rounded-xl text-white" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{sup.phone}</label><input type="text" className="p-3 rounded-xl text-white" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{sup.notes}</label><textarea className="w-full bg-bg border border-border p-3 rounded-xl text-white outline-none focus:border-accent transition-colors resize-none" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-3 rounded-xl text-white text-sm" onClick={handleSubmit} disabled={saving}>{saving ? "..." : sup.edit}</button>
          <button className="btn-ghost flex-1 py-3 rounded-xl text-sm" onClick={() => { setEditingSupplier(null); closeModal() }}>{m.cancel}</button>
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

export function AddMaintenanceTypeModal() {
  const { addMaintenanceType, closeModal } = useApp()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name || saving) return
    setSaving(true)
    try {
      await addMaintenanceType({ name })
      closeModal()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={mt.addType} id="addMaintenanceTypeModal">
      <div className="space-y-4">
        <div><label className="text-xs text-muted mb-1 block">{mt.typeName} *</label><input className="p-3 rounded-xl text-white" type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-3 rounded-xl text-white text-sm" onClick={handleSubmit} disabled={saving}>{saving ? "..." : mt.addType}</button>
          <button className="btn-ghost flex-1 py-3 rounded-xl text-sm" onClick={closeModal}>{ar.maintenanceModals.cancel}</button>
        </div>
      </div>
    </Modal>
  )
}

export function EditMaintenanceTypeModal() {
  const { editingMaintenanceType, updateMaintenanceType, closeModal, setEditingMaintenanceType } = useApp()
  const [name, setName] = useState(editingMaintenanceType?.name ?? "")
  const [saving, setSaving] = useState(false)

  if (!editingMaintenanceType) return null

  const handleSubmit = async () => {
    if (!name || saving) return
    setSaving(true)
    try {
      await updateMaintenanceType(editingMaintenanceType.id, { name })
      setEditingMaintenanceType(null); closeModal()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={mt.editType} id="editMaintenanceTypeModal">
      <div className="space-y-4">
        <div><label className="text-xs text-muted mb-1 block">{mt.typeName} *</label><input className="p-3 rounded-xl text-white" type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-3 rounded-xl text-white text-sm" onClick={handleSubmit} disabled={saving}>{saving ? "..." : ar.maintenanceModals.save}</button>
          <button className="btn-ghost flex-1 py-3 rounded-xl text-sm" onClick={() => { setEditingMaintenanceType(null); closeModal() }}>{ar.maintenanceModals.cancel}</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddMaintenanceModal() {
  const { addMaintenance, closeModal, data } = useApp()
  const [vehicleId, setVehicleId] = useState<number | string>("")
  const [plateNumber, setPlateNumber] = useState("")
  const [vehicleCode, setVehicleCode] = useState<number | null>(null)
  const [maintenanceDate, setMaintenanceDate] = useState("")
  const [supplierId, setSupplierId] = useState<number | string>("")
  const [supplierName, setSupplierName] = useState("")
  const [supplierCode, setSupplierCode] = useState<number | null>(null)
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [maintenanceTypeId, setMaintenanceTypeId] = useState<number | string>("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const handleVehicleChange = (id: number | string) => {
    setVehicleId(id)
    const vehicle = data.vehicles.find((v) => v.id === Number(id))
    setPlateNumber(vehicle?.plateNumber ?? "")
    setVehicleCode(vehicle?.code ?? null)
  }

  const handleSupplierChange = (id: number | string) => {
    setSupplierId(id)
    const supplier = data.suppliers.find((s) => s.id === Number(id))
    setSupplierName(supplier?.name ?? "")
    setSupplierCode(supplier?.code ?? null)
  }

  const handleSubmit = async () => {
    if (!plateNumber || !maintenanceDate || !supplierName || saving) return
    setSaving(true)
    try {
      await addMaintenance({
        plateNumber, maintenanceDate,
        vehicleId: vehicleId !== "" ? Number(vehicleId) : null,
        vehicleCode,
        supplierId: supplierId !== "" ? Number(supplierId) : null,
        supplierName, supplierCode,
        invoiceNumber,
        maintenanceTypeId: maintenanceTypeId !== "" ? Number(maintenanceTypeId) : null,
        notes,
      })
      closeModal()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={mt.add} id="addMaintenanceModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mt.plateNumber} *</label>
            <select className="p-3 rounded-xl text-white" value={vehicleId} onChange={(e) => handleVehicleChange(e.target.value)}>
              <option value="">-- اختر مركبة --</option>
              {data.vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber} ({v.code})</option>)}
            </select>
          </div>
          <div><label className="text-xs text-muted mb-1 block">{mt.maintenanceDate} *</label><input className="p-3 rounded-xl text-white" type="date" value={maintenanceDate} onChange={(e) => setMaintenanceDate(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{mt.supplierName} *</label>
          <select className="p-3 rounded-xl text-white" value={supplierId} onChange={(e) => handleSupplierChange(e.target.value)}>
            <option value="">-- اختر مورد --</option>
            {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mt.invoiceNumber}</label><input className="p-3 rounded-xl text-white" type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{mt.maintenanceType}</label>
            <select className="p-3 rounded-xl text-white" value={maintenanceTypeId} onChange={(e) => setMaintenanceTypeId(e.target.value)}>
              <option value="">-- اختر نوع --</option>
              {data.maintenanceTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{mt.notes}</label><textarea className="w-full bg-bg border border-border p-3 rounded-xl text-white outline-none focus:border-accent transition-colors resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-3 rounded-xl text-white text-sm" onClick={handleSubmit} disabled={saving}>{saving ? "..." : mt.add}</button>
          <button className="btn-ghost flex-1 py-3 rounded-xl text-sm" onClick={closeModal}>{ar.maintenanceModals.cancel}</button>
        </div>
      </div>
    </Modal>
  )
}

export function EditMaintenanceModal() {
  const { editingMaintenance, updateMaintenance, closeModal, setEditingMaintenance, data } = useApp()
  const [vehicleId, setVehicleId] = useState<number | string>(editingMaintenance?.vehicleId ?? "")
  const [plateNumber, setPlateNumber] = useState(editingMaintenance?.plateNumber ?? "")
  const [vehicleCode, setVehicleCode] = useState<number | null>(editingMaintenance?.vehicleCode ?? null)
  const [maintenanceDate, setMaintenanceDate] = useState(editingMaintenance?.maintenanceDate ?? "")
  const [supplierId, setSupplierId] = useState<number | string>(editingMaintenance?.supplierId ?? "")
  const [supplierName, setSupplierName] = useState(editingMaintenance?.supplierName ?? "")
  const [supplierCode, setSupplierCode] = useState<number | null>(editingMaintenance?.supplierCode ?? null)
  const [invoiceNumber, setInvoiceNumber] = useState(editingMaintenance?.invoiceNumber ?? "")
  const [maintenanceTypeId, setMaintenanceTypeId] = useState<number | string>(editingMaintenance?.maintenanceTypeId ?? "")
  const [notes, setNotes] = useState(editingMaintenance?.notes ?? "")
  const [saving, setSaving] = useState(false)

  if (!editingMaintenance) return null

  const handleVehicleChange = (id: number | string) => {
    setVehicleId(id)
    const vehicle = data.vehicles.find((v) => v.id === Number(id))
    setPlateNumber(vehicle?.plateNumber ?? "")
    setVehicleCode(vehicle?.code ?? null)
  }

  const handleSupplierChange = (id: number | string) => {
    setSupplierId(id)
    const supplier = data.suppliers.find((s) => s.id === Number(id))
    setSupplierName(supplier?.name ?? "")
    setSupplierCode(supplier?.code ?? null)
  }

  const handleSubmit = async () => {
    if (!plateNumber || !maintenanceDate || !supplierName || saving) return
    setSaving(true)
    try {
      await updateMaintenance(editingMaintenance.id, {
        plateNumber, maintenanceDate,
        vehicleId: vehicleId !== "" ? Number(vehicleId) : null,
        vehicleCode,
        supplierId: supplierId !== "" ? Number(supplierId) : null,
        supplierName, supplierCode,
        invoiceNumber,
        maintenanceTypeId: maintenanceTypeId !== "" ? Number(maintenanceTypeId) : null,
        notes,
      })
      setEditingMaintenance(null); closeModal()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={mt.edit} id="editMaintenanceModal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mt.plateNumber} *</label>
            <select className="p-3 rounded-xl text-white" value={vehicleId} onChange={(e) => handleVehicleChange(e.target.value)}>
              <option value="">-- اختر مركبة --</option>
              {data.vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber} ({v.code})</option>)}
            </select>
          </div>
          <div><label className="text-xs text-muted mb-1 block">{mt.maintenanceDate} *</label><input className="p-3 rounded-xl text-white" type="date" value={maintenanceDate} onChange={(e) => setMaintenanceDate(e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{mt.supplierName} *</label>
          <select className="p-3 rounded-xl text-white" value={supplierId} onChange={(e) => handleSupplierChange(e.target.value)}>
            <option value="">-- اختر مورد --</option>
            {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted mb-1 block">{mt.invoiceNumber}</label><input className="p-3 rounded-xl text-white" type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></div>
          <div><label className="text-xs text-muted mb-1 block">{mt.maintenanceType}</label>
            <select className="p-3 rounded-xl text-white" value={maintenanceTypeId} onChange={(e) => setMaintenanceTypeId(e.target.value)}>
              <option value="">-- اختر نوع --</option>
              {data.maintenanceTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div><label className="text-xs text-muted mb-1 block">{mt.notes}</label><textarea className="w-full bg-bg border border-border p-3 rounded-xl text-white outline-none focus:border-accent transition-colors resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1 py-3 rounded-xl text-white text-sm" onClick={handleSubmit} disabled={saving}>{saving ? "..." : ar.maintenanceModals.save}</button>
          <button className="btn-ghost flex-1 py-3 rounded-xl text-sm" onClick={() => { setEditingMaintenance(null); closeModal() }}>{ar.maintenanceModals.cancel}</button>
        </div>
      </div>
    </Modal>
  )
}
