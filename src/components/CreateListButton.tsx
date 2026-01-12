'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createListSchema } from '@/lib/validations'

interface CreateListButtonProps {
  boardId: string
  position: number
}

export default function CreateListButton({ boardId, position }: CreateListButtonProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), position }),
      })

      if (!response.ok) throw new Error('Failed to create list')

      setTitle('')
      setIsAdding(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating list:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdding) {
    return (
      <div className="flex-shrink-0 w-80">
        <button
          onClick={() => setIsAdding(true)}
          className="w-full bg-white bg-opacity-60 hover:bg-opacity-80 rounded-lg p-4 flex items-center gap-2 text-gray-700 font-medium transition-colors"
        >
          <Plus size={20} />
          Add a list
        </button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-100 rounded-lg p-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter list title..."
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsAdding(false)
                setTitle('')
              }
            }}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add list
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setTitle('')
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
