'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Reservation {
  id: string
  productId: string
  warehouseId: string
  quantity: number
  status: string
  expiresAt: string
  product: {
    name: string
    description: string
    price: number
  }
  warehouse: {
    name: string
    location: string
  }
}

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [releasing, setReleasing] = useState(false)

  const id = params.id as string

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then(r => r.json())
      .then(setReservation)
      .catch(err => setError('Failed to load reservation'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!reservation) return

    const interval = setInterval(() => {
      const now = new Date()
      const expires = new Date(reservation.expiresAt)
      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Expired')
        clearInterval(interval)
      } else {
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [reservation])

  const handleConfirm = async () => {
    setConfirming(true)
    const res = await fetch(`/api/reservations/${id}/confirm`, {
      method: 'POST'
    })

    if (res.ok) {
      const updated = await res.json()
      setReservation(updated)
      setError('')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to confirm reservation')
    }
    setConfirming(false)
  }

  const handleRelease = async () => {
    setReleasing(true)
    const res = await fetch(`/api/reservations/${id}/release`, {
      method: 'POST'
    })

    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to release reservation')
    }
    setReleasing(false)
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto p-8">Loading reservation...</div>
  }

  if (!reservation) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Reservation not found
        </div>
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Store
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Reservation Details</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="border rounded-lg p-6 shadow-md space-y-6">
        {/* Product Info */}
        <div>
          <h2 className="text-2xl font-semibold">{reservation.product.name}</h2>
          <p className="text-gray-600 mt-1">{reservation.product.description}</p>
          <p className="text-3xl font-bold mt-2">
            ₹{reservation.product.price.toLocaleString()}
          </p>
        </div>

        {/* Warehouse Info */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg">Warehouse</h3>
          <p className="text-gray-700">{reservation.warehouse.name}</p>
          <p className="text-gray-600 text-sm">{reservation.warehouse.location}</p>
        </div>

        {/* Quantity */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg">Quantity</h3>
          <p className="text-2xl font-bold">{reservation.quantity}</p>
          <p className="text-gray-600 text-sm">
            Total: ₹{(reservation.quantity * reservation.product.price).toLocaleString()}
          </p>
        </div>

        {/* Status & Timer */}
        <div className="border-t pt-4 bg-blue-50 rounded p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Status</h3>
              <p className={`text-lg font-bold ${
                reservation.status === 'PENDING' ? 'text-orange-600' :
                reservation.status === 'CONFIRMED' ? 'text-green-600' :
                'text-red-600'
              }`}>
                {reservation.status}
              </p>
            </div>
            {reservation.status === 'PENDING' && (
              <div>
                <h3 className="font-semibold text-lg">Time Left</h3>
                <p className="text-lg font-bold text-blue-600">{timeLeft}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {reservation.status === 'PENDING' && (
          <div className="border-t pt-4 flex gap-4">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {confirming ? 'Confirming...' : '✓ Confirm Order'}
            </button>
            <button
              onClick={handleRelease}
              disabled={releasing}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {releasing ? 'Releasing...' : '✕ Release'}
            </button>
          </div>
        )}

        {reservation.status === 'CONFIRMED' && (
          <div className="border-t pt-4 bg-green-50 rounded p-4">
            <p className="text-green-700 font-semibold">✓ Order confirmed! Your reservation is secure.</p>
          </div>
        )}

        {reservation.status === 'RELEASED' && (
          <div className="border-t pt-4 bg-gray-50 rounded p-4">
            <p className="text-gray-700 font-semibold">This reservation has been released.</p>
          </div>
        )}
      </div>

      <Link href="/" className="text-blue-600 hover:underline mt-6 inline-block">
        ← Back to Store
      </Link>
    </main>
  )
}
