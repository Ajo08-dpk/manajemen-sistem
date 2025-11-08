"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Utensils, 
  Users, 
  Receipt, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ChefHat
} from "lucide-react"
import { useState, useEffect } from "react"

interface Order {
  id: string
  customer_id: string
  customer: {
    nama: string
    email: string
    telepon: string
  }
  order_type: 'DineIn' | 'Takeaway'
  table_number?: string
  pickup_time?: string
  total_price: number
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Completed' | 'Canceled'
  created_at: string
  updated_at: string
}

interface MenuItem {
  id: string
  nama_item: string
  kategori: 'Makanan' | 'Minuman'
  harga: number
  ketersediaan: 'Available' | 'OutOfStock'
  deskripsi?: string
  gambar_url?: string
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

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

  // Calculate metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const activeOrdersToday = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime() && 
           (order.status === 'Pending' || order.status === 'Preparing')
  })

  const availableMenuItems = menuItems.filter(item => item.ketersediaan === 'Available')

  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const monthlyRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= currentMonth && order.status === 'Completed'
    })
    .reduce((total, order) => total + order.total_price, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Memuat data dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang di Sistem Manajemen Pojok Citayam
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Order Aktif Hari Ini</CardTitle>
              <div className="p-2 bg-blue-200 rounded-full">
                <Receipt className="h-4 w-4 text-blue-800" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{activeOrdersToday.length}</div>
              <p className="text-xs text-blue-700">
                {activeOrdersToday.filter(o => o.status === 'Pending').length} pending, {activeOrdersToday.filter(o => o.status === 'Preparing').length} preparing
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Menu Tersedia</CardTitle>
              <div className="p-2 bg-green-200 rounded-full">
                <Utensils className="h-4 w-4 text-green-800" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{availableMenuItems.length}</div>
              <p className="text-xs text-green-700">
                dari {menuItems.length} total menu
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Pendapatan Bulan Ini</CardTitle>
              <div className="p-2 bg-purple-200 rounded-full">
                <DollarSign className="h-4 w-4 text-purple-800" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(monthlyRevenue)}
              </div>
              <p className="text-xs text-purple-700">
                {orders.filter(o => o.status === 'Completed' && new Date(o.created_at) >= currentMonth).length} order completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Pesanan Terbaru</CardTitle>
              <CardDescription>Order yang sedang diproses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {order.id.slice(0, 8).toUpperCase()} - {order.customer.nama}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_type === 'DineIn' ? `Meja ${order.table_number}` : `Takeaway • ${new Date(order.pickup_time || order.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          order.status === 'Completed' ? 'default' :
                          order.status === 'Preparing' ? 'secondary' :
                          order.status === 'Confirmed' ? 'outline' : 
                          order.status === 'Pending' ? 'destructive' : 'destructive'
                        }
                        className={
                          order.status === 'Pending' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          order.status === 'Preparing' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          order.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {order.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                        {order.status === 'Confirmed' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {order.status === 'Preparing' && <ChefHat className="w-3 h-3 mr-1" />}
                        {order.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {order.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(order.total_price)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Menu Populer</CardTitle>
              <CardDescription>Menu yang paling sering dipesan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Nasi Goreng Spesial", orders: 15, category: "Makanan" },
                  { name: "Es Teh Manis", orders: 12, category: "Minuman" },
                  { name: "Ayam Bakar Madu", orders: 10, category: "Makanan" },
                  { name: "Jus Alpukat", orders: 8, category: "Minuman" },
                  { name: "Sate Ayam", orders: 7, category: "Makanan" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{item.orders} pesanan</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}