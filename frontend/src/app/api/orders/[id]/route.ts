import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await db.order.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    // Validate status transitions
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Completed', 'Canceled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const order = await db.order.update({
      where: { id: params.id },
      data: {
        status,
        updated_at: new Date()
      },
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
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First delete order items
    await db.orderItem.deleteMany({
      where: { order_id: params.id }
    })

    // Then delete the order
    await db.order.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}