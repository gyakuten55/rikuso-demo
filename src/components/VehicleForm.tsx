'use client'

import { useState, useEffect } from 'react'
import { Car, ArrowLeft, Save, X } from 'lucide-react'
import { format } from 'date-fns'

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

interface VehicleFormProps {
  vehicle?: Vehicle | null
  onSave: (vehicle: Partial<Vehicle>) => void
  onCancel: () => void
}

export default function VehicleForm({ vehicle, onSave, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: '回送車',
    model: '',
    year: new Date().getFullYear(),
    driver: '',
    team: 'Bチーム',
    status: 'active' as const,
    lastInspection: format(new Date(), 'yyyy-MM-dd'),
    nextInspection: format(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 6ヶ月後
    mileage: 0,
    location: '本社',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plateNumber: vehicle.plateNumber,
        type: vehicle.type,
        model: vehicle.model,
        year: vehicle.year,
        driver: vehicle.driver || '',
        team: vehicle.team,
        status: vehicle.status,
        lastInspection: format(vehicle.lastInspection, 'yyyy-MM-dd'),
        nextInspection: format(vehicle.nextInspection, 'yyyy-MM-dd'),
        mileage: vehicle.mileage,
        location: vehicle.location,
        notes: vehicle.notes || ''
      })
    }
  }, [vehicle])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = 'ナンバープレートは必須です'
    }

    if (!formData.model.trim()) {
      newErrors.model = '車種・モデルは必須です'
    }

    if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = '正しい年式を入力してください'
    }

    if (formData.mileage < 0) {
      newErrors.mileage = '走行距離は0以上の値を入力してください'
    }

    const lastInspectionDate = new Date(formData.lastInspection)
    const nextInspectionDate = new Date(formData.nextInspection)

    if (nextInspectionDate <= lastInspectionDate) {
      newErrors.nextInspection = '次回点検日は前回点検日より後の日付を入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const vehicleData = {
      ...formData,
      lastInspection: new Date(formData.lastInspection),
      nextInspection: new Date(formData.nextInspection),
      driver: formData.driver.trim() || undefined
    }

    onSave(vehicleData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const vehicleTypes = [
    '回送車',
    '積載車',
    '乗用車',
    '軽自動車',
    'トラック',
    'バン',
    'その他'
  ]

  const locations = [
    '本社',
    '整備工場',
    '修理工場',
    '緊急修理工場',
    '顧客先',
    'オークション会場',
    'その他'
  ]

  const drivers = [
    '田中太郎',
    '佐藤花子',
    '鈴木一郎',
    '高橋二郎',
    '山田三郎',
    '伊藤四郎',
    '渡辺五郎',
    '中村六郎'
  ]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Car className="h-8 w-8 mr-3 text-primary-600" />
          {vehicle ? '車両編集' : '新規車両登録'}
        </h1>
      </div>

      {/* フォーム */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ナンバープレート <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`input-field ${errors.plateNumber ? 'border-red-500' : ''}`}
                  placeholder="例: 品川 501 あ 1234"
                  value={formData.plateNumber}
                  onChange={(e) => handleChange('plateNumber', e.target.value)}
                />
                {errors.plateNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.plateNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  車両タイプ <span className="text-red-500">*</span>
                </label>
                <select
                  className="input-field"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  車種・モデル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`input-field ${errors.model ? 'border-red-500' : ''}`}
                  placeholder="例: トヨタ ハイエース"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年式 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className={`input-field ${errors.year ? 'border-red-500' : ''}`}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => handleChange('year', parseInt(e.target.value))}
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                )}
              </div>
            </div>
          </div>

          {/* 運用情報 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">運用情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  担当ドライバー
                </label>
                <select
                  className="input-field"
                  value={formData.driver}
                  onChange={(e) => handleChange('driver', e.target.value)}
                >
                  <option value="">未割当</option>
                  {drivers.map(driver => (
                    <option key={driver} value={driver}>{driver}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  チーム <span className="text-red-500">*</span>
                </label>
                <select
                  className="input-field"
                  value={formData.team}
                  onChange={(e) => handleChange('team', e.target.value)}
                >
                  <option value="Bチーム">Bチーム</option>
                  <option value="Cチーム">Cチーム</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス <span className="text-red-500">*</span>
                </label>
                <select
                  className="input-field"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="active">稼働中</option>
                  <option value="maintenance">メンテナンス</option>
                  <option value="inspection">点検中</option>
                  <option value="breakdown">故障</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在地 <span className="text-red-500">*</span>
                </label>
                <select
                  className="input-field"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 点検・メンテナンス情報 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">点検・メンテナンス情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  前回点検日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.lastInspection}
                  onChange={(e) => handleChange('lastInspection', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  次回点検日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`input-field ${errors.nextInspection ? 'border-red-500' : ''}`}
                  value={formData.nextInspection}
                  onChange={(e) => handleChange('nextInspection', e.target.value)}
                />
                {errors.nextInspection && (
                  <p className="mt-1 text-sm text-red-600">{errors.nextInspection}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  走行距離 (km) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className={`input-field ${errors.mileage ? 'border-red-500' : ''}`}
                  min="0"
                  step="1"
                  value={formData.mileage}
                  onChange={(e) => handleChange('mileage', parseInt(e.target.value) || 0)}
                />
                {errors.mileage && (
                  <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>
                )}
              </div>
            </div>
          </div>

          {/* 備考 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備考・特記事項
            </label>
            <textarea
              rows={3}
              className="input-field"
              placeholder="車両に関する特記事項があれば入力してください"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>

          {/* 操作ボタン */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 mr-2 inline" />
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{vehicle ? '更新' : '登録'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 