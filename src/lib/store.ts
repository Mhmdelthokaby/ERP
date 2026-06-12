export interface VehicleType {
  id: number; name: string; code: string; model: string; modelCode: string
}

export interface Vehicle {
  id: number; code: string; plateNumber: string; model: string; year: number
  capacity: number; status: string; vehicleType: string
  vehicleTypeId: number | null; driverId: number | null; driverName: string
}

export interface Driver {
  id: number; code: string; fullName: string; phone: string; nationalId: string
  licenseGrade: string; isActive: boolean
}

export interface VehicleHistoryEntry {
  id: number; plateNumber: string; engineNumber: string | null
  licenseDate: string | null; licenseExpiryDate: string | null
  licenseType: string | null; isActive: boolean | null
  modifiedAt: string; modifiedBy: string | null
}

export interface Trip {
  id: number; from: string; to: string; customer: string
  vehicle: string; driver: string; date: string
  price: number; priceBase: number; status: string
}

export interface VehicleExpense {
  id: number; vehicle: string; type: string; amount: number
  date: string; method: string; notes: string
}

export interface Currency {
  id: number; code: string; name: string; rate: number; isBase: boolean
}

export interface JournalLine {
  account: string; debit: number; credit: number
}

export interface JournalEntry {
  id: number; number: string; date: string; desc: string
  source: string; debit: number; credit: number
  reversed: boolean; lines: JournalLine[]
}

export interface ArInvoice {
  id: number; number: string; customer: string; date: string
  due: string; total: number; paid: number; status: string
}

export interface ApInvoice {
  id: number; number: string; supplier: string; date: string
  total: number; paid: number; status: string
}

export interface User {
  id: number; code: string; name: string; email: string
  role: string; lastLogin: string | null; isActive: boolean
}

export interface OutboxMessage {
  id: number; event: string; status: string
  retries: number; occurred: string; error: string | null
}

export interface AuditLog {
  ts: string; user: string; table: string
  action: string; detail: string
}

export interface CoaNode {
  code: string; name: string; type: string; nb: string
  children: CoaNode[]
}

export interface Period {
  name: string; type: string; start: string; end: string; closed: boolean
}

export interface CostCenter {
  name: string; type: string; active: boolean
}

export interface AppData {
  vehicleTypes: VehicleType[]
  vehicles: Vehicle[]
  drivers: Driver[]
  vehicleHistory: Record<number, VehicleHistoryEntry[]>
  trips: Trip[]
  vehicleExpenses: VehicleExpense[]
  currencies: Currency[]
  journalEntries: JournalEntry[]
  arInvoices: ArInvoice[]
  apInvoices: ApInvoice[]
  users: User[]
  outboxMessages: OutboxMessage[]
  auditLogs: AuditLog[]
  chartOfAccounts: CoaNode[]
  nextJeNumber: number
}

