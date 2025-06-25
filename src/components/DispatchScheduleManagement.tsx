'use client'

import { useState } from 'react'
import { 
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Users,
  Car,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  Phone,
  FileText,
  Zap
} from 'lucide-react'
import { format, isToday, isTomorrow, addDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { DispatchSchedule, VehicleSwap, Driver, Vehicle } from '@/types'
import ScheduleForm from './ScheduleForm'
import ScheduleDetail from './ScheduleDetail'

interface DispatchScheduleManagementProps {
  schedules: DispatchSchedule[]
  drivers: Driver[]
  vehicles: Vehicle[]
  onSchedulesChange: (schedules: DispatchSchedule[]) => void
}

export default function DispatchScheduleManagement({
  schedules = [],
  drivers = [],
  vehicles = [],
  onSchedulesChange
}: DispatchScheduleManagementProps) {
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'form' | 'detail'>('list')
  const [selectedSchedule, setSelectedSchedule] = useState<DispatchSchedule | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTeam, setFilterTeam] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('today')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '予定'
      case 'in_progress':
        return '運行中'
      case 'completed':
        return '完了'
      case 'cancelled':
        return 'キャンセル'
      default:
        return '不明'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <Play className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <Pause className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500'
      case 'high':
        return 'border-l-orange-500'
      case 'normal':
        return 'border-l-blue-500'
      case 'low':
        return 'border-l-gray-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '至急'
      case 'high':
        return '高'
      case 'normal':
        return '通常'
      case 'low':
        return '低'
      default:
        return '通常'
    }
  }

  const filterSchedulesByDate = (schedules: DispatchSchedule[]) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const weekFromNow = new Date(today)
    weekFromNow.setDate(today.getDate() + 7)
    
    switch (filterDate) {
      case 'today':
        return schedules.filter(s => s.date.toDateString() === today.toDateString())
      case 'tomorrow':
        return schedules.filter(s => s.date.toDateString() === tomorrow.toDateString())
      case 'week':
        return schedules.filter(s => s.date >= today && s.date <= weekFromNow)
      default:
        return schedules
    }
  }

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.clientInfo?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus
    const matchesTeam = filterTeam === 'all' || schedule.team === filterTeam
    
    return matchesSearch && matchesStatus && matchesTeam
  })

  const finalFilteredSchedules = filterSchedulesByDate(filteredSchedules)

  // 統計データ
  const stats = {
    total: finalFilteredSchedules.length,
    scheduled: finalFilteredSchedules.filter(s => s.status === 'scheduled').length,
    inProgress: finalFilteredSchedules.filter(s => s.status === 'in_progress').length,
    completed: finalFilteredSchedules.filter(s => s.status === 'completed').length,
    urgent: finalFilteredSchedules.filter(s => s.priority === 'urgent').length
  }

  const handleStatusChange = (scheduleId: number, newStatus: string) => {
    const updatedSchedules = schedules.map(schedule =>
      schedule.id === scheduleId
        ? { ...schedule, status: newStatus as any, updatedAt: new Date() }
        : schedule
    )
    onSchedulesChange(updatedSchedules)
  }

  const handleDelete = (scheduleId: number) => {
    if (confirm('この配車予定を削除してもよろしいですか？')) {
      onSchedulesChange(schedules.filter(s => s.id !== scheduleId))
    }
  }

  const handleSave = (scheduleData: Partial<DispatchSchedule>) => {
    if (selectedSchedule) {
      // 編集
      const updatedSchedules = schedules.map(s =>
        s.id === selectedSchedule.id 
          ? { ...s, ...scheduleData, updatedAt: new Date() }
          : s
      )
      onSchedulesChange(updatedSchedules)
    } else {
      // 新規追加
      const newSchedule: DispatchSchedule = {
        id: schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...scheduleData
      } as DispatchSchedule
      onSchedulesChange([...schedules, newSchedule])
    }
    setCurrentView('list')
    setSelectedSchedule(null)
  }

  if (currentView === 'form') {
    return (
      <ScheduleForm
        schedule={selectedSchedule}
        drivers={drivers}
        vehicles={vehicles}
        onSave={handleSave}
        onCancel={() => {
          setCurrentView('list')
          setSelectedSchedule(null)
        }}
      />
    )
  }

  if (currentView === 'detail' && selectedSchedule) {
    return (
      <ScheduleDetail
        schedule={selectedSchedule}
        vehicleSwaps={[]}
        drivers={drivers}
        vehicles={vehicles}
        onEdit={() => setCurrentView('form')}
        onStatusChange={handleStatusChange}
        onBack={() => {
          setCurrentView('list')
          setSelectedSchedule(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">配車スケジュール</h2>
          <p className="text-gray-600 mt-1">配車予定の管理・追跡・最適化</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentView('calendar')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Calendar className="h-5 w-5" />
            <span>カレンダー表示</span>
          </button>
          <button
            onClick={() => {
              setSelectedSchedule(null)
              setCurrentView('form')
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>新規配車予定</span>
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総配車数</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">予定</p>
              <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">運行中</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Play className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">完了</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">至急便</p>
              <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ドライバー、車両、出発地、目的地、顧客名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">すべての日付</option>
              <option value="today">今日</option>
              <option value="tomorrow">明日</option>
              <option value="week">今週</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">すべてのステータス</option>
              <option value="scheduled">予定</option>
              <option value="in_progress">運行中</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
            
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">すべてのチーム</option>
              <option value="Bチーム">Bチーム</option>
              <option value="Cチーム">Cチーム</option>
            </select>
          </div>
        </div>
      </div>

      {/* 配車予定一覧 */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            配車予定一覧 ({finalFilteredSchedules.length}件)
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {finalFilteredSchedules.map((schedule) => (
            <div key={schedule.id} className={`p-6 border-l-4 hover:bg-gray-50 transition-colors ${getPriorityColor(schedule.priority)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)} flex items-center space-x-1`}>
                        {getStatusIcon(schedule.status)}
                        <span>{getStatusText(schedule.status)}</span>
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {getPriorityText(schedule.priority)}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {schedule.team}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(schedule.date, 'MM月dd日(E)', { locale: ja })} {schedule.timeSlot.start} - {schedule.timeSlot.end}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">配車情報</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {schedule.driverName}
                        </div>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2" />
                          {schedule.vehicleNumber}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">ルート</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-green-500" />
                        <span className="truncate">{schedule.route.origin}</span>
                        <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                        <span className="truncate">{schedule.route.destination}</span>
                      </div>
                      {schedule.route.waypoints && schedule.route.waypoints.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          経由: {schedule.route.waypoints.join(', ')}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">顧客・荷物</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {schedule.clientInfo && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {schedule.clientInfo.name}
                          </div>
                        )}
                        {schedule.cargoInfo && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            {schedule.cargoInfo.type} ({schedule.cargoInfo.count}台)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {schedule.notes && (
                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {schedule.notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {schedule.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange(schedule.id, 'in_progress')}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="運行開始"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  {schedule.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(schedule.id, 'completed')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="完了"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedSchedule(schedule)
                      setCurrentView('detail')
                    }}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="詳細"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSchedule(schedule)
                      setCurrentView('form')
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {finalFilteredSchedules.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">配車予定が見つかりません</h3>
            <p className="mt-1 text-sm text-gray-500">
              検索条件を変更するか、新しい配車予定を追加してください。
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 