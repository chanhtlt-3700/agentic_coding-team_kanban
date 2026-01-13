'use client'

import { useState, useEffect } from 'react'
import { X, UserPlus, Trash2, Mail } from 'lucide-react'
import { Profile } from '@/types'
import { getInitials, generateAvatarColor } from '@/lib/utils'

interface BoardMembersModalProps {
  boardId: string
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

interface BoardMember extends Profile {
  role?: string
  joined_at?: string
}

export default function BoardMembersModal({ boardId, isOpen, onClose, onUpdate }: BoardMembersModalProps) {
  const [members, setMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (isOpen && boardId) {
      fetchMembers()
    }
  }, [isOpen, boardId])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/boards/${boardId}/members`)
      if (!response.ok) throw new Error('Failed to fetch members')
      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setAdding(true)
    try {
      const response = await fetch(`/api/boards/${boardId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add member')
      }

      setEmail('')
      setShowAddForm(false)
      await fetchMembers()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error adding member:', error)
      alert(error instanceof Error ? error.message : 'Failed to add member. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the board?')) return

    try {
      const response = await fetch(`/api/boards/${boardId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberId }),
      })

      if (!response.ok) throw new Error('Failed to remove member')

      await fetchMembers()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 pt-20">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Board Members</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Add Member Form */}
              {showAddForm ? (
                <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter member's email address"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={adding || !email.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {adding ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setEmail('')
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mb-6 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus size={20} />
                  Add Member
                </button>
              )}

              {/* Members List */}
              <div className="space-y-3">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white ${generateAvatarColor(member.id)}`}>
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name || ''}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(member.name || member.email)
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {member.name || 'Unnamed User'}
                        </p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      {member.role && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          member.role === 'owner' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {member.role}
                        </span>
                      )}
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-gray-400 hover:text-red-600 p-2"
                          title="Remove member"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">No members yet</p>
                    <p className="text-sm text-gray-400">Add members to collaborate on this board</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
