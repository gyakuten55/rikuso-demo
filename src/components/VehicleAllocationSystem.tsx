'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Car, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Wrench
} from 'lucide-react'
import { Driver, Vehicle, DispatchSchedule, AttendanceRecord } from '@/types'

interface VehicleAllocation {
  vehicleId: number
  driverId: number | null
  date: Date
  timeSlot: {
    start: string
    end: string
  }
  status: 'allocated' | 'available' | 'maintenance' | 'inspection'
  priority: number
}

interface VehicleAllocationSystemProps {
  vehicles: Vehicle[]
  drivers: Driver[]
  schedules: DispatchSchedule[]
  attendanceRecords: AttendanceRecord[]
  onAllocationChange: (allocation: VehicleAllocation) => void
}

export default function VehicleAllocationSystem({
  vehicles,
  drivers,
  schedules,
  attendanceRecords,
  onAllocationChange
}: VehicleAllocationSystemProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [allocations, setAllocations] = useState<VehicleAllocation[]>([])
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
  const [workingDrivers, setWorkingDrivers] = useState<Driver[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [autoAssignMode, setAutoAssignMode] = useState(false)

  // 車両がメンテナンス中かチェック
  const isVehicleInMaintenance = useCallback((vehicle: Vehicle, date: Date): boolean => {
    if (vehicle.nextInspection) {
      const inspectionDate = new Date(vehicle.nextInspection)
      const daysDiff = Math.abs(inspectionDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 1 // 点検日の前後1日はメンテナンス扱い
    }
    return vehicle.status === 'maintenance'
  }, [])

  // 車両優先度の計算（燃費、走行距離、状態などを考慮）
  const calculateVehiclePriority = useCallback((vehicle: Vehicle): number => {
    let priority = 5 // ベース優先度

    // 走行距離による調整
    if (vehicle.mileage && vehicle.mileage < 50000) priority += 2
    else if (vehicle.mileage && vehicle.mileage > 100000) priority -= 1

    // 最終点検からの経過時間
    if (vehicle.lastInspection) {
      const daysSinceInspection = (Date.now() - vehicle.lastInspection.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceInspection < 30) priority += 1
      else if (daysSinceInspection > 90) priority -= 1
    }

    // 車両の種類による調整
    if (vehicle.type?.includes('2トン')) priority += 1
    if (vehicle.type?.includes('4トン')) priority += 2

    return Math.max(1, Math.min(10, priority))
  }, [])

  // 車両割り当て情報の生成
  const generateAllocations = useCallback((
    workingDriversList: Driver[], 
    availableVehiclesList: Vehicle[], 
    scheduledVehicles: number[]
  ) => {
    const newAllocations: VehicleAllocation[] = []
    const dateStr = selectedDate.toDateString()

    // スケジュール済みの車両
    schedules
      .filter(schedule => schedule.date.toDateString() === dateStr)
      .forEach(schedule => {
        newAllocations.push({
          vehicleId: schedule.vehicleId,
          driverId: schedule.driverId,
          date: selectedDate,
          timeSlot: schedule.timeSlot,
          status: 'allocated',
          priority: 1
        })
      })

    // 利用可能な車両
    availableVehiclesList.forEach(vehicle => {
      if (!scheduledVehicles.includes(vehicle.id)) {
        newAllocations.push({
          vehicleId: vehicle.id,
          driverId: null,
          date: selectedDate,
          timeSlot: { start: '08:00', end: '17:00' },
          status: 'available',
          priority: calculateVehiclePriority(vehicle)
        })
      }
    })

    // メンテナンス中の車両
    vehicles.forEach(vehicle => {
      if (isVehicleInMaintenance(vehicle, selectedDate)) {
        newAllocations.push({
          vehicleId: vehicle.id,
          driverId: null,
          date: selectedDate,
          timeSlot: { start: '00:00', end: '23:59' },
          status: vehicle.status === 'maintenance' ? 'maintenance' : 'inspection',
          priority: 0
        })
      }
    })

    setAllocations(newAllocations)
  }, [selectedDate, vehicles, schedules, isVehicleInMaintenance, calculateVehiclePriority])

  // 出勤ドライバーと利用可能車両を計算
  const calculateAvailability = useCallback(() => {
    const dateStr = selectedDate.toDateString()
    
    // その日に出勤予定のドライバー
    const attendingDrivers = drivers.filter(driver => {
      const attendance = attendanceRecords.find(record => 
        record.driverId === driver.id && 
        record.date.toDateString() === dateStr &&
        (record.status === 'present' || record.clockIn)
      )
      return attendance || driver.status === 'working'
    })

    // その日にスケジュールが入っているドライバー
    const scheduledDrivers = schedules
      .filter(schedule => schedule.date.toDateString() === dateStr)
      .map(schedule => schedule.driverId)

    // 実際に働く予定のドライバー
    const workingDriversList = attendingDrivers.filter(driver => 
      scheduledDrivers.includes(driver.id) || driver.status === 'working'
    )

    // 利用可能な車両（メンテナンス中でない車両）
    const availableVehiclesList = vehicles.filter(vehicle => 
      vehicle.status === 'active' && 
      !isVehicleInMaintenance(vehicle, selectedDate)
    )

    // その日のスケジュールで使用される車両
    const scheduledVehicles = schedules
      .filter(schedule => schedule.date.toDateString() === dateStr)
      .map(schedule => schedule.vehicleId)

    // 実際に利用可能な車両（スケジュールで使用されていない車両）
    const reallyAvailableVehicles = availableVehiclesList.filter(vehicle =>
      !scheduledVehicles.includes(vehicle.id)
    )

    setWorkingDrivers(workingDriversList)
    setAvailableVehicles(reallyAvailableVehicles)

    // 車両割り当て情報を生成
    generateAllocations(workingDriversList, availableVehiclesList, scheduledVehicles)
  }, [selectedDate, vehicles, drivers, schedules, attendanceRecords, isVehicleInMaintenance, generateAllocations])

  // 指定日の出勤ドライバーと利用可能車両を計算
  useEffect(() => {
    calculateAvailability()
  }, [calculateAvailability])



  // 自動車両割り当て
  const autoAssignVehicles = () => {
    const unassignedDrivers = workingDrivers.filter(driver => {
      return !allocations.some(allocation => 
        allocation.driverId === driver.id && allocation.status === 'allocated'
      )
    })

    const availableAllocations = allocations.filter(allocation => 
      allocation.status === 'available'
    ).sort((a, b) => b.priority - a.priority)

    const newAllocations = [...allocations]
    
    unassignedDrivers.forEach((driver, index) => {
      if (index < availableAllocations.length) {
        const allocation = availableAllocations[index]
        const allocationIndex = newAllocations.findIndex(a => 
          a.vehicleId === allocation.vehicleId && a.status === 'available'
        )
        
        if (allocationIndex !== -1) {
          newAllocations[allocationIndex] = {
            ...allocation,
            driverId: driver.id,
            status: 'allocated'
          }
        }
      }
    })

    setAllocations(newAllocations)
  }

  // 手動車両割り当て
  const assignVehicleToDriver = (vehicleId: number, driverId: number) => {
    setAllocations(prev => 
      prev.map(allocation => {
        if (allocation.vehicleId === vehicleId && allocation.status === 'available') {
          const newAllocation = {
            ...allocation,
            driverId,
            status: 'allocated' as const
          }
          onAllocationChange(newAllocation)
          return newAllocation
        }
        return allocation
      })
    )
  }

  // 車両割り当て解除
  const unassignVehicle = (vehicleId: number) => {
    setAllocations(prev => 
      prev.map(allocation => {
        if (allocation.vehicleId === vehicleId && allocation.status === 'allocated') {
          return {
            ...allocation,
            driverId: null,
            status: 'available' as const
          }
        }
        return allocation
      })
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'available':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'inspection':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    const statusTexts = {
      allocated: '割り当て済み',
      available: '利用可能',
      maintenance: 'メンテナンス',
      inspection: '点検中'
    }
    return statusTexts[status as keyof typeof statusTexts] || status
  }

  const filteredAllocations = allocations.filter(allocation => {
    const vehicle = vehicles.find(v => v.id === allocation.vehicleId)
    const driver = allocation.driverId ? drivers.find(d => d.id === allocation.driverId) : null
    
    const matchesSearch = !searchTerm || 
      vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || allocation.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: vehicles.length,
    allocated: allocations.filter(a => a.status === 'allocated').length,
    available: allocations.filter(a => a.status === 'available').length,
    maintenance: allocations.filter(a => a.status === 'maintenance' || a.status === 'inspection').length,
    workingDrivers: workingDrivers.length
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Car className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">車両割り当てシステム</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={autoAssignVehicles}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>自動割り当て</span>
          </button>
          
          <button
            onClick={calculateAvailability}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>更新</span>
          </button>
        </div>
      </div>

      {/* 日付選択と統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">対象日</h3>
          </div>
          
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.workingDrivers}</div>
              <div className="text-sm text-gray-600">出勤ドライバー</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <div className="text-sm text-gray-600">利用可能車両</div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-4">車両状況</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{stats.allocated}</div>
              <div className="text-sm text-green-700">割り当て済み</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{stats.available}</div>
              <div className="text-sm text-blue-700">利用可能</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{stats.maintenance}</div>
              <div className="text-sm text-red-700">メンテナンス</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-600">{stats.total}</div>
              <div className="text-sm text-gray-700">総車両数</div>
            </div>
          </div>
        </div>
      </div>

      {/* フィルターと検索 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="車両番号やドライバー名で検索"
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
            <option value="allocated">割り当て済み</option>
            <option value="available">利用可能</option>
            <option value="maintenance">メンテナンス</option>
            <option value="inspection">点検中</option>
          </select>
        </div>
      </div>

      {/* 車両一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAllocations
          .sort((a, b) => {
            // ステータス順（allocated > available > others）、その後優先度順
            const statusOrder = { allocated: 1, available: 2, maintenance: 3, inspection: 4 }
            const statusDiff = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
            if (statusDiff !== 0) return statusDiff
            return b.priority - a.priority
          })
          .map((allocation) => {
            const vehicle = vehicles.find(v => v.id === allocation.vehicleId)
            const driver = allocation.driverId ? drivers.find(d => d.id === allocation.driverId) : null
            
            if (!vehicle) return null

            return (
              <div key={allocation.vehicleId} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">{vehicle.plateNumber}</h4>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(allocation.status)}`}>
                    {getStatusText(allocation.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-16">車種:</span>
                    <span>{vehicle.type}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="w-16">走行距離:</span>
                    <span>{vehicle.mileage?.toLocaleString()}km</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="w-16">優先度:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full mr-1 ${
                            i < allocation.priority ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {driver && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{driver.name} ({driver.team})</span>
                    </div>
                  )}

                  {allocation.status === 'allocated' && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{allocation.timeSlot.start} - {allocation.timeSlot.end}</span>
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="mt-4 space-y-2">
                  {allocation.status === 'available' && (
                    <div className="space-y-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            assignVehicleToDriver(allocation.vehicleId, Number(e.target.value))
                          }
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="">ドライバーを選択</option>
                        {workingDrivers
                          .filter(d => !allocations.some(a => a.driverId === d.id && a.status === 'allocated'))
                          .map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} ({driver.team})
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}

                  {allocation.status === 'allocated' && (
                    <button
                      onClick={() => unassignVehicle(allocation.vehicleId)}
                      className="w-full px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      割り当て解除
                    </button>
                  )}

                  {(allocation.status === 'maintenance' || allocation.status === 'inspection') && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Wrench className="h-3 w-3" />
                      <span>
                        {allocation.status === 'inspection' ? '点検予定' : 'メンテナンス中'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
      </div>

      {filteredAllocations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Car className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>該当する車両がありません</p>
          <p className="text-sm">検索条件を変更してください</p>
        </div>
      )}
    </div>
  )
}