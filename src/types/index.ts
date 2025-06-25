export interface Vehicle {
  id: number
  plateNumber: string
  type: string
  model: string
  year: number
  driver?: string
  team: string
  status: 'active' | 'maintenance' | 'inspection' | 'breakdown'
  lastInspection: Date
  nextInspection: Date
  mileage: number
  location: string
  notes?: string
}

export interface Driver {
  id: number
  name: string
  team: string
  employeeId: string
  status: 'working' | 'vacation' | 'sick' | 'available'
  assignedVehicle?: string
}

export interface InspectionSchedule {
  id: number
  vehicleId: number
  vehicleNumber: string
  type: string
  date: Date
  status: 'urgent' | 'warning' | 'normal'
  driver?: string
  team: string
}

export interface DispatchSchedule {
  id: number
  date: Date
  driverId: number
  driverName: string
  vehicleId: number
  vehicleNumber: string
  team: string
  route: {
    origin: string
    destination: string
    waypoints?: string[]
  }
  timeSlot: {
    start: string
    end: string
  }
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'urgent' | 'high' | 'normal' | 'low'
  clientInfo?: {
    name: string
    contact: string
    notes?: string
  }
  cargoInfo?: {
    type: string
    count: number
    notes?: string
  }
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface VehicleSwap {
  id: number
  scheduleId: number
  originalVehicleId: number
  newVehicleId: number
  reason: string
  swapTime: Date
  approvedBy?: string
  status: 'pending' | 'approved' | 'completed'
}

// 休暇管理システムの型定義
export interface VacationRequest {
  id: number
  driverId: number
  driverName: string
  team: string
  employeeId: string
  type: 'annual' | 'sick' | 'personal' | 'emergency'
  startDate: Date
  endDate: Date
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requestedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  reviewComments?: string
  isRecurring: boolean
  recurringPattern?: 'weekly' | 'monthly'
  recurringDays?: number[] // 0=日曜日, 1=月曜日, etc.
}

export interface VacationQuota {
  id: number
  driverId: number
  year: number
  totalDays: number
  usedDays: number
  remainingDays: number
  carryOverDays: number
}

export interface VacationSettings {
  maxVacationDaysPerYear: number
  maxConsecutiveDays: number
  minAdvanceNoticeDays: number
  maxDriversOffPerDay: {
    [team: string]: number
  }
  maxDriversOffPerWeekday: {
    [team: string]: {
      [weekday: number]: number // 0=日曜日, 1=月曜日, etc.
    }
  }
  blackoutDates: Date[] // 休暇取得不可日
  holidayDates: Date[] // 祝日
}

export interface VacationCalendar {
  date: Date
  requests: VacationRequest[]
  availableSlots: {
    [team: string]: number
  }
  isBlackout: boolean
  isHoliday: boolean
}

// 認証システムの型定義
export interface User {
  id: number
  employeeId: string
  name: string
  team: string
  role: 'admin' | 'driver'
  hashedPassword?: string
  isActive: boolean
  lastLogin?: Date
}

export interface AuthState {
  isAuthenticated: boolean
  user?: User
  token?: string
}

// 出勤管理の型定義
export interface AttendanceRecord {
  id: number
  driverId: number
  date: Date
  clockIn?: Date
  clockOut?: Date
  status: 'present' | 'absent' | 'late' | 'early_leave'
  workHours?: number
  notes?: string
  approvedBy?: number
}

// 運転手専用通知の型定義
export interface DriverNotification {
  id: number
  driverId: number
  type: 'vehicle_inspection' | 'vehicle_swap' | 'schedule_change' | 'emergency' | 'vacation_status'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  createdAt: Date
  scheduledFor?: Date
  actionRequired: boolean
  actionUrl?: string
}

// 運転手ダッシュボード用の型定義
export interface DriverDashboardData {
  todayAttendance?: AttendanceRecord
  assignedVehicle?: Vehicle
  todaySchedule: DispatchSchedule[]
  upcomingInspections: InspectionSchedule[]
  pendingVacationRequests: VacationRequest[]
  notifications: DriverNotification[]
  vacationQuota?: VacationQuota
}

// 車両関連情報表示用の型定義
export interface VehicleInformation {
  vehicle: Vehicle
  upcomingInspections: InspectionSchedule[]
  recentMaintenanceHistory: MaintenanceReport[]
  currentDriver?: Driver
  nextDriverRotation?: {
    date: Date
    nextDriver: Driver
  }
}

 