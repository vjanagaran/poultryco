'use client'

import { useEffect, useState } from 'react'
import { getContactSubmissions, updateContactSubmissionStatus, type ContactSubmission } from '@/lib/api/forms'

// Types imported from API

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchSubmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function fetchSubmissions() {
    try {
      setLoading(true)
      const status = statusFilter !== 'all' ? statusFilter : undefined
      const data = await getContactSubmissions(status)
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await updateContactSubmissionStatus(id, status)
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-yellow-100 text-yellow-800',
      read: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-gray-100 text-gray-800',
      spam: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Contact Submissions</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold">{submissions.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">New</div>
          <div className="text-2xl font-bold text-yellow-600">
            {submissions.filter(s => s.status === 'new').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-purple-600">
            {submissions.filter(s => s.status === 'in_progress').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Resolved</div>
          <div className="text-2xl font-bold text-green-600">
            {submissions.filter(s => s.status === 'resolved').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="spam">Spam</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{sub.full_name}</div>
                    <div className="text-sm text-gray-500">{sub.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{sub.subject}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{sub.message}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={sub.status}
                      onChange={(e) => updateStatus(sub.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sub.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="spam">Spam</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

