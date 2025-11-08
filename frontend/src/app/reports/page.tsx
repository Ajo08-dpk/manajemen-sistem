"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Receipt,
  Utensils,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { useState, useEffect } from "react"

interface Order {
  id: string
  total_price: number
  status: string
  created_at: string
  customer: {
    nama: string
  }
  orderItems: {
    product: {
      nama_item: string
      kategori: string
    }
    qty: number
    harga: number
  }[]
}

interface MenuItem {
  id: string
  nama_item: string
  kategori: string
  harga: number
  ketersediaan: string
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState('month')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersResponse, menuResponse] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/menu')
      ])

      const ordersData = await ordersResponse.json()
      const menuData = await menuResponse.json()

      setOrders(ordersData)
      setMenuItems(menuData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredOrders = () => {
    const now = new Date()
    let startDate = new Date()

    switch (periodFilter) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return orders.filter(order => new Date(order.created_at) >= startDate)
  }

  const filteredOrders = getFilteredOrders()

  // Calculate metrics
  const totalRevenue = filteredOrders
    .filter(order => order.status === 'Completed')
    .reduce((total, order) => total + order.total_price, 0)

  const totalOrders = filteredOrders.length
  const completedOrders = filteredOrders.filter(order => order.status === 'Completed').length
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

  const totalCustomers = new Set(filteredOrders.map(order => order.customer.nama)).size

  // Top selling items
  const topSellingItems = menuItems.map(item => {
    const totalSold = filteredOrders
      .flatMap(order => order.orderItems)
      .filter(orderItem => orderItem.product.nama_item === item.nama_item)
      .reduce((total, orderItem) => total + orderItem.qty, 0)

    return {
      ...item,
      totalSold,
      totalRevenue: totalSold * item.harga
    }
  }).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5)

  // Revenue by category
  const revenueByCategory = menuItems.reduce((acc, item) => {
    const categoryRevenue = filteredOrders
      .flatMap(order => order.orderItems)
      .filter(orderItem => orderItem.product.nama_item === item.nama_item)
      .reduce((total, orderItem) => total + (orderItem.qty * orderItem.harga), 0)

    if (!acc[item.kategori]) {
      acc[item.kategori] = 0
    }
    acc[item.kategori] += categoryRevenue
    return acc
  }, {} as Record<string, number>)

  // Daily revenue trend (last 7 days)
  const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const dayRevenue = filteredOrders
      .filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= date && orderDate < nextDate && order.status === 'Completed'
      })
      .reduce((total, order) => total + order.total_price, 0)

    return {
      date: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
      revenue: dayRevenue
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Memuat data laporan...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
            <p className="text-muted-foreground">
              Analisis performa bisnis Pojok Citayam
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">30 Hari Terakhir</SelectItem>
                <SelectItem value="quarter">3 Bulan Terakhir</SelectItem>
                <SelectItem value="year">1 Tahun Terakhir</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +12.5% dari periode sebelumnya
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +8.2% dari periode sebelumnya
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tingkat Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                -2.1% dari periode sebelumnya
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pelanggan Unik</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +15.3% dari periode sebelumnya
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Revenue Trend */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Tren Pendapatan Harian</CardTitle>
              <CardDescription>
                Pendapatan 7 hari terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {dailyRevenue.map((day, index) => {
                  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue))
                  const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/20 rounded-t relative">
                        <div 
                          className="bg-primary rounded-t transition-all duration-300"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground text-center">
                        {day.date.split(' ')[0]}
                      </span>
                      <span className="text-xs font-medium">
                        {formatCurrency(day.revenue)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Category */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Pendapatan per Kategori</CardTitle>
              <CardDescription>
                Berdasarkan jenis menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(revenueByCategory).map(([category, revenue]) => {
                  const total = Object.values(revenueByCategory).reduce((sum, val) => sum + val, 0)
                  const percentage = total > 0 ? (revenue / total) * 100 : 0
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span>{formatCurrency(revenue)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Terlaris</CardTitle>
            <CardDescription>
              Menu yang paling banyak dipesan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.nama_item}</p>
                      <p className="text-sm text-muted-foreground">{item.kategori}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.totalSold} terjual</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}