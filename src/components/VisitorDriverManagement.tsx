'use client'

import { useState, useEffect } from 'react'
import { 
  UserPlus, 
  Users, 
  Calendar, 
  Clock, 
  Car,
  MapPin,
  Phone,
  CheckCircle,
  X,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  Building,
  CreditCard,
  FileText
} from 'lucide-react'

interface VisitorDriver {
  id: number
  name: string
  company: string
  companyType: 'TLP' | 'subcontractor' | 'partner' | 'temporary'
  licenseNumber: string
  licenseType: string
  contactNumber: string
  email?: string
  registrationDate: Date
  validUntil: Date
  status: 'active' | 'inactive' | 'pending' | 'expired'
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  documents: {
    license: boolean
    insurance: boolean
    contract: boolean
    training: boolean
  }
  qualifications: string[]
  accessLevel: 'basic' | 'standard' | 'advanced'
  notes?: string
}

interface VisitorSchedule {
  id: number
  visitorDriverId: number
  date: Date
  timeSlot: {
    start: string
    end: string
  }
  assignedVehicleId?: number
  route: {
    origin: string
    destination: string
  }
  purpose: string
  approvedBy: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: Date
}

interface VisitorDriverManagementProps {
  onVisitorDriverCreate: (driver: VisitorDriver) => void
  onVisitorScheduleCreate: (schedule: VisitorSchedule) => void
}

