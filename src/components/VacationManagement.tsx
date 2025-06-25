'use client'

import { useState } from 'react'
import { 
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  FileText,
  CalendarDays,
  UserCheck,
  UserX,
  TrendingUp,
  Download
} from 'lucide-react'
import { format, isToday, isTomorrow, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'
import { VacationRequest, VacationQuota, VacationSettings, Driver } from '@/types'
import VacationRequestForm from './VacationRequestForm'
import VacationCalendarView from './VacationCalendarView'
import VacationQuotaManagement from './VacationQuotaManagement'

interface VacationManagementProps {
  vacationRequests: VacationRequest[]
  vacationQuotas: VacationQuota[]
  vacationSettings: VacationSettings
  drivers: Driver[]
  onVacationRequestsChange: (requests: VacationRequest[]) => void
  onVacationQuotasChange: (quotas: VacationQuota[]) => void
  onVacationSettingsChange: (settings: VacationSettings) => void
}

export default function VacationManagement({
  vacationRequests,
  vacationQuotas,
  vacationSettings,
  drivers,
  onVacationRequestsChange,
  onVacationQuotasChange,
  onVacationSettingsChange
}: VacationManagementProps) {
  const [currentView, setCurrentView] = useState('requests')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null)

  // 統計情報を計算
  const stats = {
    totalRequests: vacationRequests.length,
    pendingRequests: vacationRequests.filter(req => req.status === 'pending').length,
    approvedRequests: vacationRequests.filter(req => req.status === 'approved').length,
    rejectedRequests: vacationRequests.filter(req => req.status === 'rejected').length,
    todayOffDrivers: vacationRequests.filter(req => 
      req.status === 'approved' && 
      isToday(req.startDate) && 
      req.endDate >= new Date()
    ).length
  }

  // フィルタリングされた休暇申請
  const filteredRequests = vacationRequests.filter(request => {
    const matchesSearch = request.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesTeam = teamFilter === 'all' || request.team === teamFilter
    const matchesType = typeFilter === 'all' || request.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesTeam && matchesType
  })

  // 休暇申請の承認
  const handleApproveRequest = (requestId: number, comments?: string) => {
    const updatedRequests = vacationRequests.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status: 'approved' as const,
          reviewedAt: new Date(),
          reviewedBy: '管理者',
          reviewComments: comments
        }
      }
      return request
    })
    onVacationRequestsChange(updatedRequests)
  }

  // 休暇申請の却下
  const handleRejectRequest = (requestId: number, comments: string) => {
    const updatedRequests = vacationRequests.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status: 'rejected' as const,
          reviewedAt: new Date(),
          reviewedBy: '管理者',
          reviewComments: comments
        }
      }
      return request
    })
    onVacationRequestsChange(updatedRequests)
  }

  // 休暇申請の削除
  const handleDeleteRequest = (requestId: number) => {
    const updatedRequests = vacationRequests.filter(request => request.id !== requestId)
    onVacationRequestsChange(updatedRequests)
  }

  // ステータスの色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 休暇タイプの色を取得
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual':
        return 'bg-blue-100 text-blue-800'
      case 'sick':
        return 'bg-red-100 text-red-800'
      case 'personal':
        return 'bg-purple-100 text-purple-800'
      case 'emergency':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 休暇タイプの日本語名を取得
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'annual':
        return '年次有給'
      case 'sick':
        return '病気休暇'
      case 'personal':
        return '私用休暇'
      case 'emergency':
        return '緊急休暇'
      default:
        return type
    }
  }

  const renderRequestsList = () => (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総申請数</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">承認待ち</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">承認済み</p>
              <p className="text-3xl font-bold text-green-600">{stats.approvedRequests}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">却下</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejectedRequests}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">本日休暇</p>
              <p className="text-3xl font-bold text-purple-600">{stats.todayOffDrivers}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserX className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 検索・フィルター・アクション */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="ドライバー名、社員ID、理由で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">すべてのステータス</option>
              <option value="pending">承認待ち</option>
              <option value="approved">承認済み</option>
              <option value="rejected">却下</option>
              <option value="cancelled">キャンセル</option>
            </select>

            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">すべてのチーム</option>
              <option value="Bチーム">Bチーム</option>
              <option value="Cチーム">Cチーム</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">すべての種類</option>
              <option value="annual">年次有給</option>
              <option value="sick">病気休暇</option>
              <option value="personal">私用休暇</option>
              <option value="emergency">緊急休暇</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowRequestForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              新規申請
            </button>
            <button className="btn-secondary">
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </button>
          </div>
        </div>
      </div>

      {/* 休暇申請一覧 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申請者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  種類
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  期間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  理由
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申請日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {request.driverName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{request.driverName}</div>
                        <div className="text-sm text-gray-500">{request.team} - {request.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(request.type)}`}>
                      {getTypeLabel(request.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {format(request.startDate, 'yyyy/MM/dd', { locale: ja })}
                      {request.startDate.getTime() !== request.endDate.getTime() && (
                        <span> ～ {format(request.endDate, 'yyyy/MM/dd', { locale: ja })}</span>
                      )}
                    </div>
                    {request.isRecurring && (
                      <div className="text-xs text-purple-600">
                        定期休暇 ({request.recurringPattern === 'weekly' ? '毎週' : '毎月'})
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.days}日
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {request.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                      {request.status === 'pending' ? '承認待ち' :
                       request.status === 'approved' ? '承認済み' :
                       request.status === 'rejected' ? '却下' : 'キャンセル'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(request.requestedAt, 'yyyy/MM/dd', { locale: ja })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id, '却下理由を入力してください')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderTabNavigation = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {[
          { id: 'requests', label: '休暇申請', icon: FileText },
          { id: 'calendar', label: 'カレンダー', icon: Calendar },
          { id: 'quotas', label: '休暇残日数', icon: CalendarDays },
          { id: 'settings', label: '設定', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                currentView === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">休暇管理</h1>
      </div>

      {renderTabNavigation()}

      {currentView === 'requests' && renderRequestsList()}
      {currentView === 'calendar' && (
        <VacationCalendarView
          vacationRequests={vacationRequests}
          vacationSettings={vacationSettings}
          drivers={drivers}
        />
      )}
      {currentView === 'quotas' && (
        <VacationQuotaManagement
          vacationQuotas={vacationQuotas}
          drivers={drivers}
          onQuotasChange={onVacationQuotasChange}
        />
      )}
      {currentView === 'settings' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">休暇設定</h3>
          <p className="text-gray-600">休暇設定機能は開発中です。</p>
        </div>
      )}

      {/* 休暇申請フォームモーダル */}
      {showRequestForm && (
        <VacationRequestForm
          drivers={drivers}
          vacationSettings={vacationSettings}
          existingRequests={vacationRequests}
          onSave={(newRequest) => {
            onVacationRequestsChange([...vacationRequests, newRequest])
            setShowRequestForm(false)
          }}
          onCancel={() => setShowRequestForm(false)}
        />
      )}
    </div>
  )
} 