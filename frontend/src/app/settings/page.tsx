"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Store,
  Clock,
  Phone,
  Mail,
  MapPin,
  Globe,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Save,
  RefreshCw
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface RestaurantSettings {
  namaRestoran: string
  alamat: string
  telepon: string
  email: string
  website: string
  jamOperasional: {
    buka: string
    tutup: string
  }
  deskripsi: string
}

interface NotificationSettings {
  emailNotifications: boolean
  orderNotifications: boolean
  lowStockAlerts: boolean
  dailyReports: boolean
}

interface SystemSettings {
  autoBackup: boolean
  maintenanceMode: boolean
  debugMode: boolean
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>({
    namaRestoran: 'Pojok Citayam',
    alamat: 'Citayam, Kota Depok',
    telepon: '+62 21 1234 5678',
    email: 'info@pojokcitayam.com',
    website: 'https://pojokcitayam.com',
    jamOperasional: {
      buka: '08:00',
      tutup: '22:00'
    },
    deskripsi: 'Nikmati hidangan lezat dengan cita rasa autentik di Pojok Citayam'
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    dailyReports: false
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoBackup: true,
    maintenanceMode: false,
    debugMode: false
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSaveRestaurantSettings = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Berhasil",
      description: "Pengaturan restoran berhasil disimpan.",
    })
    setIsSaving(false)
  }

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Berhasil",
      description: "Pengaturan notifikasi berhasil disimpan.",
    })
    setIsSaving(false)
  }

  const handleSaveSystemSettings = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Berhasil",
      description: "Pengaturan sistem berhasil disimpan.",
    })
    setIsSaving(false)
  }

  const handleBackup = async () => {
    toast({
      title: "Backup Dimulai",
      description: "Sedang membuat backup data...",
    })
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast({
      title: "Backup Berhasil",
      description: "Backup data telah selesai.",
    })
  }

  const handleRestore = () => {
    if (confirm('Apakah Anda yakin ingin merestore data dari backup?')) {
      toast({
        title: "Restore Dimulai",
        description: "Sedang merestore data...",
      })
    }
  }

  const handleExportData = () => {
    // Simulate data export
    const data = {
      restaurant: restaurantSettings,
      notifications: notificationSettings,
      system: systemSettings,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settings_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Export Berhasil",
      description: "Pengaturan telah diekspor.",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan sistem Pojok Citayam
          </p>
        </div>

        {/* Restaurant Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Pengaturan Restoran
            </CardTitle>
            <CardDescription>
              Informasi dasar restoran Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="namaRestoran">Nama Restoran</Label>
                <Input
                  id="namaRestoran"
                  value={restaurantSettings.namaRestoran}
                  onChange={(e) => setRestaurantSettings(prev => ({ ...prev, namaRestoran: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telepon">Telepon</Label>
                <Input
                  id="telepon"
                  value={restaurantSettings.telepon}
                  onChange={(e) => setRestaurantSettings(prev => ({ ...prev, telepon: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={restaurantSettings.email}
                  onChange={(e) => setRestaurantSettings(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={restaurantSettings.website}
                  onChange={(e) => setRestaurantSettings(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                value={restaurantSettings.alamat}
                onChange={(e) => setRestaurantSettings(prev => ({ ...prev, alamat: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jamBuka">Jam Buka</Label>
                <Input
                  id="jamBuka"
                  type="time"
                  value={restaurantSettings.jamOperasional.buka}
                  onChange={(e) => setRestaurantSettings(prev => ({ 
                    ...prev, 
                    jamOperasional: { ...prev.jamOperasional, buka: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jamTutup">Jam Tutup</Label>
                <Input
                  id="jamTutup"
                  type="time"
                  value={restaurantSettings.jamOperasional.tutup}
                  onChange={(e) => setRestaurantSettings(prev => ({ 
                    ...prev, 
                    jamOperasional: { ...prev.jamOperasional, tutup: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={restaurantSettings.deskripsi}
                onChange={(e) => setRestaurantSettings(prev => ({ ...prev, deskripsi: e.target.value }))}
                rows={3}
              />
            </div>

            <Button onClick={handleSaveRestaurantSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Restoran'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Pengaturan Notifikasi
            </CardTitle>
            <CardDescription>
              Kelola notifikasi sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifikasi Email</Label>
                <p className="text-sm text-muted-foreground">
                  Terima notifikasi melalui email
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifikasi Pesanan Baru</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi saat ada pesanan masuk
                </p>
              </div>
              <Switch
                checked={notificationSettings.orderNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, orderNotifications: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Peringatan Stok Habis</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi saat menu habis
                </p>
              </div>
              <Switch
                checked={notificationSettings.lowStockAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Laporan Harian</Label>
                <p className="text-sm text-muted-foreground">
                  Terima laporan harian otomatis
                </p>
              </div>
              <Switch
                checked={notificationSettings.dailyReports}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, dailyReports: checked }))}
              />
            </div>

            <Button onClick={handleSaveNotificationSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Notifikasi'}
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Pengaturan Sistem
            </CardTitle>
            <CardDescription>
              Pengaturan sistem dan keamanan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Backup data otomatis setiap hari
                </p>
              </div>
              <Switch
                checked={systemSettings.autoBackup}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Nonaktifkan sistem untuk maintenance
                </p>
              </div>
              <Switch
                checked={systemSettings.maintenanceMode}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Debug Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Tampilkan informasi debug
                </p>
              </div>
              <Switch
                checked={systemSettings.debugMode}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, debugMode: checked }))}
              />
            </div>

            <Button onClick={handleSaveSystemSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Sistem'}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Manajemen Data
            </CardTitle>
            <CardDescription>
              Backup dan restore data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Backup Data</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Buat backup lengkap data sistem
                </p>
                <Button onClick={handleBackup} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Backup Sekarang
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Restore Data</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Restore data dari backup
                </p>
                <Button onClick={handleRestore} variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Data
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Export/Import Pengaturan</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Export atau import pengaturan sistem
              </p>
              <div className="flex gap-2">
                <Button onClick={handleExportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Pengaturan
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Pengaturan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>
              Informasi akun admin yang sedang login
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Username</Label>
                  <p className="font-medium">{user}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge>Administrator</Badge>
                </div>
                <div>
                  <Label>Login Terakhir</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <Label>Session</Label>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}