export const defaultData: AppData = {
  vehicleTypes: [
    { id: 1, name: 'Bus', code: 'BUS', model: 'Hiace/Sprinter', modelCode: 'HS' },
    { id: 2, name: 'Van', code: 'VAN', model: 'L300/Transit', modelCode: 'LT' },
    { id: 3, name: 'Truck', code: 'TRK', model: 'Actros/FH', modelCode: 'AF' },
  ],
  vehicles: [
    { id: 1, code: 'VHC-001', plateNumber: 'ABC-1234', model: 'Toyota Hiace', year: 2022, capacity: 20, status: 'Active', vehicleType: 'Bus', vehicleTypeId: 1, driverId: null, driverName: '' },
    { id: 2, code: 'VHC-002', plateNumber: 'XYZ-5678', model: 'Mercedes Sprinter', year: 2021, capacity: 25, status: 'Active', vehicleType: 'Bus', vehicleTypeId: 1, driverId: null, driverName: '' },
    { id: 3, code: 'VHC-003', plateNumber: 'DEF-9012', model: 'Mitsubishi L300', year: 2020, capacity: 18, status: 'Maintenance', vehicleType: 'Van', vehicleTypeId: 2, driverId: null, driverName: '' },
    { id: 4, code: 'VHC-004', plateNumber: 'GHI-3456', model: 'Nissan Urvan', year: 2023, capacity: 22, status: 'Active', vehicleType: 'Bus', vehicleTypeId: 1, driverId: null, driverName: '' },
    { id: 5, code: 'VHC-005', plateNumber: 'JKL-7890', model: 'Ford Transit', year: 2019, capacity: 20, status: 'Active', vehicleType: 'Van', vehicleTypeId: 2, driverId: null, driverName: '' },
    { id: 6, code: 'VHC-006', plateNumber: 'MNO-2345', model: 'Iveco Daily', year: 2023, capacity: 24, status: 'Inactive', vehicleType: 'Truck', vehicleTypeId: 3, driverId: null, driverName: '' },
  ],
  vehicleHistory: {},
  drivers: [
    { id: 1, code: 'DRV-001', fullName: 'Ahmed Hassan', phone: '01012345678', nationalId: '29801012345678', licenseGrade: 'A', isActive: true },
    { id: 2, code: 'DRV-002', fullName: 'Mohamed Khalil', phone: '01098765432', nationalId: '29001012345679', licenseGrade: 'B', isActive: true },
    { id: 3, code: 'DRV-003', fullName: 'Sayed Ali', phone: '01155544433', nationalId: '29201012345680', licenseGrade: 'A', isActive: true },
    { id: 4, code: 'DRV-004', fullName: 'Walid Ramzi', phone: '01233322211', nationalId: '28801012345681', licenseGrade: 'C', isActive: false },
  ],
  trips: [
    { id: 42, from: 'Cairo', to: 'Alexandria', customer: 'ABC Transport Corp', vehicle: 'ABC-1234', driver: 'Ahmed Hassan', date: '2024-03-15', price: 50000, priceBase: 50000, status: 'Completed' },
    { id: 43, from: 'Cairo', to: 'Aswan', customer: 'Nile Tourism', vehicle: 'XYZ-5678', driver: 'Mohamed Khalil', date: '2024-03-18', price: 85000, priceBase: 85000, status: 'Completed' },
    { id: 44, from: 'Giza', to: 'Port Said', customer: 'Gulf Logistics', vehicle: 'GHI-3456', driver: 'Sayed Ali', date: '2024-03-22', price: 42000, priceBase: 42000, status: 'InProgress' },
    { id: 45, from: 'Cairo', to: 'Luxor', customer: 'Nile Tourism', vehicle: 'DEF-9012', driver: 'Ahmed Hassan', date: '2024-03-25', price: 95000, priceBase: 95000, status: 'Pending' },
    { id: 46, from: 'Alexandria', to: 'Marsa Alam', customer: 'Delta Cargo', vehicle: 'JKL-7890', driver: 'Mohamed Khalil', date: '2024-03-26', price: 120000, priceBase: 120000, status: 'Pending' },
    { id: 47, from: 'Cairo', to: 'Suez', customer: 'ABC Transport Corp', vehicle: 'ABC-1234', driver: 'Sayed Ali', date: '2024-03-20', price: 28000, priceBase: 28000, status: 'InProgress' },
    { id: 48, from: 'Cairo', to: 'Alexandria', customer: 'Gulf Logistics', vehicle: 'XYZ-5678', driver: 'Ahmed Hassan', date: '2024-03-10', price: 48000, priceBase: 48000, status: 'Completed' },
    { id: 49, from: 'Giza', to: 'Damietta', customer: 'Delta Cargo', vehicle: 'GHI-3456', driver: 'Mohamed Khalil', date: '2024-03-28', price: 35000, priceBase: 35000, status: 'Pending' },
  ],
  vehicleExpenses: [
    { id: 1, vehicle: 'ABC-1234', type: 'Fuel', amount: 3500, date: '2024-03-15', method: 'Cash', notes: 'Full tank before trip' },
    { id: 2, vehicle: 'XYZ-5678', type: 'Fuel', amount: 5200, date: '2024-03-17', method: 'Bank', notes: '' },
    { id: 3, vehicle: 'DEF-9012', type: 'Maintenance', amount: 12500, date: '2024-03-12', method: 'Bank', notes: 'Engine overhaul' },
    { id: 4, vehicle: 'GHI-3456', type: 'Tires', amount: 8400, date: '2024-03-20', method: 'Bank', notes: '4 new tires' },
    { id: 5, vehicle: 'ABC-1234', type: 'Tolls', amount: 450, date: '2024-03-15', method: 'Cash', notes: 'Cairo-Alex tolls' },
    { id: 6, vehicle: 'JKL-7890', type: 'Oil', amount: 1800, date: '2024-03-18', method: 'Cash', notes: 'Oil change + filters' },
  ],
  currencies: [
    { id: 1, code: 'EGP', name: 'Egyptian Pound', rate: 1, isBase: true },
    { id: 2, code: 'USD', name: 'US Dollar', rate: 31.00, isBase: false },
    { id: 3, code: 'EUR', name: 'Euro', rate: 34.00, isBase: false },
  ],
  journalEntries: [
    { id: 1, number: 'JE-2024-00042', date: '2024-03-15', desc: 'Trip #42 · Cairo → Alexandria · ABC Transport Corp', source: 'TripCompleted', debit: 50000, credit: 50000, reversed: false, lines: [{ account: '1200 - Accounts Receivable', debit: 50000, credit: 0 }, { account: '4100 - Transportation Revenue', debit: 0, credit: 50000 }] },
    { id: 2, number: 'JE-2024-00043', date: '2024-03-18', desc: 'Trip #43 · Cairo → Aswan · Nile Tourism', source: 'TripCompleted', debit: 85000, credit: 85000, reversed: false, lines: [{ account: '1200 - Accounts Receivable', debit: 85000, credit: 0 }, { account: '4100 - Transportation Revenue', debit: 0, credit: 85000 }] },
    { id: 3, number: 'JE-2024-00044', date: '2024-03-16', desc: 'Fuel Expense · Vehicle ABC-1234', source: 'ExpenseRecorded', debit: 3500, credit: 3500, reversed: false, lines: [{ account: '5100 - Fuel Expense', debit: 3500, credit: 0 }, { account: '1100 - Cash on Hand', debit: 0, credit: 3500 }] },
    { id: 4, number: 'JE-2024-00045', date: '2024-03-20', desc: 'Payment · INV-2024-042 · ABC Transport Corp', source: 'PaymentReceived', debit: 50000, credit: 50000, reversed: false, lines: [{ account: '1101 - Cash at Bank', debit: 50000, credit: 0 }, { account: '1200 - Accounts Receivable', debit: 0, credit: 50000 }] },
    { id: 5, number: 'JE-2024-00046', date: '2024-03-19', desc: 'Manual: Office supplies correction', source: 'Manual', debit: 2500, credit: 2500, reversed: false, lines: [{ account: '5800 - Administrative Expense', debit: 2500, credit: 0 }, { account: '1100 - Cash on Hand', debit: 0, credit: 2500 }] },
    { id: 6, number: 'JE-2024-00047', date: '2024-03-21', desc: 'Reversal of JE-2024-00046', source: 'Reversal', debit: 2500, credit: 2500, reversed: false, lines: [{ account: '1100 - Cash on Hand', debit: 2500, credit: 0 }, { account: '5800 - Administrative Expense', debit: 0, credit: 2500 }] },
  ],
  arInvoices: [
    { id: 1, number: 'INV-2024-042', customer: 'ABC Transport Corp', date: '2024-03-15', due: '2024-04-14', total: 50000, paid: 50000, status: 'Paid' },
    { id: 2, number: 'INV-2024-043', customer: 'Nile Tourism', date: '2024-03-18', due: '2024-04-17', total: 85000, paid: 0, status: 'Posted' },
    { id: 3, number: 'INV-2024-044', customer: 'Gulf Logistics', date: '2024-03-22', due: '2024-04-21', total: 42000, paid: 20000, status: 'PartiallyPaid' },
    { id: 4, number: 'INV-2024-045', customer: 'Delta Cargo', date: '2024-03-10', due: '2024-04-09', total: 48000, paid: 0, status: 'Posted' },
  ],
  apInvoices: [
    { id: 1, number: 'SUP-2024-012', supplier: 'Cairo Fuel Station', date: '2024-03-15', total: 8700, paid: 8700, status: 'Paid' },
    { id: 2, number: 'SUP-2024-013', supplier: 'El-Mansoura Tires Co', date: '2024-03-20', total: 8400, paid: 0, status: 'Posted' },
    { id: 3, number: 'SUP-2024-014', supplier: 'Giza Workshop', date: '2024-03-12', total: 12500, paid: 6000, status: 'PartiallyPaid' },
  ],
  users: [
    { id: 1, code: 'USR-001', name: 'Mohamed Emad', email: 'mohamed@transerp.com', role: 'Admin', lastLogin: '2024-03-25 09:15', isActive: true },
    { id: 2, code: 'USR-002', name: 'Fatma Ahmed', email: 'fatma@transerp.com', role: 'Accountant', lastLogin: '2024-03-25 08:30', isActive: true },
    { id: 3, code: 'USR-003', name: 'Hassan Ibrahim', email: 'hassan@transerp.com', role: 'Operator', lastLogin: '2024-03-24 17:45', isActive: true },
    { id: 4, code: 'USR-004', name: 'Sara Magdi', email: 'sara@transerp.com', role: 'Viewer', lastLogin: '2024-03-20 11:00', isActive: true },
    { id: 5, code: 'USR-005', name: 'Omar Youssef', email: 'omar@transerp.com', role: 'Operator', lastLogin: null, isActive: false },
  ],
  outboxMessages: [
    { id: 1, event: 'TripCompleted', status: 'Processed', retries: 0, occurred: '2024-03-15 10:30', error: null },
    { id: 2, event: 'PaymentReceived', status: 'Processed', retries: 0, occurred: '2024-03-20 14:15', error: null },
    { id: 3, event: 'ExpenseRecorded', status: 'Processed', retries: 1, occurred: '2024-03-16 09:00', error: null },
    { id: 4, event: 'TripCompleted', status: 'Failed', retries: 3, occurred: '2024-03-22 16:45', error: 'Account 1200 not found or inactive' },
    { id: 5, event: 'PaymentReceived', status: 'Pending', retries: 0, occurred: '2024-03-25 11:20', error: null },
  ],
  auditLogs: [
    { ts: '2024-03-25 11:20:05', user: 'Fatma Ahmed', table: 'customerPayments', action: 'Insert', detail: 'Payment EGP 20,000 for INV-2024-044' },
    { ts: '2024-03-25 09:15:32', user: 'Mohamed Emad', table: 'users', action: 'Update', detail: 'Changed role USR-003 to Operator' },
    { ts: '2024-03-22 16:40:18', user: 'Hassan Ibrahim', table: 'operationOrders', action: 'Update', detail: 'Order #44 status: Pending → InProgress' },
    { ts: '2024-03-20 14:15:00', user: 'Fatma Ahmed', table: 'journalEntries', action: 'Insert', detail: 'JE-2024-00045 PaymentReceived' },
    { ts: '2024-03-18 10:00:45', user: 'Hassan Ibrahim', table: 'operationOrders', action: 'Update', detail: 'Order #43 status: InProgress → Completed' },
    { ts: '2024-03-15 10:30:00', user: 'System', table: 'outboxMessages', action: 'Insert', detail: 'TripCompleted event for Order #42' },
  ],
  chartOfAccounts: [
    { code: '1000', name: 'Assets', type: 'Asset', nb: 'Dr', children: [
      { code: '1100', name: 'Cash on Hand', type: 'Asset', nb: 'Dr', children: [] },
      { code: '1101', name: 'Cash at Bank', type: 'Asset', nb: 'Dr', children: [] },
      { code: '1200', name: 'Accounts Receivable', type: 'Asset', nb: 'Dr', children: [] },
      { code: '1300', name: 'Prepaid Expenses', type: 'Asset', nb: 'Dr', children: [] },
      { code: '1500', name: 'Fixed Assets', type: 'Asset', nb: 'Dr', children: [
        { code: '1510', name: 'Vehicles', type: 'Asset', nb: 'Dr', children: [] },
        { code: '1511', name: 'Accumulated Depr. (Veh.)', type: 'Asset', nb: 'Cr', children: [] },
      ]},
    ]},
    { code: '2000', name: 'Liabilities', type: 'Liability', nb: 'Cr', children: [
      { code: '2100', name: 'Accounts Payable', type: 'Liability', nb: 'Cr', children: [] },
      { code: '2200', name: 'Accrued Expenses', type: 'Liability', nb: 'Cr', children: [] },
    ]},
    { code: '3000', name: 'Equity', type: 'Equity', nb: 'Cr', children: [
      { code: '3100', name: "Owner's Capital", type: 'Equity', nb: 'Cr', children: [] },
      { code: '3200', name: 'Retained Earnings', type: 'Equity', nb: 'Cr', children: [] },
    ]},
    { code: '4000', name: 'Revenue', type: 'Revenue', nb: 'Cr', children: [
      { code: '4100', name: 'Transportation Revenue', type: 'Revenue', nb: 'Cr', children: [] },
      { code: '4200', name: 'Tourism Revenue', type: 'Revenue', nb: 'Cr', children: [] },
    ]},
    { code: '5000', name: 'Expenses', type: 'Expense', nb: 'Dr', children: [
      { code: '5100', name: 'Fuel Expense', type: 'Expense', nb: 'Dr', children: [] },
      { code: '5200', name: 'Maintenance Expense', type: 'Expense', nb: 'Dr', children: [] },
      { code: '5300', name: 'Tires Expense', type: 'Expense', nb: 'Dr', children: [] },
      { code: '5400', name: 'Oil & Lubricants', type: 'Expense', nb: 'Dr', children: [] },
      { code: '5500', name: 'Tolls & Permits', type: 'Expense', nb: 'Dr', children: [] },
      { code: '5600', name: 'Driver Wages', type: 'Expense', nb: 'Dr', children: [] },
      { code: '5800', name: 'Administrative Expense', type: 'Expense', nb: 'Dr', children: [] },
    ]},
  ],
  nextJeNumber: 48,
}

