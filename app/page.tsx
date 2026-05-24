'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const handleReserve = async (productId: string, warehouseId: string) => {
    setError('')
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, warehouseId, quantity: 1 })
      })

      if (res.status === 409) {
        setError('Sorry! This item just went out of stock.')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create reservation')
        return
      }

      const reservation = await res.json()
      if (!reservation?.id) {
        setError('Invalid response from server')
        return
      }
      router.push(`/reservation/${reservation.id}`)
    } catch (err) {
      setError('Network error - please try again')
    }
  }

  if (loading) return <div className="p-8">Loading products...</div>

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Allo Store</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600 mt-1">{product.description}</p>
            <p className="text-2xl font-bold mt-2">₹{product.price.toLocaleString()}</p>
            <div className="mt-4 space-y-2">
              {product.stock.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{s.warehouse.name}</span>
                    <span className={`ml-2 text-sm ${s.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.available > 0 ? `${s.available} available` : 'Out of stock'}
                    </span>
                  </div>
                  {s.available > 0 && (
                    <button
                      onClick={() => handleReserve(product.id, s.warehouseId)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Reserve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}