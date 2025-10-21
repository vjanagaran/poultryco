'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EarlyAccessSignup {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string | null
  company_name: string | null
  country: string | null
  interested_in: string[] | null
  message: string | null
  status: string
  priority: string
  created_at: string
  source: string | null
}

export default function EarlyAccessPage() {
  const [signups, setSignups] = useState<EarlyAccessSignup[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchSignups()
  }, [statusFilter])

  async function fetchSignups() {
    try {
      setLoading(true)
      let query = supabase
        .from('early_access_signups')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setSignups(data || [])
    } catch (error) {
      console.error('Error fetching signups:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('early_access_signups')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      setSignups(signups.map(s => s.id === id ? { ...s, status } : s))
      alert('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  async function deleteSignup(id: string) {
    if (!confirm('Are you sure you want to delete this signup?')) return

    try {
      const { error } = await supabase
        .from('early_access_signups')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSignups(signups.filter(s => s.id !== id))
      alert('Signup deleted successfully')
    } catch (error) {
      console.error('Error deleting signup:', error)
      alert('Failed to delete signup')
    }
  }

  const filteredSignups = signups.filter(signup =>
    signup.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    signup.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    signup.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'invited': return 'bg-blue-100 text-blue-800'
      case 'registered': return 'bg-purple-100 text-purple-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Early Access Signups</h1>
        <p className="text-gray-600 mt-1">Manage early access requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="invited">Invited</option>
            <option value="registered">Registered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{signups.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {signups.filter(s => s.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            {signups.filter(s => s.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Invited</div>
          <div className="text-2xl font-bold text-blue-600">
            {signups.filter(s => s.status === 'invited').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Registered</div>
          <div className="text-2xl font-bold text-purple-600">
            {signups.filter(s => s.status === 'registered').length}
          </div>
        </div>
      </div>

      {/* Signups List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading signups...</div>
        ) : filteredSignups.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No signups found. {searchQuery && 'Try adjusting your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSignups.map((signup) => (
                  <tr key={signup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">{signup.full_name}</div>
                        <div className="text-sm text-gray-500">{signup.email}</div>
                        {signup.phone && (
                          <div className="text-xs text-gray-400">{signup.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {signup.role && (
                          <div className="text-sm text-gray-900 capitalize">{signup.role}</div>
                        )}
                        {signup.company_name && (
                          <div className="text-sm text-gray-500">{signup.company_name}</div>
                        )}
                        {signup.country && (
                          <div className="text-xs text-gray-400">{signup.country}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={signup.status}
                        onChange={(e) => updateStatus(signup.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(signup.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="invited">Invited</option>
                        <option value="registered">Registered</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(signup.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteSignup(signup.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

