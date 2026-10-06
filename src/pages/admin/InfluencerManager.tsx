import { useCallback, useEffect, useState } from 'react'

/** Mirrors the server's InfluencerView so the dashboard renders the same facts. */
export interface Influencer {
  id: string
  name: string
  email: string | null
  phone: string | null
  uniqueCode: string
  discountPercentage: number
  commissionPercentage: number
  expiryDate: string | null
  status: 'active' | 'paused' | 'expired'
  createdAt: string
  updatedAt: string
  totalOrders: number
  totalRevenueGenerated: number
  totalDiscountGiven: number
  commissionOwed: number
}

interface InfluencerSummary {
  totalInfluencers: number
  activeInfluencers: number
  pausedInfluencers: number
  expiredInfluencers: number
  totalOrders: number
  totalRevenueGenerated: number
  totalDiscountGiven: number
  totalCommissionOwed: number
}

interface InfluencersResponse {
  success: boolean
  influencers: Influencer[]
  summary: InfluencerSummary
}

interface InfluencerForm {
  name: string
  email: string
  phone: string
  uniqueCode: string
  discountPercentage: string
  commissionPercentage: string
  expiryDate: string
  status: 'active' | 'paused'
}

const EMPTY_FORM: InfluencerForm = {
  name: '',
  email: '',
  phone: '',
  uniqueCode: '',
  discountPercentage: '',
  commissionPercentage: '',
  expiryDate: '',
  status: 'active',
}

const INPUT_CLASS =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500'

function formatMoney(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN')
}

const STATUS_STYLES: Record<Influencer['status'], string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-amber-100 text-amber-800',
  expired: 'bg-gray-200 text-gray-700',
}

