'use client'

import { useState } from 'react'
import { 
  Car, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Settings,
  Bell,
  Menu,
  X,
  TrendingUp,
  CheckCircle
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import DashboardStats from '@/components/DashboardStats'
import VehicleInspectionSchedule from '@/components/VehicleInspectionSchedule'
import DriverSchedule from '@/components/DriverSchedule'
import AlertsPanel from '@/components/AlertsPanel'
import VehicleManagement from '@/components/VehicleManagement'
import DriverManagement from '@/components/DriverManagement'
import SettingsComponent from '@/components/Settings'
import Login from '@/components/Login'
import DriverDashboard from '@/components/DriverDashboard'
import DriverVacationRequest from '@/components/DriverVacationRequest'
import DriverVehicleInfo from '@/components/DriverVehicleInfo'
import AttendanceManagement from '@/components/AttendanceManagement'
import VehicleInspectionNotificationSystem from '@/components/VehicleInspectionNotificationSystem'
import EmergencyResponseSystem from '@/components/EmergencyResponseSystem'
import VehicleAllocationSystem from '@/components/VehicleAllocationSystem'
import VisitorDriverManagement from '@/components/VisitorDriverManagement'
import { Vehicle, Driver, DispatchSchedule, VehicleSwap, User, VacationRequest, AttendanceRecord, DriverNotification } from '@/types'
import { 
  initialVehicles, 
  initialDrivers, 
  initialSchedules,
  initialVacationRequests,
  initialVacationQuotas,
  initialVacationSettings
} from '@/data/sampleData'
import DispatchScheduleManagement from '@/components/DispatchScheduleManagement'
import VacationManagement from '@/components/VacationManagement'

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState<string>('')
  const [currentView, setCurrentView] = useState('dashboard')
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [drivers, setDrivers] = useState(initialDrivers)
  const [dispatchSchedules, setDispatchSchedules] = useState(initialSchedules)
  const [vacationRequests, setVacationRequests] = useState(initialVacationRequests)
  const [vacationQuotas, setVacationQuotas] = useState(initialVacationQuotas)
  const [vacationSettings, setVacationSettings] = useState(initialVacationSettings)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [notifications, setNotifications] = useState<DriverNotification[]>([])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setLoginError('')
    // 運転手の場合は専用ダッシュボードに遷移
    if (user.role === 'driver') {
      setCurrentView('driver-dashboard')
    }
  }

  const handleLoginError = (message: string) => {
    setLoginError(message)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentView('dashboard')
  }

  // ログインしていない場合はログイン画面を表示
  if (!currentUser) {
    return (
      <div>
        <Login onLogin={handleLogin} onError={handleLoginError} />
        {loginError && (
          <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
            {loginError}
          </div>
        )}
      </div>
    )
  }

  // 運転手の場合は専用UIを表示
  if (currentUser.role === 'driver') {
    return (
      <DriverDashboard 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onAttendanceUpdate={(attendance) => {
          setAttendanceRecords(prev => {
            const existingIndex = prev.findIndex(record => 
              record.driverId === attendance.driverId && 
              record.date.toDateString() === attendance.date.toDateString()
            )
            if (existingIndex >= 0) {
              const updated = [...prev]
              updated[existingIndex] = attendance
              return updated
            } else {
              return [...prev, attendance]
            }
          })
        }}
      />
    )
  }

  // 管理者の場合は既存の管理画面を表示
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">統合管理ダッシュボード</h1>
              <div className="flex items-center space-x-4">
                <Bell className="h-6 w-6 text-gray-500 hover:text-primary-600 cursor-pointer" />
                <span className="text-gray-600">{currentUser.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  ログアウト
                </button>
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">管</span>
                </div>
              </div>
            </div>
            
            <DashboardStats vehicles={vehicles} drivers={drivers} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VehicleInspectionSchedule vehicles={vehicles} />
              <DriverSchedule drivers={drivers} vehicles={vehicles} />
            </div>
            
            <AlertsPanel vehicles={vehicles} />
          </div>
        )
      case 'vehicles':
        return <VehicleManagement vehicles={vehicles} onVehiclesChange={setVehicles} />
      case 'drivers':
        return <DriverManagement 
          drivers={drivers} 
          vehicles={vehicles}
          onDriversChange={setDrivers}
          onVehiclesChange={setVehicles}
        />
      case 'schedules':
        return <DispatchScheduleManagement 
          schedules={dispatchSchedules}
          drivers={drivers}
          vehicles={vehicles}
          onSchedulesChange={setDispatchSchedules}
        />
      case 'vacation':
        return <VacationManagement
          vacationRequests={vacationRequests}
          vacationQuotas={vacationQuotas}
          vacationSettings={vacationSettings}
          drivers={drivers}
          onVacationRequestsChange={setVacationRequests}
          onVacationQuotasChange={setVacationQuotas}
          onVacationSettingsChange={setVacationSettings}
        />
      case 'attendance':
        return <AttendanceManagement attendanceRecords={attendanceRecords} drivers={drivers} />
      case 'emergency':
        return <EmergencyResponseSystem 
          drivers={drivers} 
          vehicles={vehicles}
          onIncidentCreate={(incident) => console.log('Emergency incident created:', incident)}
          onIncidentUpdate={(incident) => console.log('Emergency incident updated:', incident)}
        />
      case 'allocation':
        return <VehicleAllocationSystem 
          vehicles={vehicles}
          drivers={drivers}
          schedules={dispatchSchedules}
          attendanceRecords={attendanceRecords}
          onAllocationChange={(allocation) => console.log('Vehicle allocation changed:', allocation)}
        />
      case 'visitors':
        return <VisitorDriverManagement 
          onVisitorDriverCreate={(driver) => console.log('Visitor driver created:', driver)}
          onVisitorScheduleCreate={(schedule) => console.log('Visitor schedule created:', schedule)}
        />
      case 'notifications':
        return <VehicleInspectionNotificationSystem 
          vehicles={vehicles}
          drivers={drivers}
          onNotificationCreate={(notification) => {
            setNotifications(prev => [...prev, notification])
          }}
        />
      case 'settings':
        return <SettingsComponent />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
} 