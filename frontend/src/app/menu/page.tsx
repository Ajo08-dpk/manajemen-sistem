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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Utensils, 
  Plus, 
  Search,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  EyeOff,
  Save,
  X
} from "lucide-react"
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
  createdAt: string
  updatedAt: string
}

interface FormData {
  nama_item: string
  kategori: 'Makanan' | 'Minuman'
  harga: string
  deskripsi: string
  gambar_url: string
  ketersediaan: 'Available' | 'OutOfStock'
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    nama_item: '',
    kategori: 'Makanan',
    harga: '',
    deskripsi: '',
    gambar_url: '',
    ketersediaan: 'Available'
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
        description: "Gagal memuat data menu. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = menuItems

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

  const resetForm = () => {
    setFormData({
      nama_item: '',
      kategori: 'Makanan',
      harga: '',
      deskripsi: '',
      gambar_url: '',
      ketersediaan: 'Available'
    })
    setEditingItem(null)
  }

  const handleAddItem = async () => {
    if (!formData.nama_item || !formData.harga) {
      toast({
        title: "Data tidak lengkap",
        description: "Nama item dan harga harus diisi.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create menu item')
      }

      const newItem = await response.json()
      setMenuItems(prev => [newItem, ...prev])
      setIsAddDialogOpen(false)
      resetForm()
      
      toast({
        title: "Berhasil",
        description: "Menu item berhasil ditambahkan.",
      })
    } catch (error) {
      console.error('Error creating menu item:', error)
      toast({
        title: "Error",
        description: "Gagal menambah menu item. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      nama_item: item.nama_item,
      kategori: item.kategori,
      harga: item.harga.toString(),
      deskripsi: item.deskripsi || '',
      gambar_url: item.gambar_url || '',
      ketersediaan: item.ketersediaan
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateItem = async () => {
    if (!editingItem || !formData.nama_item || !formData.harga) {
      toast({
        title: "Data tidak lengkap",
        description: "Nama item dan harga harus diisi.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update menu item')
      }

      const updatedItem = await response.json()
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ))
      setIsEditDialogOpen(false)
      resetForm()
      
      toast({
        title: "Berhasil",
        description: "Menu item berhasil diperbarui.",
      })
    } catch (error) {
      console.error('Error updating menu item:', error)
      toast({
        title: "Error",
        description: "Gagal memperbarui menu item. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu item ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete menu item')
      }

      setMenuItems(prev => prev.filter(item => item.id !== id))
      
      toast({
        title: "Berhasil",
        description: "Menu item berhasil dihapus.",
      })
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast({
        title: "Error",
        description: "Gagal menghapus menu item. Silakan coba lagi.",
        variant: "destructive"
      })
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    const newStatus = item.ketersediaan === 'Available' ? 'OutOfStock' : 'Available'
    
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          ketersediaan: newStatus,
          harga: item.harga.toString()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update availability')
      }

      const updatedItem = await response.json()
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === item.id ? updatedItem : menuItem
      ))
      
      toast({
        title: "Berhasil",
        description: `Status ketersediaan ${item.nama_item} berhasil diperbarui.`,
      })
    } catch (error) {
      console.error('Error updating availability:', error)
      toast({
        title: "Error",
        description: "Gagal memperbarui status ketersediaan. Silakan coba lagi.",
        variant: "destructive"
      })
    }
  }

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
            <p className="mt-2 text-muted-foreground">Memuat data menu...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Kelola Menu</h1>
            <p className="text-muted-foreground">
              Kelola daftar menu restoran Pojok Citayam
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Menu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah Menu Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan menu baru ke daftar menu restoran
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nama_item" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="nama_item"
                    value={formData.nama_item}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama_item: e.target.value }))}
                    className="col-span-3"
                    placeholder="Nama menu"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kategori" className="text-right">
                    Kategori
                  </Label>
                  <Select value={formData.kategori} onValueChange={(value: 'Makanan' | 'Minuman') => setFormData(prev => ({ ...prev, kategori: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Makanan">Makanan</SelectItem>
                      <SelectItem value="Minuman">Minuman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="harga" className="text-right">
                    Harga
                  </Label>
                  <Input
                    id="harga"
                    type="number"
                    value={formData.harga}
                    onChange={(e) => setFormData(prev => ({ ...prev, harga: e.target.value }))}
                    className="col-span-3"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deskripsi" className="text-right">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                    className="col-span-3"
                    placeholder="Deskripsi menu (opsional)"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gambar_url" className="text-right">
                    Gambar URL
                  </Label>
                  <Input
                    id="gambar_url"
                    value={formData.gambar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, gambar_url: e.target.value }))}
                    className="col-span-3"
                    placeholder="URL gambar (opsional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddItem} disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
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
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="Makanan">Makanan</SelectItem>
              <SelectItem value="Minuman">Minuman</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Menu Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Menu</CardTitle>
            <CardDescription>
              Total {filteredItems.length} menu item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nama Menu</th>
                    <th className="text-left p-2">Kategori</th>
                    <th className="text-left p-2">Harga</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{item.nama_item}</p>
                          {item.deskripsi && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{item.kategori}</Badge>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{formatCurrency(item.harga)}</span>
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant={item.ketersediaan === 'Available' ? 'default' : 'destructive'}
                          className="cursor-pointer"
                          onClick={() => toggleAvailability(item)}
                        >
                          {item.ketersediaan === 'Available' ? (
                            <><Eye className="w-3 h-3 mr-1" />Tersedia</>
                          ) : (
                            <><EyeOff className="w-3 h-3 mr-1" />Habis</>
                          )}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
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

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak ada menu ditemukan</h3>
                <p className="text-muted-foreground">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Coba ubah filter atau kata kunci pencarian' 
                    : 'Belum ada menu yang ditambahkan'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Menu</DialogTitle>
              <DialogDescription>
                Perbarui informasi menu yang ada
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_nama_item" className="text-right">
                  Nama
                </Label>
                <Input
                  id="edit_nama_item"
                  value={formData.nama_item}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama_item: e.target.value }))}
                  className="col-span-3"
                  placeholder="Nama menu"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_kategori" className="text-right">
                  Kategori
                </Label>
                <Select value={formData.kategori} onValueChange={(value: 'Makanan' | 'Minuman') => setFormData(prev => ({ ...prev, kategori: value }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Makanan">Makanan</SelectItem>
                    <SelectItem value="Minuman">Minuman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_harga" className="text-right">
                  Harga
                </Label>
                <Input
                  id="edit_harga"
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData(prev => ({ ...prev, harga: e.target.value }))}
                  className="col-span-3"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_deskripsi" className="text-right">
                  Deskripsi
                </Label>
                <Textarea
                  id="edit_deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                  className="col-span-3"
                  placeholder="Deskripsi menu (opsional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_gambar_url" className="text-right">
                  Gambar URL
                </Label>
                <Input
                  id="edit_gambar_url"
                  value={formData.gambar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, gambar_url: e.target.value }))}
                  className="col-span-3"
                  placeholder="URL gambar (opsional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_ketersediaan" className="text-right">
                  Ketersediaan
                </Label>
                <Select value={formData.ketersediaan} onValueChange={(value: 'Available' | 'OutOfStock') => setFormData(prev => ({ ...prev, ketersediaan: value }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Tersedia</SelectItem>
                    <SelectItem value="OutOfStock">Habis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateItem} disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Perbarui'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}