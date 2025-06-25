'use client'

import { 
  ArrowLeft, 
  Edit, 
  Car, 
  User, 
  Calendar, 
  MapPin, 
  Gauge, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Vehicle {
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

interface VehicleDetailProps {
  vehicle: Vehicle
  onEdit: () => void
  onBack: () => void
}

export default function VehicleDetail({ vehicle, onEdit, onBack }: VehicleDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inspection':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'breakdown':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5" />
      case 'maintenance':
        return <Settings className="h-5 w-5" />
      case 'inspection':
        return <Calendar className="h-5 w-5" />
      case 'breakdown':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '稼働中'
      case 'maintenance':
        return 'メンテナンス'
      case 'inspection':
        return '点検中'
      case 'breakdown':
        return '故障'
      default:
        return '不明'
    }
  }

  const daysUntilInspection = differenceInDays(vehicle.nextInspection, new Date())
  const daysSinceLastInspection = differenceInDays(new Date(), vehicle.lastInspection)

  const inspectionStatus = () => {
    if (daysUntilInspection < 0) {
      return { color: 'text-red-600', text: `${Math.abs(daysUntilInspection)}日超過`, urgent: true }
    } else if (daysUntilInspection <= 7) {
      return { color: 'text-red-600', text: `あと${daysUntilInspection}日`, urgent: true }
    } else if (daysUntilInspection <= 30) {
      return { color: 'text-yellow-600', text: `あと${daysUntilInspection}日`, urgent: false }
    } else {
      return { color: 'text-green-600', text: `あと${daysUntilInspection}日`, urgent: false }
    }
  }

  const inspection = inspectionStatus()

  // サンプルの運行履歴データ
  const operationHistory = [
    {
      date: new Date('2024-01-20'),
      route: '東京→大阪',
      driver: vehicle.driver || '田中太郎',
      distance: 515,
      status: '完了'
    },
    {
      date: new Date('2024-01-19'),
      route: '横浜→名古屋',
      driver: vehicle.driver || '田中太郎',
      distance: 360,
      status: '完了'
    },
    {
      date: new Date('2024-01-18'),
      route: '千葉→静岡',
      driver: vehicle.driver || '田中太郎',
      distance: 420,
      status: '完了'
    }
  ]

  // サンプルのメンテナンス履歴データ
  const maintenanceHistory = [
    {
      date: new Date('2024-12-01'),
      type: '定期点検',
      details: '全般点検、オイル交換',
      cost: 25000,
      location: '本社整備工場'
    },
    {
      date: new Date('2024-09-15'),
      type: 'オイル交換',
      details: 'エンジンオイル・フィルター交換',
      cost: 8000,
      location: '本社整備工場'
    },
    {
      date: new Date('2024-06-10'),
      type: 'タイヤ交換',
      details: '前輪タイヤ2本交換',
      cost: 32000,
      location: 'タイヤ専門店'
    }
  ]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Car className="h-8 w-8 mr-3 text-primary-600" />
            車両詳細
          </h1>
        </div>
        <button
          onClick={onEdit}
          className="btn-primary flex items-center space-x-2"
        >
          <Edit className="h-5 w-5" />
          <span>編集</span>
        </button>
      </div>

      {/* 基本情報カード */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.plateNumber}</h2>
            <p className="text-lg text-gray-600">{vehicle.model} ({vehicle.year}年)</p>
            <p className="text-sm text-gray-500">{vehicle.type}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(vehicle.status)}`}>
            {getStatusIcon(vehicle.status)}
            <span className="ml-2">{getStatusText(vehicle.status)}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">担当ドライバー</p>
              <p className="font-medium text-gray-900">{vehicle.driver || '未割当'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Car className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">チーム</p>
              <p className="font-medium text-gray-900">{vehicle.team}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">現在地</p>
              <p className="font-medium text-gray-900">{vehicle.location}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Gauge className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">走行距離</p>
              <p className="font-medium text-gray-900">{vehicle.mileage.toLocaleString()} km</p>
            </div>
          </div>
        </div>

        {vehicle.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">備考・特記事項</p>
                <p className="text-gray-900 mt-1">{vehicle.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 点検情報カード */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary-600" />
          点検・メンテナンス情報
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">前回点検日</p>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {format(vehicle.lastInspection, 'yyyy年MM月dd日', { locale: ja })}
            </p>
            <p className="text-sm text-gray-500">{daysSinceLastInspection}日前</p>
          </div>

          <div className={`p-4 rounded-lg ${inspection.urgent ? 'bg-red-50' : 'bg-blue-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">次回点検日</p>
              {inspection.urgent ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <Calendar className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {format(vehicle.nextInspection, 'yyyy年MM月dd日', { locale: ja })}
            </p>
            <p className={`text-sm font-medium ${inspection.color}`}>{inspection.text}</p>
          </div>
        </div>

        {inspection.urgent && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium text-red-800">
                点検期限が近づいています。速やかに点検の手配をしてください。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 運行履歴 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の運行履歴</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ルート</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ドライバー</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">距離</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {operationHistory.map((record, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {format(record.date, 'MM/dd', { locale: ja })}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{record.route}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{record.driver}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{record.distance} km</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* メンテナンス履歴 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">メンテナンス履歴</h3>
        <div className="space-y-4">
          {maintenanceHistory.map((record, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{record.type}</h4>
                    <span className="text-sm text-gray-500">
                      {format(record.date, 'yyyy年MM月dd日', { locale: ja })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{record.details}</p>
                  <p className="text-xs text-gray-500">実施場所: {record.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">¥{record.cost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 