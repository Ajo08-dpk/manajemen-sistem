"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Home, 
  Utensils, 
  Users, 
  Receipt, 
  Settings, 
  Menu,
  TrendingUp,
  Clock,
  ExternalLink,
  SeparatorHorizontal
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Menu",
    href: "/menu",
    icon: Utensils,
  },
  {
    title: "Pelanggan",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Pesanan",
    href: "/orders",
    icon: Receipt,
  },
  {
    title: "Laporan",
    href: "/reports",
    icon: TrendingUp,
  },
  {
    title: "Riwayat",
    href: "/history",
    icon: Clock,
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: Settings,
  },
]

const publicItems = [
  {
    title: "Lihat Menu Publik",
    href: "/public",
    icon: ExternalLink,
    isExternal: true
  }
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
}

export function Sidebar({ className, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "relative group flex flex-col h-full gap-4 p-4 data-[collapsed=true]:p-2",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed && "hidden"
        )}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Utensils className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg">Pojok Citayam</span>
        </div>
        {isCollapsed && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Utensils className="h-4 w-4" />
          </div>
        )}
      </div>

      <nav className="grid gap-1 group-[[data-collapsed=true]]:justify-center">
        {sidebarItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent",
              pathname === item.href && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className="h-4 w-4" />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
        
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground/50">
            <SeparatorHorizontal className="h-4 w-4" />
            <span className="text-xs">Publik</span>
            <SeparatorHorizontal className="h-4 w-4" />
          </div>
        )}
        
        {publicItems.map((item, index) => (
          <Link
            key={`public-${index}`}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent",
              pathname === item.href && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className="h-4 w-4" />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export function SidebarMobile() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Utensils className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg">Pojok Citayam</span>
          </div>
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
          <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground/50">
            <SeparatorHorizontal className="h-4 w-4" />
            <span className="text-xs">Publik</span>
            <SeparatorHorizontal className="h-4 w-4" />
          </div>
          {publicItems.map((item, index) => (
            <Link
              key={`public-${index}`}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}