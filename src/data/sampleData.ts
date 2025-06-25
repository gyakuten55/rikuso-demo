import { Vehicle, Driver, DispatchSchedule, VehicleSwap, PerformanceMetrics, MaintenanceReport, FinancialReport, VacationRequest, VacationQuota, VacationSettings } from '@/types'

export const initialVehicles: Vehicle[] = [
  {
    id: 1,
    plateNumber: '品川 501 あ 1234',
    type: '回送車',
    model: 'トヨタ ハイエース',
    year: 2022,
    driver: '田中太郎',
    team: 'Bチーム',
    status: 'active',
    lastInspection: new Date('2024-12-01'),
    nextInspection: new Date('2025-06-01'),
    mileage: 45000,
    location: '本社',
    notes: '定期点検済み'
  },
  {
    id: 2,
    plateNumber: '品川 502 い 5678',
    type: '積載車',
    model: 'いすゞ エルフ',
    year: 2021,
    driver: '佐藤花子',
    team: 'Cチーム',
    status: 'inspection',
    lastInspection: new Date('2024-11-15'),
    nextInspection: new Date('2025-01-25'),
    mileage: 62000,
    location: '整備工場',
    notes: '明日点検予定'
  },
  {
    id: 3,
    plateNumber: '品川 503 う 9012',
    type: '回送車',
    model: 'ニッサン NV200',
    year: 2020,
    driver: '鈴木一郎',
    team: 'Bチーム',
    status: 'maintenance',
    lastInspection: new Date('2024-10-20'),
    nextInspection: new Date('2025-04-20'),
    mileage: 78000,
    location: '修理工場',
    notes: 'エンジン修理中'
  },
  {
    id: 4,
    plateNumber: '品川 504 え 3456',
    type: '積載車',
    model: 'いすゞ フォワード',
    year: 2023,
    team: 'Cチーム',
    status: 'active',
    lastInspection: new Date('2024-12-10'),
    nextInspection: new Date('2025-12-10'),
    mileage: 25000,
    location: '本社',
    notes: '新車'
  },
  {
    id: 5,
    plateNumber: '品川 505 か 7890',
    type: '回送車',
    model: 'トヨタ プロボックス',
    year: 2019,
    driver: '高橋二郎',
    team: 'Cチーム',
    status: 'breakdown',
    lastInspection: new Date('2024-09-15'),
    nextInspection: new Date('2025-03-15'),
    mileage: 92000,
    location: '緊急修理工場',
    notes: 'エンジントラブル発生'
  }
]

export const initialDrivers: Driver[] = [
  {
    id: 1,
    name: '田中太郎',
    team: 'Bチーム',
    employeeId: 'B001',
    status: 'working',
    assignedVehicle: '品川 501 あ 1234'
  },
  {
    id: 2,
    name: '佐藤花子',
    team: 'Cチーム',
    employeeId: 'C001',
    status: 'working',
    assignedVehicle: '品川 502 い 5678'
  },
  {
    id: 3,
    name: '鈴木一郎',
    team: 'Bチーム',
    employeeId: 'B002',
    status: 'vacation',
    assignedVehicle: '品川 503 う 9012'
  },
  {
    id: 4,
    name: '高橋二郎',
    team: 'Cチーム',
    employeeId: 'C002',
    status: 'working',
    assignedVehicle: '品川 505 か 7890'
  },
  {
    id: 5,
    name: '山田三郎',
    team: 'Bチーム',
    employeeId: 'B003',
    status: 'available'
  },
  {
    id: 6,
    name: '伊藤四郎',
    team: 'Cチーム',
    employeeId: 'C003',
    status: 'available'
  }
]

