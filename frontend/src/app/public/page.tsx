"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus,
  Trash2,
  Clock,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface MenuItem {
  id: string
  nama_item: string
  kategori: 'Makanan' | 'Minuman'
  harga: number
  ketersediaan: 'Available' | 'OutOfStock'
  deskripsi?: string
  gambar_url?: string
}

interface CartItem extends MenuItem {
  quantity: number
}

interface CustomerInfo {
  nama: string
  email: string
  telepon: string
}

interface OrderInfo {
  type: 'DineIn' | 'Takeaway'
  tableNumber?: string
  pickupTime?: string
}

export default function PublicPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [orderType, setOrderType] = useState<'DineIn' | 'Takeaway' | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    nama: '',
    email: '',
    telepon: ''
  })
  
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    type: 'DineIn',
    tableNumber: '',
    pickupTime: ''
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchMenuItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [menuItems, searchTerm, categoryFilter])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu')
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast({
        title: "Error",
        description: "Gagal memuat menu. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = menuItems.filter(item => item.ketersediaan === 'Available')

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nama_item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.kategori === categoryFilter)
    }

    setFilteredItems(filtered)
  }

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
    
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${item.nama_item} telah ditambahkan ke keranjang.`
    })
  }

  const updateQuantity = (id: string, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.harga * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleCheckout = async () => {
    if (!customerInfo.nama || !customerInfo.email || !customerInfo.telepon) {
      toast({
        title: "Data tidak lengkap",
        description: "Silakan lengkapi semua data pelanggan.",
        variant: "destructive"
      })
      return
    }

    if (orderInfo.type === 'DineIn' && !orderInfo.tableNumber) {
      toast({
        title: "Data tidak lengkap",
        description: "Silakan masukkan nomor meja.",
        variant: "destructive"
      })
      return
    }

    if (orderInfo.type === 'Takeaway' && !orderInfo.pickupTime) {
      toast({
        title: "Data tidak lengkap",
        description: "Silakan pilih waktu pengambilan.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // First, create or get customer
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerInfo),
      })

      if (!customerResponse.ok) {
        throw new Error('Failed to create customer')
      }

      const customer = await customerResponse.json()

      // Then create order
      const orderData = {
        customer_id: customer.id,
        order_type: orderInfo.type,
        table_number: orderInfo.type === 'DineIn' ? orderInfo.tableNumber : undefined,
        pickup_time: orderInfo.type === 'Takeaway' ? orderInfo.pickupTime : undefined,
        orderItems: cart.map(item => ({
          product_id: item.id,
          qty: item.quantity,
          harga: item.harga
        }))
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const order = await orderResponse.json()
      setOrderId(order.id)
      
      // Reset form
      setCart([])
      setCustomerInfo({ nama: '', email: '', telepon: '' })
      setOrderInfo({ type: 'DineIn', tableNumber: '', pickupTime: '' })
      setIsCheckoutOpen(false)
      
      toast({
        title: "Pesanan berhasil!",
        description: `Order ID: ${order.id}. Pesanan Anda telah diterima.`,
      })
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: "Error",
        description: "Gagal membuat pesanan. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat menu...</p>
        </div>
      </div>
    )
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-white text-2xl">✓</div>
            </div>
            <CardTitle className="text-2xl text-primary">Pesanan Berhasil!</CardTitle>
            <CardDescription>
              Terima kasih telah memesan di Pojok Citayam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="text-xl font-bold text-primary">{orderId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Pesanan Anda sedang diproses. Silakan tunggu konfirmasi lebih lanjut.
            </p>
            <Button 
              onClick={() => {
                setOrderId(null)
                setOrderType(null)
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Pesan Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!orderType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
        {/* Hero Section */}
        <div className="bg-primary text-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Pojok Citayam
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
                Nikmati hidangan lezat dengan cita rasa autentik
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Citayam, Kota Depok</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>08:00 - 22:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+62 21 1234 5678</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Type Selection */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Pilih Tipe Pesanan</h2>
            <p className="text-muted-foreground text-center mb-8">
              Silakan pilih apakah Anda ingin makan di tempat atau bawa pulang
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => setOrderType('DineIn')}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Makan di Tempat</CardTitle>
                  <CardDescription>
                    Nikmati suasana nyaman di kedai kami
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Pilih meja favorit Anda</li>
                    <li>• Layanan pelayan ramah</li>
                    <li>• Suasana nyaman</li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => setOrderType('Takeaway')}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Bawa Pulang</CardTitle>
                  <CardDescription>
                    Pesan dan ambil sesuai jadwal Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Hemat waktu</li>
                    <li>• Kemasan praktis</li>
                    <li>• Bisa dijadwalkan</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setOrderType(null)}
                className="text-muted-foreground hover:text-primary"
              >
                ← Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">Pojok Citayam</h1>
                <p className="text-sm text-muted-foreground">
                  {orderType === 'DineIn' ? 'Makan di Tempat' : 'Bawa Pulang'}
                </p>
              </div>
            </div>
            
            {/* Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Keranjang
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Keranjang Belanja</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Keranjang belanja kosong
                    </p>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.nama_item}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.harga)} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-lg text-primary">
                            {formatCurrency(getTotalPrice())}
                          </span>
                        </div>
                        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-primary hover:bg-primary/90">
                              Checkout
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Form Checkout</DialogTitle>
                              <DialogDescription>
                                Lengkapi data untuk menyelesaikan pesanan
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="nama">Nama Lengkap</Label>
                                <Input
                                  id="nama"
                                  value={customerInfo.nama}
                                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, nama: e.target.value }))}
                                  placeholder="Masukkan nama lengkap"
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={customerInfo.email}
                                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="email@example.com"
                                />
                              </div>
                              <div>
                                <Label htmlFor="telepon">Telepon</Label>
                                <Input
                                  id="telepon"
                                  value={customerInfo.telepon}
                                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, telepon: e.target.value }))}
                                  placeholder="08123456789"
                                />
                              </div>
                              
                              {orderType === 'DineIn' ? (
                                <div>
                                  <Label htmlFor="tableNumber">Nomor Meja</Label>
                                  <Input
                                    id="tableNumber"
                                    value={orderInfo.tableNumber}
                                    onChange={(e) => setOrderInfo(prev => ({ ...prev, tableNumber: e.target.value }))}
                                    placeholder="Contoh: A1, B2, C3"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <Label htmlFor="pickupTime">Waktu Pengambilan</Label>
                                  <Input
                                    id="pickupTime"
                                    type="datetime-local"
                                    value={orderInfo.pickupTime}
                                    onChange={(e) => setOrderInfo(prev => ({ ...prev, pickupTime: e.target.value }))}
                                    min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)}
                                  />
                                </div>
                              )}
                              
                              <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                  <span className="font-semibold">Total Pembayaran:</span>
                                  <span className="font-bold text-lg text-primary">
                                    {formatCurrency(getTotalPrice())}
                                  </span>
                                </div>
                                <Button 
                                  onClick={handleCheckout}
                                  disabled={isSubmitting}
                                  className="w-full bg-primary hover:bg-primary/90"
                                >
                                  {isSubmitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

        {/* Search and Filter */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="Makanan">Makanan</SelectItem>
                <SelectItem value="Minuman">Minuman</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {item.gambar_url ? (
                    <img
                      src={item.gambar_url}
                      alt={item.nama_item}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-4xl text-muted-foreground">🍽️</div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/90">
                      {item.kategori}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.nama_item}</CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(item.harga)}
                    </span>
                    <Badge 
                      variant={item.ketersediaan === 'Available' ? 'default' : 'destructive'}
                    >
                      {item.ketersediaan === 'Available' ? 'Tersedia' : 'Habis'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.deskripsi && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.deskripsi}
                    </p>
                  )}
                  <Button 
                    onClick={() => addToCart(item)}
                    disabled={item.ketersediaan === 'OutOfStock'}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.ketersediaan === 'Available' ? 'Tambah ke Keranjang' : 'Tidak Tersedia'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Tidak ada menu ditemukan</h3>
              <p className="text-muted-foreground">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }
