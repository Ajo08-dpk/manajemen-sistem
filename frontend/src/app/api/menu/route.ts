import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const menuItems = await db.menuItem.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama_item, kategori, harga, deskripsi, gambar_url } = body

    const menuItem = await db.menuItem.create({
      data: {
        nama_item,
        kategori,
        harga: parseInt(harga),
        deskripsi,
        gambar_url,
        ketersediaan: 'Available'
      }
    })

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}