export const initialSchedules: DispatchSchedule[] = [
  {
    id: 1,
    date: new Date(),
    driverId: 1,
    driverName: '田中太郎',
    vehicleId: 1,
    vehicleNumber: '品川 501 あ 1234',
    team: 'Bチーム',
    route: {
      origin: '東京オートサロン',
      destination: 'ガリバー府中店',
      waypoints: ['八王子IC']
    },
    timeSlot: {
      start: '09:00',
      end: '12:00'
    },
    status: 'in_progress',
    priority: 'urgent',
    clientInfo: {
      name: 'ガリバー府中店',
      contact: '042-123-4567',
      notes: '当日受注の至急便'
    },
    cargoInfo: {
      type: '中古車回送',
      count: 1,
      notes: 'トヨタ アクア 2020年式'
    },
    notes: '荷受け時に傷チェック必要',
    createdAt: new Date('2024-12-23T08:00:00'),
    updatedAt: new Date('2024-12-23T08:30:00')
  },
  {
    id: 2,
    date: new Date(),
    driverId: 2,
    driverName: '佐藤花子',
    vehicleId: 2,
    vehicleNumber: '品川 502 い 5678',
    team: 'Cチーム',
    route: {
      origin: '羽田空港',
      destination: 'カーセブン町田店'
    },
    timeSlot: {
      start: '10:30',
      end: '14:00'
    },
    status: 'scheduled',
    priority: 'high',
    clientInfo: {
      name: 'カーセブン町田店',
      contact: '042-987-6543'
    },
    cargoInfo: {
      type: '建設機械運送',
      count: 1,
      notes: 'ミニユンボ YB10-3'
    },
    createdAt: new Date('2024-12-22T16:00:00'),
    updatedAt: new Date('2024-12-22T16:00:00')
  },
  {
    id: 3,
    date: new Date(),
    driverId: 4,
    driverName: '高橋二郎',
    vehicleId: 5,
    vehicleNumber: '品川 505 か 7890',
    team: 'Cチーム',
    route: {
      origin: 'JAA四日市',
      destination: 'アップル横浜店',
      waypoints: ['海老名SA']
    },
    timeSlot: {
      start: '13:00',
      end: '17:30'
    },
    status: 'scheduled',
    priority: 'normal',
    clientInfo: {
      name: 'アップル横浜店',
      contact: '045-456-7890'
    },
    cargoInfo: {
      type: 'オークション車両',
      count: 1,
      notes: 'レクサス RX 2019年式'
    },
    createdAt: new Date('2024-12-22T14:30:00'),
    updatedAt: new Date('2024-12-22T14:30:00')
  },
  {
    id: 4,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    driverId: 5,
    driverName: '山田三郎',
    vehicleId: 4,
    vehicleNumber: '品川 504 え 3456',
    team: 'Bチーム',
    route: {
      origin: '本社',
      destination: 'トヨタレンタカー新宿店'
    },
    timeSlot: {
      start: '08:00',
      end: '11:00'
    },
    status: 'scheduled',
    priority: 'normal',
    clientInfo: {
      name: 'トヨタレンタカー新宿店',
      contact: '03-1234-5678'
    },
    cargoInfo: {
      type: 'レンタカー回送',
      count: 2,
      notes: 'アルファード×2台'
    },
    createdAt: new Date('2024-12-22T18:00:00'),
    updatedAt: new Date('2024-12-22T18:00:00')
  },
  {
    id: 5,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    driverId: 6,
    driverName: '伊藤四郎',
    vehicleId: 3,
    vehicleNumber: '品川 503 う 9012',
    team: 'Cチーム',
    route: {
      origin: 'USS東京',
      destination: 'ガリバー立川店'
    },
    timeSlot: {
      start: '14:00',
      end: '16:30'
    },
    status: 'scheduled',
    priority: 'low',
    clientInfo: {
      name: 'ガリバー立川店',
      contact: '042-567-8901'
    },
    cargoInfo: {
      type: '中古車回送',
      count: 1,
      notes: 'ホンダ フィット 2021年式'
    },
    createdAt: new Date('2024-12-23T10:00:00'),
    updatedAt: new Date('2024-12-23T10:00:00')
  }
]

export const initialVehicleSwaps: VehicleSwap[] = [
  {
    id: 1,
    scheduleId: 3,
    originalVehicleId: 5,
    newVehicleId: 4,
    reason: '車両故障のため代替車両に変更',
    swapTime: new Date('2024-12-23T11:30:00'),
    approvedBy: '配車責任者',
    status: 'pending'
  }
]

