'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

interface CreateCardButtonProps {
  listId: string
  position: number
  onCardCreated?: (card: any) => void
}

export default function CreateCardButton({ listId, position, onCardCreated }: CreateCardButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/lists/${listId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), position }),
      })

      if (!response.ok) throw new Error('Failed to create card')

      const { card } = await response.json()
      
      setTitle('')
      setIsAdding(false)
      
      // Call the callback to update parent state
      if (onCardCreated) {
        onCardCreated(card)
      }
    } catch (error) {
      console.error('Error creating card:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full p-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md flex items-center gap-2 transition-colors"
      >
        <Plus size={16} />
        Add a card
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter card title..."
        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={2}
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
          Add
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
  )
}
