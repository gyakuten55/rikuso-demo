'use client'

import { Car, Users, Calendar, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react'
import { Vehicle, Driver } from '@/types'
import { differenceInDays } from 'date-fns'

interface DashboardStatsProps {
  vehicles: Vehicle[]
  drivers: Driver[]
}

export default function DashboardStats({ vehicles, drivers }: DashboardStatsProps) {
  // 統計データを計算
  const totalVehicles = vehicles.length
  const activeDrivers = drivers.filter(d => d.status === 'working').length
  const todayDispatch = drivers.filter(d => d.status === 'working' && d.assignedVehicle).length
  
  // 点検要注意車両（7日以内または期限超過）
  const urgentInspections = vehicles.filter(vehicle => {
    const daysUntilInspection = differenceInDays(vehicle.nextInspection, new Date())
    return daysUntilInspection <= 7
  }).length

  const stats = [
    {
      title: '登録車両数',
      value: totalVehicles.toString(),
      change: '+3',
      changeType: 'increase',
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      title: 'アクティブドライバー',
      value: activeDrivers.toString(),
      change: '+2',
      changeType: 'increase',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: '今日の配車予定',
      value: todayDispatch.toString(),
      change: '-5',
      changeType: 'decrease',
      icon: Calendar,
      color: 'bg-yellow-500',
    },
    {
      title: '点検要注意車両',
      value: urgentInspections.toString(),
      change: '+1',
      changeType: 'increase',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isIncrease = stat.changeType === 'increase'
        
        return (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp 
                    className={`h-4 w-4 mr-1 ${
                      isIncrease ? 'text-green-500 rotate-0' : 'text-red-500 rotate-180'
                    }`} 
                  />
                  <span 
                    className={`text-sm font-medium ${
                      isIncrease ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">前週比</span>
                </div>
              </div>
              <div className={`h-12 w-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 