// レポートサンプルデータ
export const samplePerformanceMetrics: PerformanceMetrics = {
  period: '2024年12月',
  totalJobs: 156,
  completedJobs: 145,
  cancelledJobs: 8,
  urgentJobs: 23,
  completionRate: 93.0,
  onTimeRate: 89.7,
  averageJobDuration: 4.2,
  totalRevenue: 12450000,
  averageRevenuePerJob: 79808,
  teamPerformance: {
    'Bチーム': {
      jobs: 78,
      completion: 94.9,
      revenue: 6240000
    },
    'Cチーム': {
      jobs: 78,
      completion: 91.0,
      revenue: 6210000
    }
  },
  driverPerformance: {
    '1': { name: '田中太郎', jobs: 28, completion: 96.4, onTime: 92.9, rating: 4.8 },
    '2': { name: '佐藤花子', jobs: 26, completion: 88.5, onTime: 84.6, rating: 4.3 },
    '3': { name: '鈴木一郎', jobs: 24, completion: 95.8, onTime: 91.7, rating: 4.7 },
    '4': { name: '高橋二郎', jobs: 30, completion: 90.0, onTime: 86.7, rating: 4.4 },
    '5': { name: '山田三郎', jobs: 25, completion: 92.0, onTime: 88.0, rating: 4.5 },
    '6': { name: '伊藤四郎', jobs: 23, completion: 91.3, onTime: 87.0, rating: 4.2 }
  },
  vehicleUtilization: {
    '1': { plateNumber: '品川 501 あ 1234', utilizationRate: 87.5, maintenanceDays: 2, mileage: 45000 },
    '2': { plateNumber: '品川 502 い 5678', utilizationRate: 82.3, maintenanceDays: 4, mileage: 62000 },
    '3': { plateNumber: '品川 503 う 9012', utilizationRate: 75.1, maintenanceDays: 6, mileage: 78000 },
    '4': { plateNumber: '品川 504 え 3456', utilizationRate: 91.2, maintenanceDays: 1, mileage: 25000 },
    '5': { plateNumber: '品川 505 か 7890', utilizationRate: 68.9, maintenanceDays: 8, mileage: 92000 }
  }
}

export const sampleMaintenanceReport: MaintenanceReport = {
  period: '2024年12月',
  totalInspections: 45,
  completedInspections: 38,
  overdueInspections: 3,
  maintenanceCost: 1850000,
  downtime: 127,
  vehicleStatus: {
    active: 3,
    maintenance: 1,
    inspection: 1,
    breakdown: 0
  },
  upcomingInspections: 12,
  maintenanceByType: {
    '定期点検': { count: 18, cost: 720000, averageDuration: 2.5 },
    '車検': { count: 8, cost: 560000, averageDuration: 4.0 },
    '故障修理': { count: 12, cost: 450000, averageDuration: 3.2 },
    'オイル交換': { count: 7, cost: 120000, averageDuration: 0.5 }
  }
}

export const sampleFinancialReport: FinancialReport = {
  period: '2024年12月',
  totalRevenue: 12450000,
  totalCost: 8975000,
  netProfit: 3475000,
  profitMargin: 27.9,
  revenueByTeam: {
    'Bチーム': 6240000,
    'Cチーム': 6210000
  },
  revenueByServiceType: {
    '中古車回送': 4680000,
    'レンタカー回送': 3120000,
    '建設機械運送': 2850000,
    'オークション車両': 1800000
  },
  costBreakdown: {
    fuel: 2690000,
    maintenance: 1850000,
    labor: 3200000,
    insurance: 850000,
    other: 385000
  },
  monthlyTrend: [
    { month: '2024-08', revenue: 11200000, cost: 8100000, profit: 3100000 },
    { month: '2024-09', revenue: 11800000, cost: 8450000, profit: 3350000 },
    { month: '2024-10', revenue: 12100000, cost: 8750000, profit: 3350000 },
    { month: '2024-11', revenue: 12300000, cost: 8900000, profit: 3400000 },
    { month: '2024-12', revenue: 12450000, cost: 8975000, profit: 3475000 }
  ]
}

