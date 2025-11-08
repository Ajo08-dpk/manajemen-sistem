import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const orders = await db.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            nama: true,
            email: true,
            telepon: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                nama_item: true,
                harga: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customer_id, 
      order_type, 
      table_number, 
      pickup_time, 
      orderItems 
    } = body

    // Calculate total price
    let totalPrice = 0
    for (const item of orderItems) {
      const product = await db.menuItem.findUnique({
        where: { id: item.product_id }
      })
      if (product) {
        totalPrice += product.harga * item.qty
      }
    }

    const order = await db.order.create({
      data: {
        customer_id,
        order_type,
        table_number,
        pickup_time: pickup_time ? new Date(pickup_time) : null,
        total_price: totalPrice,
        status: 'Pending',
        orderItems: {
          create: orderItems.map((item: any) => ({
            product_id: item.product_id,
            qty: item.qty,
            harga: item.harga || 0
          }))
        }
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}