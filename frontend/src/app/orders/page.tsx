"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Receipt, 
  Search,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  ChefHat,
  XCircle,
  Calendar,
  User,
  DollarSign,
  MapPin,
  Trash2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

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
  orderItems: {
    id: string
    product_id: string
    product: {
      id: string
      nama_item: string
      harga: number
    }
    qty: number
    harga: number
  }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      const updatedOrder = await response.json()
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ))
      
      toast({
        title: "Berhasil",
        description: `Status pesanan berhasil diperbarui menjadi ${newStatus}.`,
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Error",
        description: "Gagal memperbarui status pesanan. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      setOrders(prev => prev.filter(order => order.id !== orderId))
      
      toast({
        title: "Berhasil",
        description: "Pesanan berhasil dihapus.",
      })
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: "Error",
        description: "Gagal menghapus pesanan. Silakan coba lagi.",
        variant: "destructive"
      })
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailDialogOpen(true)
  }

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<Order['status'], Order['status'] | null> = {
      'Pending': 'Confirmed',
      'Confirmed': 'Preparing',
      'Preparing': 'Completed',
      'Completed': null,
      'Canceled': null
    }
    return statusFlow[currentStatus]
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Preparing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Canceled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-3 h-3 mr-1" />
      case 'Confirmed':
        return <AlertCircle className="w-3 h-3 mr-1" />
      case 'Preparing':
        return <ChefHat className="w-3 h-3 mr-1" />
      case 'Completed':
        return <CheckCircle className="w-3 h-3 mr-1" />
      case 'Canceled':
        return <XCircle className="w-3 h-3 mr-1" />
      default:
        return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Memuat data pesanan...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Daftar Pesanan</h1>
            <p className="text-muted-foreground">
              Kelola semua pesanan restoran Pojok Citayam
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pesanan berdasarkan ID, nama pelanggan, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Preparing">Preparing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Semua Pesanan</CardTitle>
            <CardDescription>
              Total {filteredOrders.length} pesanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Order ID</th>
                    <th className="text-left p-2">Pelanggan</th>
                    <th className="text-left p-2">Jenis</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Tanggal</th>
                    <th className="text-left p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <span className="font-mono text-sm font-medium">
                          {order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{order.customer.nama}</p>
                          <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          {order.order_type === 'DineIn' ? (
                            <><MapPin className="h-3 w-3" /> Dine-in</>
                          ) : (
                            <><Clock className="h-3 w-3" /> Takeaway</>
                          )}
                          {order.table_number && (
                            <span className="text-xs text-muted-foreground">
                              (Meja {order.table_number})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{formatCurrency(order.total_price)}</span>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <p>{formatDateTime(order.created_at)}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {getNextStatus(order.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                              disabled={isUpdating}
                              className="text-xs h-8 px-2"
                            >
                              {getNextStatus(order.status)}
                            </Button>
                          )}
                          
                          {order.status !== 'Completed' && order.status !== 'Canceled' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateOrderStatus(order.id, 'Canceled')}
                              disabled={isUpdating}
                              className="text-destructive hover:text-destructive"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteOrder(order.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak ada pesanan ditemukan</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Coba ubah filter atau kata kunci pencarian' 
                    : 'Belum ada pesanan yang masuk'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detail Pesanan</DialogTitle>
              <DialogDescription>
                Informasi lengkap pesanan {selectedOrder?.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nama Pelanggan</Label>
                    <p className="text-sm">{selectedOrder.customer.nama}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedOrder.customer.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Telepon</Label>
                    <p className="text-sm">{selectedOrder.customer.telepon}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Jenis Pesanan</Label>
                    <p className="text-sm">
                      {selectedOrder.order_type === 'DineIn' ? 'Dine-in' : 'Takeaway'}
                      {selectedOrder.table_number && ` - Meja ${selectedOrder.table_number}`}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <Label className="text-sm font-medium">Item Pesanan</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{item.product.nama_item}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.harga)} x {item.qty}
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(item.harga * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Harga:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(selectedOrder.total_price)}
                    </span>
                  </div>
                </div>

                {/* Status & Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tanggal Pesanan</Label>
                    <p className="text-sm">{formatDateTime(selectedOrder.created_at)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {getNextStatus(selectedOrder.status) && (
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)
                        setIsDetailDialogOpen(false)
                      }}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      Update ke {getNextStatus(selectedOrder.status)}
                    </Button>
                  )}
                  
                  {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Canceled' && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'Canceled')
                        setIsDetailDialogOpen(false)
                      }}
                      disabled={isUpdating}
                    >
                      Batalkan Pesanan
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}