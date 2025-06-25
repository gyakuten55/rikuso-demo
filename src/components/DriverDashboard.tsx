'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, 
  Car, 
  Calendar, 
  Bell, 
  CheckCircle, 
  AlertTriangle,
  MapPin,
  Settings,
  LogOut,
  User,
  CalendarCheck,
  Wrench,
  RefreshCw,
  Home
} from 'lucide-react'
import { User as UserType, Vehicle, AttendanceRecord, DriverNotification, VacationRequest, DispatchSchedule, InspectionSchedule } from '@/types'
import DriverVacationRequest from './DriverVacationRequest'
import DriverVehicleInfo from './DriverVehicleInfo'

interface DriverDashboardProps {
  currentUser: UserType
  onLogout: () => void
  onAttendanceUpdate?: (attendance: AttendanceRecord) => void
}

export default function DriverDashboard({ currentUser, onLogout, onAttendanceUpdate }: DriverDashboardProps) {
  const [currentView, setCurrentView] = useState('dashboard')
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null)
  const [notifications, setNotifications] = useState<DriverNotification[]>([])
  const [todaySchedule, setTodaySchedule] = useState<DispatchSchedule[]>([])
  const [pendingVacationRequests, setPendingVacationRequests] = useState<VacationRequest[]>([])
  const [upcomingInspections, setUpcomingInspections] = useState<InspectionSchedule[]>([])

  // サンプルデータの初期化
  useEffect(() => {
    // 今日の出勤記録
    setTodayAttendance({
      id: 1,
      driverId: currentUser.id,
      date: new Date(),
      clockIn: undefined,
      clockOut: undefined,
      status: 'absent',
      workHours: 0
    })

    // 割り当て車両（サンプル）
    setAssignedVehicle({
      id: 1,
      plateNumber: '東京 500 あ 1234',
      type: '2トントラック',
      model: 'いすゞエルフ',
      year: 2022,
      driver: currentUser.name,
      team: currentUser.team,
      status: 'active',
      lastInspection: new Date('2024-01-15'),
      nextInspection: new Date('2024-04-15'),
      mileage: 45000,
      location: '本社車庫',
      notes: '定期点検予定あり'
    })

    // 通知（サンプル）
    setNotifications([
      {
        id: 1,
        driverId: currentUser.id,
        type: 'vehicle_inspection',
        title: '車両点検のお知らせ',
        message: '4月15日に車両点検が予定されています。',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(),
        scheduledFor: new Date('2024-04-15'),
        actionRequired: true
      }
    ])

    // 点検予定（サンプル）
    setUpcomingInspections([
      {
        id: 1,
        vehicleId: 1,
        vehicleNumber: '東京 500 あ 1234',
        type: '定期点検',
        date: new Date('2024-04-15'),
        status: 'warning',
        driver: currentUser.name,
        team: currentUser.team
      }
    ])

    // 休暇申請サンプルデータ
    setPendingVacationRequests([
      {
        id: 1,
        driverId: currentUser.id,
        driverName: currentUser.name,
        team: currentUser.team,
        employeeId: currentUser.employeeId,
        type: 'annual',
        startDate: new Date('2024-04-20'),
        endDate: new Date('2024-04-22'),
        days: 3,
        reason: '私用のため',
        status: 'pending',
        requestedAt: new Date('2024-03-15'),
        isRecurring: false
      }
    ])
  }, [currentUser])

  const handleClockIn = () => {
    if (todayAttendance && !todayAttendance.clockIn) {
      const updatedAttendance = {
        ...todayAttendance,
        clockIn: new Date(),
        status: 'present' as const
      }
      setTodayAttendance(updatedAttendance)
      onAttendanceUpdate?.(updatedAttendance)
    }
  }

  const handleClockOut = () => {
    if (todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut) {
      const clockOut = new Date()
      const workHours = (clockOut.getTime() - todayAttendance.clockIn.getTime()) / (1000 * 60 * 60)
      const updatedAttendance = {
        ...todayAttendance,
        clockOut,
        workHours: Math.round(workHours * 100) / 100
      }
      setTodayAttendance(updatedAttendance)
      onAttendanceUpdate?.(updatedAttendance)
    }
  }

  const formatTime = (date: Date | undefined) => {
    if (!date) return '--:--'
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">おはようございます</h1>
          <p className="text-gray-600">{currentUser.name}さん（{currentUser.team}）</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-500 hover:text-primary-600 cursor-pointer" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>

      {/* 出勤管理カード */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          出勤管理
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">出勤時刻</p>
            <p className="text-2xl font-bold text-blue-700">{formatTime(todayAttendance?.clockIn)}</p>
            {!todayAttendance?.clockIn && (
              <button
                onClick={handleClockIn}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                出勤打刻
              </button>
            )}
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">退勤時刻</p>
            <p className="text-2xl font-bold text-green-700">{formatTime(todayAttendance?.clockOut)}</p>
            {todayAttendance?.clockIn && !todayAttendance?.clockOut && (
              <button
                onClick={handleClockOut}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
              >
                退勤打刻
              </button>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">勤務時間</p>
            <p className="text-2xl font-bold text-gray-700">
              {todayAttendance?.workHours ? `${todayAttendance.workHours}時間` : '--時間'}
            </p>
          </div>
        </div>
      </div>

      {/* 割り当て車両情報 */}
      {assignedVehicle && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="h-5 w-5 mr-2 text-orange-600" />
            割り当て車両
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{assignedVehicle.plateNumber}</h3>
                  <p className="text-gray-600">{assignedVehicle.model}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">走行距離</span>
                  <span className="font-medium">{assignedVehicle.mileage.toLocaleString()}km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">駐車場所</span>
                  <span className="font-medium">{assignedVehicle.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">状態</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    assignedVehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                    assignedVehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {assignedVehicle.status === 'active' ? '稼働中' :
                     assignedVehicle.status === 'maintenance' ? 'メンテナンス中' : '点検中'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">点検予定</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Wrench className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">次回点検</span>
                </div>
                <p className="text-yellow-700">
                  {assignedVehicle.nextInspection.toLocaleDateString('ja-JP')}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {assignedVehicle.notes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 通知・アラート */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-purple-600" />
            通知・アラート
          </h2>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`border rounded-lg p-4 ${
                notification.priority === 'urgent' ? 'border-red-200 bg-red-50' :
                notification.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    {notification.scheduledFor && (
                      <p className="text-xs text-gray-500 mt-2">
                        予定日: {notification.scheduledFor.toLocaleDateString('ja-JP')}
                      </p>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const handleVacationRequest = (request: Omit<VacationRequest, 'id' | 'requestedAt'>) => {
    const newRequest: VacationRequest = {
      ...request,
      id: Date.now(),
      requestedAt: new Date()
    }
    setPendingVacationRequests(prev => [newRequest, ...prev])
  }

  const renderVacationRequest = () => (
    <DriverVacationRequest 
      currentUser={currentUser}
      existingRequests={pendingVacationRequests}
      onRequestSubmit={handleVacationRequest}
    />
  )

  const renderVehicleInfo = () => (
    assignedVehicle ? (
      <DriverVehicleInfo 
        assignedVehicle={assignedVehicle}
        upcomingInspections={upcomingInspections}
        vehicleSwapNotifications={[]}
      />
    ) : (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">車両情報</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Car className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600">割り当てられた車両がありません</p>
        </div>
      </div>
    )
  )

  const menuItems = [
    { id: 'dashboard', label: 'ホーム', icon: Home },
    { id: 'vehicle-info', label: '車両情報', icon: Car },
    { id: 'vacation', label: '休暇申請', icon: Calendar },
  ]

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard()
      case 'vehicle-info':
        return renderVehicleInfo()
      case 'vacation':
        return renderVacationRequest()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サイドナビゲーション */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">東京陸送</h2>
              <p className="text-sm text-gray-500">運転手専用</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.team}</p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="ml-64">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
} 