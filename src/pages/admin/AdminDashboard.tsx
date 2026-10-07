import { useEffect, useState } from 'react'
import { InfluencerManager } from './InfluencerManager'

interface Product {
  id: string
  price: number
  photoLimit: number
  hasAudioData?: boolean
  audioUrl?: string | null
}

interface Stats {
  totalTemplates: number
  totalExperiences: number
}

interface ProductsResponse {
  success: boolean
  products: Product[]
}

interface StatsResponse {
  success: boolean
  stats: Stats
}

export function AdminDashboard() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [newPrice, setNewPrice] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<{ id: string; price: number } | null>(null)

  const apiUrl = import.meta.env.VITE_API_URL || '/api'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password) return

    setLoading(true)
    setError(null)

    try {
      // Exchange credentials for a signed session token.
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || 'Authentication failed')
        return
      }

      const sessionToken = data.token as string
      setToken(sessionToken)
      setPassword('')
      setIsAuthenticated(true)
      // Store token in session storage (not localStorage for security)
      sessionStorage.setItem('adminToken', sessionToken)
      await loadData(sessionToken)
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async (authToken: string) => {
    setLoading(true)
    setError(null)

    try {
      const [productsRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/admin/products`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch(`${apiUrl}/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ])

      // An expired or revoked session sends the user back to the login form
      // instead of showing an empty dashboard that never recovers.
      if (productsRes.status === 401 || statsRes.status === 401) {
        sessionStorage.removeItem('adminToken')
        setToken('')
        setIsAuthenticated(false)
        setError('Your session has expired. Please log in again.')
        return
      }

      if (!productsRes.ok || !statsRes.ok) {
        throw new Error('Failed to load data')
      }

      const productsData: ProductsResponse = await productsRes.json()
      const statsData: StatsResponse = await statsRes.json()

      setProducts(productsData.products)
      setStats(statsData.stats)
    } catch (err) {
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setToken('')
    sessionStorage.removeItem('adminToken')
    setProducts([])
    setStats(null)
  }

  const startEditing = (productId: string, currentPrice: number) => {
    setEditingProduct(productId)
    setNewPrice(currentPrice.toString())
  }

  const cancelEditing = () => {
    setEditingProduct(null)
    setNewPrice('')
    setShowConfirm(false)
    setPendingProduct(null)
  }

  const initiatePriceChange = () => {
    if (!editingProduct) return

    const priceNum = parseFloat(newPrice)
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid non-negative number')
      return
    }

    setPendingProduct({ id: editingProduct, price: priceNum })
    setShowConfirm(true)
  }

  const confirmPriceChange = async () => {
    if (!pendingProduct) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/admin/products/${pendingProduct.id}/price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price: pendingProduct.price }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update price')
      }

      // Refresh products to show updated price
      await loadData(token)
      cancelEditing()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update price')
    } finally {
      setLoading(false)
    }
  }

  const [editingAudio, setEditingAudio] = useState<string | null>(null)
  const [audioUrlInput, setAudioUrlInput] = useState<string>('')
  const [audioFileInput, setAudioFileInput] = useState<File | null>(null)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  const handleAudioSubmit = async (productId: string) => {
    setUploadingAudio(true)
    setError(null)
    try {
      let audioData = null
      if (audioFileInput) {
        const reader = new FileReader()
        audioData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(audioFileInput)
        })
      }

      const response = await fetch(`${apiUrl}/admin/audio/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ audioData, audioUrl: audioUrlInput }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update audio')
      }

      await loadData(token)
      setEditingAudio(null)
      setAudioFileInput(null)
      setAudioUrlInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update audio')
    } finally {
      setUploadingAudio(false)
    }
  }

  useEffect(() => {
    // Check for existing session
    const savedToken = sessionStorage.getItem('adminToken')
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
      loadData(savedToken)
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Super Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="identifier"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter your username or email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Cupi Super Admin</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {loading && !products.length ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            {stats && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Templates</h2>
                  <p className="text-3xl font-bold text-rose-600">{stats.totalTemplates}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Experiences</h2>
                  <p className="text-3xl font-bold text-rose-600">{stats.totalExperiences}</p>
                </div>
              </div>
            )}

            {/* Products Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Products & Pricing</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price (₹)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Photo Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingProduct === product.id ? (
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                              step="0.01"
                              min="0"
                            />
                          ) : (
                            `₹${product.price.toFixed(2)}`
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.photoLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingProduct === product.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={initiatePriceChange}
                                disabled={loading}
                                className="px-3 py-1 bg-rose-600 text-white text-xs rounded hover:bg-rose-700 disabled:bg-gray-400"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(product.id, product.price)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Music Manager Section */}
            <div className="bg-white rounded-lg shadow mt-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Music Manager</h2>
                <p className="text-sm text-gray-500">Upload MP3 files or set external audio URLs for templates.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Audio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {editingAudio === product.id ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="url"
                                placeholder="External URL (optional)"
                                value={audioUrlInput}
                                onChange={(e) => setAudioUrlInput(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                              <span className="text-xs text-gray-400">OR</span>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setAudioFileInput(e.target.files?.[0] || null)}
                                className="w-full text-xs"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {product.hasAudioData && <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">File Uploaded</span>}
                              {product.audioUrl && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full truncate" title={product.audioUrl}>URL: {product.audioUrl}</span>}
                              {!product.hasAudioData && !product.audioUrl && <span className="text-gray-400 italic">No audio set</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingAudio === product.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAudioSubmit(product.id)}
                                disabled={uploadingAudio}
                                className="px-3 py-1 bg-rose-600 text-white text-xs rounded hover:bg-rose-700 disabled:bg-gray-400"
                              >
                                {uploadingAudio ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAudio(null)
                                  setAudioFileInput(null)
                                  setAudioUrlInput('')
                                }}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingAudio(product.id)
                                setAudioUrlInput(product.audioUrl || '')
                                setAudioFileInput(null)
                              }}
                              className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                            >
                              Edit Audio
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <InfluencerManager token={token} />
          </>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirm && pendingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Price Change</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to change the price of <strong>{pendingProduct.id}</strong> to{' '}
              <strong>₹{pendingProduct.price.toFixed(2)}</strong>?
            </p>
            <p className="text-xs text-gray-500 mb-6">
              This change will apply to all new orders. Existing orders will retain their original
              price.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmPriceChange}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
