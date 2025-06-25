'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Clock, 
  MapPin, 
  User,
  Car,
  Wrench,
  ExternalLink,
  Send,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react'
import { Driver, Vehicle } from '@/types'

interface EmergencyIncident {
  id: number
  type: 'vehicle_breakdown' | 'accident' | 'medical' | 'traffic_delay' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  vehicleId?: number
  driverId: number
  location: string
  description: string
  reportedAt: Date
  reportedBy: string
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved'
  assignedTo?: string
  resolvedAt?: Date
  estimatedResolutionTime?: Date
  updates: EmergencyUpdate[]
  contactNumbers: string[]
  alternativeVehicleId?: number
}

interface EmergencyUpdate {
  id: number
  timestamp: Date
  message: string
  author: string
  type: 'status' | 'note' | 'escalation'
}

interface EmergencyResponseSystemProps {
  drivers: Driver[]
  vehicles: Vehicle[]
  onIncidentCreate: (incident: EmergencyIncident) => void
  onIncidentUpdate: (incident: EmergencyIncident) => void
}

export default function EmergencyResponseSystem({ 
  drivers, 
  vehicles, 
  onIncidentCreate, 
  onIncidentUpdate 
}: EmergencyResponseSystemProps) {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null)
  const [newIncidentForm, setNewIncidentForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('active')
  
  // 新規緊急事態報告フォーム
  const [formData, setFormData] = useState({
    type: 'vehicle_breakdown' as const,
    severity: 'medium' as const,
    driverId: '',
    vehicleId: '',
    location: '',
    description: '',
    contactNumbers: ['']
  })

  // サンプル緊急事態データ
  useEffect(() => {
    const sampleIncidents: EmergencyIncident[] = [
      {
        id: 1,
        type: 'vehicle_breakdown',
        severity: 'high',
        vehicleId: 1,
        driverId: 1,
        location: '首都高速中央環状線 板橋JCT付近',
        description: 'エンジンオーバーヒート。車両停止中。',
        reportedAt: new Date(Date.now() - 30 * 60 * 1000), // 30分前
        reportedBy: '田中太郎',
        status: 'in_progress',
        assignedTo: '配車責任者',
        estimatedResolutionTime: new Date(Date.now() + 60 * 60 * 1000), // 1時間後
        updates: [
          {
            id: 1,
            timestamp: new Date(Date.now() - 25 * 60 * 1000),
            message: 'レッカー車を手配しました。到着予定: 20分後',
            author: '配車責任者',
            type: 'status'
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            message: '代替車両（品川 506 き 1111）を出発させました',
            author: '配車責任者',
            type: 'status'
          }
        ],
        contactNumbers: ['090-1234-5678'],
        alternativeVehicleId: 6
      }
    ]
    setIncidents(sampleIncidents)
  }, [])

  // 緊急度に応じたスタイル
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }

  const getIncidentTypeText = (type: string) => {
    const types = {
      vehicle_breakdown: '車両故障',
      accident: '事故',
      medical: '体調不良',
      traffic_delay: '交通渋滞',
      other: 'その他'
    }
    return types[type as keyof typeof types] || type
  }

  const getStatusText = (status: string) => {
    const statuses = {
      reported: '報告済み',
      acknowledged: '確認済み',
      in_progress: '対応中',
      resolved: '解決済み'
    }
    return statuses[status as keyof typeof statuses] || status
  }

  // 新規インシデント作成
  const handleCreateIncident = () => {
    const driver = drivers.find(d => d.id === Number(formData.driverId))
    const vehicle = formData.vehicleId ? vehicles.find(v => v.id === Number(formData.vehicleId)) : undefined

    if (!driver) return

    const newIncident: EmergencyIncident = {
      id: Date.now(),
      type: formData.type,
      severity: formData.severity,
      vehicleId: vehicle?.id,
      driverId: driver.id,
      location: formData.location,
      description: formData.description,
      reportedAt: new Date(),
      reportedBy: 'システム管理者',
      status: 'reported',
      updates: [],
      contactNumbers: formData.contactNumbers.filter(n => n.trim())
    }

    setIncidents(prev => [newIncident, ...prev])
    onIncidentCreate(newIncident)
    setNewIncidentForm(false)
    setFormData({
      type: 'vehicle_breakdown',
      severity: 'medium',
      driverId: '',
      vehicleId: '',
      location: '',
      description: '',
      contactNumbers: ['']
    })
  }

  // インシデント更新
  const updateIncidentStatus = (incidentId: number, newStatus: EmergencyIncident['status']) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { 
              ...incident, 
              status: newStatus,
              resolvedAt: newStatus === 'resolved' ? new Date() : undefined
            }
          : incident
      )
    )
  }

  // 更新メッセージ追加
  const addUpdate = (incidentId: number, message: string) => {
    const update: EmergencyUpdate = {
      id: Date.now(),
      timestamp: new Date(),
      message,
      author: 'システム管理者',
      type: 'note'
    }

    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, updates: [...incident.updates, update] }
          : incident
      )
    )
  }

  const activeIncidents = incidents.filter(i => i.status !== 'resolved')
  const criticalIncidents = activeIncidents.filter(i => i.severity === 'critical')

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">緊急対応システム</h2>
          {activeIncidents.length > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
              {activeIncidents.length}件対応中
            </span>
          )}
        </div>
        
        <button
          onClick={() => setNewIncidentForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <AlertTriangle className="h-5 w-5" />
          <span>緊急事態を報告</span>
        </button>
      </div>

      {/* 重要アラート */}
      {criticalIncidents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
            <h3 className="font-semibold text-red-800">緊急事態発生中</h3>
          </div>
          <p className="text-red-700">
            {criticalIncidents.length}件の重大な緊急事態が進行中です。即座に対応が必要です。
          </p>
        </div>
      )}

      {/* フィルター */}
      <div className="flex space-x-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="active">対応中</option>
          <option value="all">すべて</option>
          <option value="reported">報告済み</option>
          <option value="in_progress">対応中</option>
          <option value="resolved">解決済み</option>
        </select>
      </div>

      {/* インシデント一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">インシデント一覧</h3>
          
          {incidents
            .filter(incident => {
              if (filterStatus === 'active') return incident.status !== 'resolved'
              if (filterStatus === 'all') return true
              return incident.status === filterStatus
            })
            .map((incident) => (
              <div
                key={incident.id}
                className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedIncident?.id === incident.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedIncident(incident)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {getIncidentTypeText(incident.type)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {incident.reportedAt.toLocaleString('ja-JP')}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {drivers.find(d => d.id === incident.driverId)?.name || '不明'}
                    </span>
                    {incident.vehicleId && (
                      <>
                        <Car className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm">
                          {vehicles.find(v => v.id === incident.vehicleId)?.plateNumber || '不明'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{incident.location}</span>
                  </div>
                  
                  <p className="text-sm text-gray-800">{incident.description}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      incident.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusText(incident.status)}
                    </span>
                    
                    {incident.contactNumbers.length > 0 && (
                      <button className="text-blue-600 hover:text-blue-800">
                        <Phone className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* インシデント詳細 */}
        <div className="space-y-4">
          {selectedIncident ? (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  インシデント詳細 #{selectedIncident.id}
                </h3>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 基本情報 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">種類</label>
                    <p className="text-sm text-gray-900">{getIncidentTypeText(selectedIncident.type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">緊急度</label>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(selectedIncident.severity)}`}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ステータス</label>
                    <p className="text-sm text-gray-900">{getStatusText(selectedIncident.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">報告者</label>
                    <p className="text-sm text-gray-900">{selectedIncident.reportedBy}</p>
                  </div>
                </div>

                {/* 場所と説明 */}
                <div>
                  <label className="text-sm font-medium text-gray-500">場所</label>
                  <p className="text-sm text-gray-900">{selectedIncident.location}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">詳細</label>
                  <p className="text-sm text-gray-900">{selectedIncident.description}</p>
                </div>

                {/* 連絡先 */}
                {selectedIncident.contactNumbers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">緊急連絡先</label>
                    <div className="space-y-1">
                      {selectedIncident.contactNumbers.map((number, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a 
                            href={`tel:${number}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {number}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ステータス更新ボタン */}
                <div className="flex space-x-2">
                  {selectedIncident.status === 'reported' && (
                    <button
                      onClick={() => updateIncidentStatus(selectedIncident.id, 'in_progress')}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                    >
                      対応開始
                    </button>
                  )}
                  {selectedIncident.status === 'in_progress' && (
                    <button
                      onClick={() => updateIncidentStatus(selectedIncident.id, 'resolved')}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                    >
                      解決済み
                    </button>
                  )}
                </div>

                {/* 更新履歴 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">更新履歴</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedIncident.updates.map((update) => (
                      <div key={update.id} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">{update.author}</span>
                          <span className="text-xs text-gray-500">
                            {update.timestamp.toLocaleString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{update.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>インシデントを選択して詳細を表示</p>
            </div>
          )}
        </div>
      </div>

      {/* 新規インシデント報告フォーム */}
      {newIncidentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">緊急事態を報告</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vehicle_breakdown">車両故障</option>
                  <option value="accident">事故</option>
                  <option value="medical">体調不良</option>
                  <option value="traffic_delay">交通渋滞</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">緊急度</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="critical">緊急</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ドライバー</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="発生場所を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">詳細</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="状況の詳細を入力"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setNewIncidentForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateIncident}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={!formData.driverId || !formData.location || !formData.description}
              >
                報告する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      )
  }