'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReservationPage({ params }: { params: { id: string } }) {
  const [reservation, setReservation] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/reservations/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setReservation(data)
        const msLeft = new Date(data.expiresAt).getTime() - Date.now()
        setTimeLeft(Math.max(0, Math.floor(msLeft / 1000)))
      })
  }, [params.id])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleConfirm = async () => {
    const res = await fetch(`/api/reservations/${params.id}/confirm`, { method: 'POST' })
    if (res.status === 410) {
      setMessage('❌ Reservation expired! The item has been released.')
      setDone(true)
      return
    }
    setMessage('✅ Purchase confirmed! Thank you.')
    setDone(true)
    setReservation((prev: any) => ({ ...prev, status: 'CONFIRMED' }))
  }

  const handleCancel = async () => {
    await fetch(`/api/reservations/${params.id}/release`, { method: 'POST' })
    setMessage('Reservation cancelled. Returning to store...')
    setDone(true)
    setReservation((prev: any) => ({ ...prev, status: 'RELEASED' }))
    setTimeout(() => router.push('/'), 2000)
  }

  if (!reservation) return <div className="p-8">Loading...</div>

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Your Reservation</h1>
      
      <div className="border rounded-lg p-6 space-y-4">
        <div><span className="font-medium">Product:</span> {reservation.product?.name}</div>
        <div><span className="font-medium">Warehouse:</span> {reservation.warehouse?.name}</div>
        <div><span className="font-medium">Quantity:</span> {reservation.quantity}</div>
        <div><span className="font-medium">Status:</span> 
          <span className={`ml-2 font-semibold ${
            reservation.status === 'CONFIRMED' ? 'text-green-600' : 
            reservation.status === 'RELEASED' ? 'text-red-600' : 'text-yellow-600'
          }`}>{reservation.status}</span>
        </div>
        
        {!done && reservation.status === 'PENDING' && (
          <div className={`text-center text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
            ⏱ {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {message && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800">
          {message}
        </div>
      )}

      {!done && reservation.status === 'PENDING' && timeLeft > 0 && (
        <div className="mt-6 flex gap-4">
          <button onClick={handleConfirm} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold">
            ✅ Confirm Purchase
          </button>
          <button onClick={handleCancel} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold">
            ❌ Cancel
          </button>
        </div>
      )}
    </main>
  )
}