export function InfluencerManager({ token }: { token: string }) {
  const apiUrl = import.meta.env.VITE_API_URL || '/api'

  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [summary, setSummary] = useState<InfluencerSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [editing, setEditing] = useState<Influencer | null>(null)
  const [form, setForm] = useState<InfluencerForm>(EMPTY_FORM)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Influencer | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/admin/influencers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to load influencers')
      const payload = data as InfluencersResponse
      setInfluencers(payload.influencers ?? [])
      setSummary(payload.summary ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load influencers')
    } finally {
      setLoading(false)
    }
  }, [apiUrl, token])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (influencer: Influencer) => {
    setEditing(influencer)
    setForm({
      name: influencer.name,
      email: influencer.email ?? '',
      phone: influencer.phone ?? '',
      uniqueCode: influencer.uniqueCode,
      discountPercentage: String(influencer.discountPercentage),
      commissionPercentage: String(influencer.commissionPercentage),
      expiryDate: influencer.expiryDate ?? '',
      status: influencer.status === 'paused' ? 'paused' : 'active',
    })
    setFormError(null)
    setFormOpen(true)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    setFormError(null)
    try {
      // Only real numbers are sent: an empty percentage field must become 0,
      // not the empty string, which the server rejects as invalid input.
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        discountPercentage: form.discountPercentage === '' ? 0 : Number(form.discountPercentage),
        commissionPercentage:
          form.commissionPercentage === '' ? 0 : Number(form.commissionPercentage),
        expiryDate: form.expiryDate || null,
        status: form.status,
      }
      // Blank code on create means "generate one from the name"; on edit, a
      // blank field means "leave the existing code alone".
      if (form.uniqueCode.trim()) body.uniqueCode = form.uniqueCode.trim()

      const response = await fetch(
        editing ? `${apiUrl}/admin/influencers/${editing.id}` : `${apiUrl}/admin/influencers`,
        {
          method: editing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to save influencer')

      setFormOpen(false)
      setNotice(editing ? 'Influencer updated.' : 'Influencer created.')
      await load()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save influencer')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting || saving) return
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/admin/influencers/${deleting.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to delete influencer')
      setNotice(`${deleting.name} deleted. Past orders keep their attribution.`)
      setDeleting(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete influencer')
    } finally {
      setSaving(false)
    }
  }

  /** Pause/resume is an edit, so the code and rates are left untouched. */
  const toggleStatus = async (influencer: Influencer) => {
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/admin/influencers/${influencer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: influencer.status === 'paused' ? 'active' : 'paused' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to update status')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const copyReferralLink = async (influencer: Influencer) => {
    const link = `${window.location.origin}/?ref=${encodeURIComponent(influencer.uniqueCode)}`
    try {
      await navigator.clipboard.writeText(link)
      setNotice(`Referral link copied for ${influencer.name}.`)
    } catch {
      // Clipboard access is denied in some browsers/iframes; showing the link is
      // still more useful than failing silently.
      window.prompt('Copy this referral link:', link)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow mt-8">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Influencer &amp; Revenue Manager</h2>
          <p className="text-sm text-gray-500">
            Every partner&apos;s referral code, discount, commission and earnings. Figures count
            paid orders only.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            Add Influencer
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      {notice && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {notice}
        </div>
      )}

      {summary && (
        <div className="px-6 pt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Partners</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalInfluencers}</p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.activeInfluencers} active · {summary.pausedInfluencers} paused ·{' '}
              {summary.expiredInfluencers} expired
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Influencer Orders
            </p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenue Generated
            </p>
            <p className="text-2xl font-bold text-rose-600">
              {formatMoney(summary.totalRevenueGenerated)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatMoney(summary.totalDiscountGiven)} discounted away
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Commission Owed
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(summary.totalCommissionOwed)}
            </p>
          </div>
        </div>
      )}

      <div className="px-6 py-6">
        {influencers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No influencers yet. Add one to start tracking referral sales.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Influencer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terms
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission Owed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {influencers.map((influencer) => (
                  <tr key={influencer.id}>
                    <td className="px-4 py-4 text-sm">
                      <p className="font-medium text-gray-900">{influencer.name}</p>
                      {influencer.email && (
                        <p className="text-xs text-gray-500">{influencer.email}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Added {formatDate(influencer.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {influencer.uniqueCode}
                      </code>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <p>{influencer.discountPercentage}% off</p>
                      <p className="text-xs">{influencer.commissionPercentage}% commission</p>
                      <p className="text-xs">
                        {influencer.expiryDate
                          ? `Expires ${formatDate(influencer.expiryDate)}`
                          : 'No expiry'}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {influencer.totalOrders}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMoney(influencer.totalRevenueGenerated)}
                      <p className="text-xs text-gray-400">
                        saved {formatMoney(influencer.totalDiscountGiven)}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatMoney(influencer.commissionOwed)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[influencer.status]}`}
                      >
                        {influencer.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => copyReferralLink(influencer)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => toggleStatus(influencer)}
                          className="px-3 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-600"
                        >
                          {influencer.status === 'paused' ? 'Activate' : 'Pause'}
                        </button>
                        <button
                          onClick={() => openEdit(influencer)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleting(influencer)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit */}
      {formOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {editing ? `Edit ${editing.name}` : 'Add Influencer'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              The discount is what the buyer pays less; the commission is what Cupi owes the partner
              on the discounted amount.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    required
                    className={INPUT_CLASS}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral code
                  </label>
                  <input
                    className={INPUT_CLASS}
                    placeholder={editing ? 'Leave blank to keep' : 'Auto-generated'}
                    value={form.uniqueCode}
                    onChange={(e) => setForm({ ...form, uniqueCode: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Letters, numbers, dashes and underscores. Case does not matter.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className={INPUT_CLASS}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    className={INPUT_CLASS}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount % (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className={INPUT_CLASS}
                    placeholder="e.g. 33.33"
                    value={form.discountPercentage}
                    onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission % (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className={INPUT_CLASS}
                    placeholder="e.g. 10"
                    value={form.commissionPercentage}
                    onChange={(e) =>
                      setForm({ ...form, commissionPercentage: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry date (optional)
                  </label>
                  <input
                    type="date"
                    className={INPUT_CLASS}
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave blank for a code that never expires.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className={INPUT_CLASS}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as 'active' | 'paused' })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Influencer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Delete influencer?</h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{deleting.name}</strong> ({deleting.uniqueCode}) will stop working
              immediately and can never be credited with another sale.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Orders they already referred keep their code and commission figures, so past payouts
              stay auditable. If you only want to stop new sales, pause them instead.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}