// 休暇管理システムのサンプルデータ
export const initialVacationRequests: VacationRequest[] = [
  {
    id: 1,
    driverId: 1,
    driverName: '田中太郎',
    team: 'Bチーム',
    employeeId: 'B001',
    type: 'annual',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-17'),
    days: 3,
    reason: '家族旅行のため',
    status: 'pending',
    requestedAt: new Date('2025-01-01'),
    isRecurring: false
  },
  {
    id: 2,
    driverId: 2,
    driverName: '佐藤花子',
    team: 'Bチーム',
    employeeId: 'B002',
    type: 'sick',
    startDate: new Date('2025-01-10'),
    endDate: new Date('2025-01-10'),
    days: 1,
    reason: '体調不良',
    status: 'approved',
    requestedAt: new Date('2025-01-09'),
    reviewedAt: new Date('2025-01-09'),
    reviewedBy: '管理者',
    isRecurring: false
  },
  {
    id: 3,
    driverId: 3,
    driverName: '鈴木一郎',
    team: 'Cチーム',
    employeeId: 'C001',
    type: 'annual',
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-01-22'),
    days: 3,
    reason: '私用',
    status: 'approved',
    requestedAt: new Date('2025-01-05'),
    reviewedAt: new Date('2025-01-06'),
    reviewedBy: '管理者',
    isRecurring: false
  },
  {
    id: 4,
    driverId: 4,
    driverName: '高橋次郎',
    team: 'Cチーム',
    employeeId: 'C002',
    type: 'personal',
    startDate: new Date('2025-01-25'),
    endDate: new Date('2025-01-25'),
    days: 1,
    reason: '子供の学校行事',
    status: 'pending',
    requestedAt: new Date('2025-01-08'),
    isRecurring: false
  },
  {
    id: 5,
    driverId: 1,
    driverName: '田中太郎',
    team: 'Bチーム',
    employeeId: 'B001',
    type: 'annual',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-02-01'),
    days: 1,
    reason: '定期休暇（毎週土曜日）',
    status: 'approved',
    requestedAt: new Date('2025-01-01'),
    reviewedAt: new Date('2025-01-02'),
    reviewedBy: '管理者',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringDays: [6] // 土曜日
  }
]

export const initialVacationQuotas: VacationQuota[] = [
  {
    id: 1,
    driverId: 1,
    year: 2025,
    totalDays: 20,
    usedDays: 5,
    remainingDays: 15,
    carryOverDays: 2
  },
  {
    id: 2,
    driverId: 2,
    year: 2025,
    totalDays: 18,
    usedDays: 3,
    remainingDays: 15,
    carryOverDays: 0
  },
  {
    id: 3,
    driverId: 3,
    year: 2025,
    totalDays: 20,
    usedDays: 4,
    remainingDays: 16,
    carryOverDays: 1
  },
  {
    id: 4,
    driverId: 4,
    year: 2025,
    totalDays: 15,
    usedDays: 2,
    remainingDays: 13,
    carryOverDays: 0
  }
]

export const initialVacationSettings: VacationSettings = {
  maxVacationDaysPerYear: 20,
  maxConsecutiveDays: 7,
  minAdvanceNoticeDays: 3,
  maxDriversOffPerDay: {
    'Bチーム': 2,
    'Cチーム': 2
  },
  maxDriversOffPerWeekday: {
    'Bチーム': {
      0: 1, // 日曜日
      1: 2, // 月曜日
      2: 2, // 火曜日
      3: 2, // 水曜日
      4: 2, // 木曜日
      5: 2, // 金曜日
      6: 3  // 土曜日
    },
    'Cチーム': {
      0: 1, // 日曜日
      1: 2, // 月曜日
      2: 2, // 火曜日
      3: 2, // 水曜日
      4: 2, // 木曜日
      5: 2, // 金曜日
      6: 3  // 土曜日
    }
  },
  blackoutDates: [
    new Date('2025-12-29'),
    new Date('2025-12-30'),
    new Date('2025-12-31')
  ],
  holidayDates: [
    new Date('2025-01-01'), // 元日
    new Date('2025-01-13'), // 成人の日
    new Date('2025-02-11'), // 建国記念の日
    new Date('2025-03-20'), // 春分の日
    new Date('2025-04-29'), // 昭和の日
    new Date('2025-05-03'), // 憲法記念日
    new Date('2025-05-04'), // みどりの日
    new Date('2025-05-05'), // こどもの日
    new Date('2025-07-21'), // 海の日
    new Date('2025-08-11'), // 山の日
    new Date('2025-09-15'), // 敬老の日
    new Date('2025-09-23'), // 秋分の日
    new Date('2025-10-13'), // スポーツの日
    new Date('2025-11-03'), // 文化の日
    new Date('2025-11-23'), // 勤労感謝の日
  ]
} 