'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CalendarDays,
  FileText
} from 'lucide-react'
import { User, VacationRequest } from '@/types'

interface DriverVacationRequestProps {
  currentUser: User
  existingRequests: VacationRequest[]
  onRequestSubmit: (request: Omit<VacationRequest, 'id' | 'requestedAt'>) => void
}

export default function DriverVacationRequest({ 
  currentUser, 
  existingRequests, 
  onRequestSubmit 
}: DriverVacationRequestProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: 'annual' as const,
    startDate: '',
    endDate: '',
    reason: '',
    isRecurring: false,
    recurringPattern: 'weekly' as const,
    recurringDays: [] as number[]
  })

  const vacationTypes = {
    annual: '年次有給休暇',
    sick: '病気休暇',
    personal: '私用休暇',
    emergency: '緊急休暇'
  }

  const statusLabels = {
    pending: '承認待ち',
    approved: '承認済み',
    rejected: '却下',
    cancelled: 'キャンセル'
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const days = calculateDays(formData.startDate, formData.endDate)

    const newRequest: Omit<VacationRequest, 'id' | 'requestedAt'> = {
      driverId: currentUser.id,
      driverName: currentUser.name,
      team: currentUser.team,
      employeeId: currentUser.employeeId,
      type: formData.type,
      startDate,
      endDate,
      days,
      reason: formData.reason,
      status: 'pending',
      isRecurring: formData.isRecurring,
      recurringPattern: formData.isRecurring ? formData.recurringPattern : undefined,
      recurringDays: formData.isRecurring ? formData.recurringDays : undefined
    }

    onRequestSubmit(newRequest)
    setIsFormOpen(false)
    setFormData({
      type: 'annual',
      startDate: '',
      endDate: '',
      reason: '',
      isRecurring: false,
      recurringPattern: 'weekly',
      recurringDays: []
    })
  }

  const weekdays = [
    { value: 1, label: '月' },
    { value: 2, label: '火' },
    { value: 3, label: '水' },
    { value: 4, label: '木' },
    { value: 5, label: '金' },
    { value: 6, label: '土' },
    { value: 0, label: '日' }
  ]

  const handleRecurringDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }))
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">休暇申請</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>新規申請</span>
        </button>
      </div>

      {/* 休暇残数表示 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">年次有給休暇残数</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">総日数</p>
            <p className="text-2xl font-bold text-blue-700">20日</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">使用日数</p>
            <p className="text-2xl font-bold text-orange-700">5日</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">残日数</p>
            <p className="text-2xl font-bold text-green-700">15日</p>
          </div>
        </div>
      </div>

      {/* 申請フォーム */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">休暇申請</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  休暇種別
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {Object.entries(vacationTypes).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始日
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    終了日
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    申請日数: <span className="font-semibold">{calculateDays(formData.startDate, formData.endDate)}日</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  申請理由
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="休暇の理由を入力してください"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">定期的な休暇（毎週等）</span>
                </label>
              </div>

              {formData.isRecurring && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      繰り返しパターン
                    </label>
                    <select
                      value={formData.recurringPattern}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurringPattern: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="weekly">毎週</option>
                      <option value="monthly">毎月</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      曜日選択
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {weekdays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleRecurringDayToggle(day.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            formData.recurringDays.includes(day.value)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  申請する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 申請履歴 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">申請履歴</h3>
        
        {existingRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>まだ申請がありません</p>
            <p className="text-sm">「新規申請」ボタンから休暇申請を作成してください</p>
          </div>
        ) : (
          <div className="space-y-3">
            {existingRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {vacationTypes[request.type]}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-medium">期間:</span> {request.startDate.toLocaleDateString('ja-JP')} 〜 {request.endDate.toLocaleDateString('ja-JP')}
                      </div>
                      <div>
                        <span className="font-medium">日数:</span> {request.days}日
                      </div>
                    </div>
                    
                    {request.reason && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">理由:</span> {request.reason}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      申請日: {request.requestedAt.toLocaleDateString('ja-JP')}
                      {request.reviewedAt && (
                        <span className="ml-4">
                          承認日: {request.reviewedAt.toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </div>
                    
                    {request.reviewComments && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <span className="font-medium">コメント:</span> {request.reviewComments}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {request.status === 'pending' && (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    {request.status === 'approved' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {request.status === 'rejected' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 