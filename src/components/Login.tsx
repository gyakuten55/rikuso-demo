'use client'

import { useState } from 'react'
import { User, Eye, EyeOff, Building } from 'lucide-react'
import { User as UserType } from '@/types'

interface LoginProps {
  onLogin: (user: UserType) => void
  onError: (message: string) => void
}

export default function Login({ onLogin, onError }: LoginProps) {
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // サンプルユーザーデータ（実際の実装ではAPIから取得）
  const sampleUsers: UserType[] = [
    {
      id: 1,
      employeeId: 'ADMIN001',
      name: '管理者',
      team: '管理',
      role: 'admin',
      isActive: true
    },
    {
      id: 2,
      employeeId: 'B001',
      name: '田中太郎',
      team: 'Bチーム',
      role: 'driver',
      isActive: true
    },
    {
      id: 3,
      employeeId: 'C001',
      name: '佐藤花子',
      team: 'Cチーム',
      role: 'driver',
      isActive: true
    },
    {
      id: 4,
      employeeId: 'B002',
      name: '鈴木一郎',
      team: 'Bチーム',
      role: 'driver',
      isActive: true
    },
    {
      id: 5,
      employeeId: 'C002',
      name: '高橋二郎',
      team: 'Cチーム',
      role: 'driver',
      isActive: true
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 簡単な認証ロジック（実際の実装ではAPIを使用）
      await new Promise(resolve => setTimeout(resolve, 1000)) // ローディング演出

      // 社員番号とパスワードの両方をチェック
      const user = sampleUsers.find(u => u.employeeId === employeeId && u.isActive)
      
      if (user && password.length > 0) {
        // パスワードが入力されていれば認証成功
        const authenticatedUser: UserType = {
          ...user,
          lastLogin: new Date()
        }
        onLogin(authenticatedUser)
      } else if (!user) {
        onError('社員番号が見つかりません。正しい社員番号を入力してください。')
      } else {
        onError('パスワードを入力してください。')
      }
    } catch (error) {
      onError('ログインに失敗しました。しばらく時間をおいて再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">東京陸送株式会社</h1>
            <p className="text-gray-600 mt-2">統合管理システム</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                社員番号
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="例: B001, C001"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="パスワードを入力"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !employeeId || !password}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </div>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ログインに問題がある場合は、管理者にお問い合わせください
            </p>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>テスト用社員番号:</strong><br />
              管理者: ADMIN001 | 運転手: B001, C001, B002, C002<br />
              パスワード: 任意の文字列
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 