'use client'

import { useState, useMemo } from 'react'
import { 
  Clock, 
  Users, 
  Calendar, 
  TrendingUp,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  User
} from 'lucide-react'
import { AttendanceRecord, Driver } from '@/types'

interface AttendanceManagementProps {
  attendanceRecords: AttendanceRecord[]
  drivers: Driver[]
}

export default function AttendanceManagement({ attendanceRecords, drivers }: AttendanceManagementProps) {
  const [selectedDriver, setSelectedDriver] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [currentView, setCurrentView] = useState<'daily' | 'monthly' | 'summary'>('daily')

  // 統計データの計算
  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayRecords = attendanceRecords.filter(record => 
      record.date.toDateString() === today
    )

    const totalDrivers = drivers.length
    const presentToday = todayRecords.filter(record => record.status === 'present').length
    const lateToday = todayRecords.filter(record => record.status === 'late').length
    const absentToday = todayRecords.filter(record => record.status === 'absent').length

    return {
      totalDrivers,
      presentToday,
      lateToday,
      absentToday,
      attendanceRate: totalDrivers > 0 ? Math.round((presentToday / totalDrivers) * 100) : 0
    }
  }, [attendanceRecords, drivers])

  // フィルタリングされた勤怠記録
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const driver = drivers.find(d => d.id === record.driverId)
      if (!driver) return false

      if (selectedDriver !== 'all' && record.driverId !== parseInt(selectedDriver)) return false
      if (selectedTeam !== 'all' && driver.team !== selectedTeam) return false
      if (selectedDate && record.date.toDateString() !== new Date(selectedDate).toDateString()) return false

      return true
    })
  }, [attendanceRecords, drivers, selectedDriver, selectedTeam, selectedDate])

  // チーム一覧の取得
  const teams = useMemo(() => {
    const uniqueTeams = [...new Set(drivers.map(driver => driver.team))]
    return uniqueTeams
  }, [drivers])

  const formatTime = (date: Date | undefined) => {
    if (!date) return '--:--'
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'late':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return '出勤'
      case 'late':
        return '遅刻'
      case 'absent':
        return '欠勤'
      case 'early_leave':
        return '早退'
      default:
        return '未記録'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'early_leave':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderDailyView = () => (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">本日の出勤率</p>
              <p className="text-3xl font-bold text-blue-600">{stats.attendanceRate}%</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">出勤者数</p>
              <p className="text-3xl font-bold text-green-600">{stats.presentToday}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">遅刻者数</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.lateToday}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">欠勤者数</p>
              <p className="text-3xl font-bold text-red-600">{stats.absentToday}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 勤怠記録テーブル */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">勤怠記録</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  運転手
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  チーム
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  出勤時刻
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  退勤時刻
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  勤務時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const driver = drivers.find(d => d.id === record.driverId)
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {driver?.name || '不明'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {driver?.employeeId || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver?.team || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.clockIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.clockOut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.workHours ? `${record.workHours}時間` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusLabel(record.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.date.toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>該当する勤怠記録がありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderMonthlyView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">月次勤怠サマリー</h3>
      <p className="text-gray-600">月次勤怠レポート機能を実装予定</p>
    </div>
  )

  const renderSummaryView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">勤怠統計</h3>
      <p className="text-gray-600">統計レポート機能を実装予定</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">勤怠管理</h1>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Download className="h-4 w-4" />
          <span>CSVエクスポート</span>
        </button>
      </div>

      {/* ビュー切り替えタブ */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'daily', label: '日次', icon: Calendar },
            { id: 'monthly', label: '月次', icon: BarChart3 },
            { id: 'summary', label: '統計', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = currentView === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">運転手</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全ての運転手</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id.toString()}>
                  {driver.name} ({driver.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">チーム</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全てのチーム</option>
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDriver('all')
                setSelectedTeam('all')
                setSelectedDate('')
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              フィルターリセット
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      {currentView === 'daily' && renderDailyView()}
      {currentView === 'monthly' && renderMonthlyView()}
      {currentView === 'summary' && renderSummaryView()}
    </div>
  )
} 