export default function VisitorDriverManagement({
  onVisitorDriverCreate,
  onVisitorScheduleCreate
}: VisitorDriverManagementProps) {
  const [visitorDrivers, setVisitorDrivers] = useState<VisitorDriver[]>([])
  const [visitorSchedules, setVisitorSchedules] = useState<VisitorSchedule[]>([])
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'schedule'>('list')
  const [selectedDriver, setSelectedDriver] = useState<VisitorDriver | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('active')
  const [filterCompanyType, setFilterCompanyType] = useState<string>('all')

  // 新規ドライバー登録フォーム
  const [driverForm, setDriverForm] = useState({
    name: '',
    company: '',
    companyType: 'TLP' as const,
    licenseNumber: '',
    licenseType: '大型一種',
    contactNumber: '',
    email: '',
    validUntil: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    qualifications: [] as string[],
    accessLevel: 'basic' as const,
    notes: ''
  })

  // スケジュール作成フォーム
  const [scheduleForm, setScheduleForm] = useState({
    visitorDriverId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    origin: '',
    destination: '',
    purpose: '',
    notes: ''
  })

  // サンプルデータの初期化
  useEffect(() => {
    const sampleVisitorDrivers: VisitorDriver[] = [
      {
        id: 1,
        name: '山田外部一郎',
        company: 'TLP東京',
        companyType: 'TLP',
        licenseNumber: '東京 123456789',
        licenseType: '大型一種',
        contactNumber: '090-1111-2222',
        email: 'yamada@tlp-tokyo.co.jp',
        registrationDate: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        status: 'active',
        emergencyContact: {
          name: '山田花子',
          phone: '090-3333-4444',
          relationship: '配偶者'
        },
        documents: {
          license: true,
          insurance: true,
          contract: true,
          training: true
        },
        qualifications: ['中古車運送', '機械運送', '危険物取扱'],
        accessLevel: 'advanced',
        notes: '経験豊富なドライバー。重要な配送に対応可能。'
      },
      {
        id: 2,
        name: '佐藤協力二郎',
        company: '協力運送株式会社',
        companyType: 'subcontractor',
        licenseNumber: '埼玉 987654321',
        licenseType: '中型一種',
        contactNumber: '080-5555-6666',
        registrationDate: new Date('2024-06-01'),
        validUntil: new Date('2025-05-31'),
        status: 'active',
        documents: {
          license: true,
          insurance: true,
          contract: true,
          training: false
        },
        qualifications: ['中古車運送'],
        accessLevel: 'standard'
      }
    ]

    const sampleVisitorSchedules: VisitorSchedule[] = [
      {
        id: 1,
        visitorDriverId: 1,
        date: new Date(),
        timeSlot: {
          start: '10:00',
          end: '15:00'
        },
        route: {
          origin: 'TLP東京',
          destination: 'ガリバー府中店'
        },
        purpose: '中古車回送業務',
        approvedBy: '配車責任者',
        status: 'scheduled',
        createdAt: new Date()
      }
    ]

    setVisitorDrivers(sampleVisitorDrivers)
    setVisitorSchedules(sampleVisitorSchedules)
  }, [])

  // 新規ドライバー作成
  const handleCreateDriver = () => {
    const newDriver: VisitorDriver = {
      id: Date.now(),
      name: driverForm.name,
      company: driverForm.company,
      companyType: driverForm.companyType,
      licenseNumber: driverForm.licenseNumber,
      licenseType: driverForm.licenseType,
      contactNumber: driverForm.contactNumber,
      email: driverForm.email || undefined,
      registrationDate: new Date(),
      validUntil: new Date(driverForm.validUntil),
      status: 'pending',
      emergencyContact: driverForm.emergencyContactName ? {
        name: driverForm.emergencyContactName,
        phone: driverForm.emergencyContactPhone,
        relationship: driverForm.emergencyContactRelationship
      } : undefined,
      documents: {
        license: false,
        insurance: false,
        contract: false,
        training: false
      },
      qualifications: driverForm.qualifications,
      accessLevel: driverForm.accessLevel,
      notes: driverForm.notes || undefined
    }

    setVisitorDrivers(prev => [newDriver, ...prev])
    onVisitorDriverCreate(newDriver)
    setCurrentView('list')
    
    // フォームリセット
    setDriverForm({
      name: '',
      company: '',
      companyType: 'TLP',
      licenseNumber: '',
      licenseType: '大型一種',
      contactNumber: '',
      email: '',
      validUntil: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      qualifications: [],
      accessLevel: 'basic',
      notes: ''
    })
  }

  // スケジュール作成
  const handleCreateSchedule = () => {
    const newSchedule: VisitorSchedule = {
      id: Date.now(),
      visitorDriverId: Number(scheduleForm.visitorDriverId),
      date: new Date(scheduleForm.date),
      timeSlot: {
        start: scheduleForm.startTime,
        end: scheduleForm.endTime
      },
      route: {
        origin: scheduleForm.origin,
        destination: scheduleForm.destination
      },
      purpose: scheduleForm.purpose,
      approvedBy: 'システム管理者',
      status: 'scheduled',
      createdAt: new Date()
    }

    setVisitorSchedules(prev => [newSchedule, ...prev])
    onVisitorScheduleCreate(newSchedule)
    setCurrentView('list')
    
    // フォームリセット
    setScheduleForm({
      visitorDriverId: '',
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      origin: '',
      destination: '',
      purpose: '',
      notes: ''
    })
  }

  // ドライバーステータス更新
  const updateDriverStatus = (driverId: number, status: VisitorDriver['status']) => {
    setVisitorDrivers(prev =>
      prev.map(driver =>
        driver.id === driverId ? { ...driver, status } : driver
      )
    )
  }

  // 書類ステータス更新
  const updateDocumentStatus = (driverId: number, document: keyof VisitorDriver['documents'], status: boolean) => {
    setVisitorDrivers(prev =>
      prev.map(driver =>
        driver.id === driverId 
          ? { ...driver, documents: { ...driver.documents, [document]: status }}
          : driver
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCompanyTypeText = (type: string) => {
    const types = {
      TLP: 'TLP',
      subcontractor: '協力会社',
      partner: 'パートナー',
      temporary: '臨時'
    }
    return types[type as keyof typeof types] || type
  }

  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case 'TLP':
        return 'bg-blue-100 text-blue-800'
      case 'subcontractor':
        return 'bg-purple-100 text-purple-800'
      case 'partner':
        return 'bg-green-100 text-green-800'
      case 'temporary':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDrivers = visitorDrivers.filter(driver => {
    const matchesSearch = !searchTerm || 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus
    const matchesCompanyType = filterCompanyType === 'all' || driver.companyType === filterCompanyType
    
    return matchesSearch && matchesStatus && matchesCompanyType
  })

  const stats = {
    total: visitorDrivers.length,
    active: visitorDrivers.filter(d => d.status === 'active').length,
    pending: visitorDrivers.filter(d => d.status === 'pending').length,
    expired: visitorDrivers.filter(d => d.status === 'expired').length,
    todaySchedules: visitorSchedules.filter(s => 
      s.date.toDateString() === new Date().toDateString()
    ).length
  }

  if (currentView === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">外部ドライバー登録</h2>
          <button
            onClick={() => setCurrentView('list')}
            className="btn-secondary flex items-center space-x-2"
          >
            <X className="h-5 w-5" />
            <span>キャンセル</span>
          </button>
        </div>

        <div className="card p-6">
          <div className="space-y-6">
            {/* 基本情報 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">氏名 *</label>
                  <input
                    type="text"
                    value={driverForm.name}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">所属会社 *</label>
                  <input
                    type="text"
                    value={driverForm.company}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会社タイプ *</label>
                  <select
                    value={driverForm.companyType}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, companyType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TLP">TLP</option>
                    <option value="subcontractor">協力会社</option>
                    <option value="partner">パートナー</option>
                    <option value="temporary">臨時</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">連絡先 *</label>
                  <input
                    type="tel"
                    value={driverForm.contactNumber}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                  <input
                    type="email"
                    value={driverForm.email}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">登録有効期限 *</label>
                  <input
                    type="date"
                    value={driverForm.validUntil}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 免許情報 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">免許情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">免許番号 *</label>
                  <input
                    type="text"
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">免許種別 *</label>
                  <select
                    value={driverForm.licenseType}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, licenseType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="大型一種">大型一種</option>
                    <option value="中型一種">中型一種</option>
                    <option value="準中型一種">準中型一種</option>
                    <option value="普通一種">普通一種</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 緊急連絡先 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">緊急連絡先</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">氏名</label>
                  <input
                    type="text"
                    value={driverForm.emergencyContactName}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                  <input
                    type="tel"
                    value={driverForm.emergencyContactPhone}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">続柄</label>
                  <input
                    type="text"
                    value={driverForm.emergencyContactRelationship}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="配偶者、親、子供など"
                  />
                </div>
              </div>
            </div>

            {/* アクセスレベル */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクセスレベル</h3>
              <select
                value={driverForm.accessLevel}
                onChange={(e) => setDriverForm(prev => ({ ...prev, accessLevel: e.target.value as any }))}
                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">基本（通常業務のみ）</option>
                <option value="standard">標準（一般的な業務）</option>
                <option value="advanced">上級（全ての業務）</option>
              </select>
            </div>

            {/* 備考 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
              <textarea
                value={driverForm.notes}
                onChange={(e) => setDriverForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="特記事項があれば記入してください"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCurrentView('list')}
                className="btn-secondary"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateDriver}
                className="btn-primary"
                disabled={!driverForm.name || !driverForm.company || !driverForm.contactNumber || !driverForm.licenseNumber || !driverForm.validUntil}
              >
                登録
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'schedule') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">外部ドライバースケジュール作成</h2>
          <button
            onClick={() => setCurrentView('list')}
            className="btn-secondary flex items-center space-x-2"
          >
            <X className="h-5 w-5" />
            <span>キャンセル</span>
          </button>
        </div>

        <div className="card p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">外部ドライバー *</label>
                <select
                  value={scheduleForm.visitorDriverId}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, visitorDriverId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  {visitorDrivers
                    .filter(driver => driver.status === 'active')
                    .map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} ({driver.company})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日付 *</label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開始時間 *</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">終了時間 *</label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">出発地 *</label>
                <input
                  type="text"
                  value={scheduleForm.origin}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目的地 *</label>
                <input
                  type="text"
                  value={scheduleForm.destination}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">業務内容 *</label>
              <input
                type="text"
                value={scheduleForm.purpose}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, purpose: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="中古車回送、機械運送など"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCurrentView('list')}
                className="btn-secondary"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateSchedule}
                className="btn-primary"
                disabled={!scheduleForm.visitorDriverId || !scheduleForm.date || !scheduleForm.origin || !scheduleForm.destination || !scheduleForm.purpose}
              >
                スケジュール作成
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">外部ドライバー管理</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('schedule')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Calendar className="h-5 w-5" />
            <span>スケジュール作成</span>
          </button>
          
          <button
            onClick={() => setCurrentView('create')}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>新規登録</span>
          </button>
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">総登録数</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">稼働中</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">承認待ち</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          <div className="text-sm text-gray-600">期限切れ</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.todaySchedules}</div>
          <div className="text-sm text-gray-600">本日予定</div>
        </div>
      </div>

      {/* フィルターと検索 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="名前、会社名、免許番号で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="active">稼働中</option>
            <option value="inactive">非稼働</option>
            <option value="pending">承認待ち</option>
            <option value="expired">期限切れ</option>
          </select>
          
          <select
            value={filterCompanyType}
            onChange={(e) => setFilterCompanyType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全ての会社タイプ</option>
            <option value="TLP">TLP</option>
            <option value="subcontractor">協力会社</option>
            <option value="partner">パートナー</option>
            <option value="temporary">臨時</option>
          </select>
        </div>
      </div>

      {/* ドライバー一覧 */}
      <div className="space-y-4">
        {filteredDrivers.map((driver) => (
          <div key={driver.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(driver.status)}`}>
                    {driver.status === 'active' ? '稼働中' : 
                     driver.status === 'inactive' ? '非稼働' :
                     driver.status === 'pending' ? '承認待ち' : '期限切れ'}
                  </span>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCompanyTypeColor(driver.companyType)}`}>
                    {getCompanyTypeText(driver.companyType)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{driver.company}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{driver.contactNumber}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{driver.licenseType}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">登録期限:</span>
                      <span className={`ml-2 ${
                        new Date(driver.validUntil) < new Date() ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {driver.validUntil.toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    
                    <div>
                      <span className="font-medium">アクセス:</span>
                      <span className="ml-2">{
                        driver.accessLevel === 'basic' ? '基本' :
                        driver.accessLevel === 'standard' ? '標準' : '上級'
                      }</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">書類状況:</span>
                      <div className="flex space-x-1 mt-1">
                        <span className={`px-1 py-0.5 text-xs rounded ${
                          driver.documents.license ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          免許
                        </span>
                        <span className={`px-1 py-0.5 text-xs rounded ${
                          driver.documents.insurance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          保険
                        </span>
                        <span className={`px-1 py-0.5 text-xs rounded ${
                          driver.documents.contract ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          契約
                        </span>
                        <span className={`px-1 py-0.5 text-xs rounded ${
                          driver.documents.training ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          研修
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {driver.qualifications.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">資格: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {driver.qualifications.map((qualification, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {qualification}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                {driver.status === 'pending' && (
                  <button
                    onClick={() => updateDriverStatus(driver.id, 'active')}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    承認
                  </button>
                )}
                
                {driver.status === 'active' && (
                  <button
                    onClick={() => updateDriverStatus(driver.id, 'inactive')}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    停止
                  </button>
                )}
                
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                  詳細
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>該当する外部ドライバーがありません</p>
          <p className="text-sm">検索条件を変更するか、新規登録してください</p>
        </div>
      )}
    </div>
      )
  }