export const periods: Period[] = [
  { name: 'Opening FY2024', type: 'Opening', start: '2024-01-01', end: '2024-01-01', closed: true },
  { name: 'January 2024', type: 'Normal', start: '2024-01-01', end: '2024-01-31', closed: true },
  { name: 'February 2024', type: 'Normal', start: '2024-02-01', end: '2024-02-29', closed: true },
  { name: 'March 2024', type: 'Normal', start: '2024-03-01', end: '2024-03-31', closed: false },
  { name: 'April 2024', type: 'Normal', start: '2024-04-01', end: '2024-04-30', closed: false },
]

export const costCenters: CostCenter[] = [
  { name: 'Cairo-Alex Route', type: 'Route', active: true },
  { name: 'Cairo-Aswan Route', type: 'Route', active: true },
  { name: 'ABC-1234 Vehicle', type: 'Vehicle', active: true },
  { name: 'XYZ-5678 Vehicle', type: 'Vehicle', active: true },
  { name: 'Administration', type: 'Admin', active: true },
]

export type PageName = 'dashboard' | 'fleet' | 'trips' | 'expenses' | 'accounting' | 'arap' | 'reports' | 'settings'

export const pageTitles: Record<PageName, [string, string]> = {
  dashboard: ['Dashboard', '/ Overview'],
  fleet: ['Fleet Management', '/ Vehicles & Drivers'],
  trips: ['Operations', '/ Trip Orders'],
  expenses: ['Expenses', '/ Vehicle & Trip Costs'],
  accounting: ['Accounting', '/ Ledger & CoA'],
  arap: ['AR / AP', '/ Invoices & Payments'],
  reports: ['Financial Reports', '/ Statements & Analysis'],
  settings: ['Settings', '/ System Configuration'],
}

export function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}
