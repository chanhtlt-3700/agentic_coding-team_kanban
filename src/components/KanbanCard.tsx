'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CardWithMembers } from '@/types'
import { MessageSquare, User } from 'lucide-react'
import { getInitials, generateAvatarColor } from '@/lib/utils'
import CardDetailModal from './CardDetailModal'

interface KanbanCardProps {
  card: CardWithMembers
  onUpdate?: () => void
}

export default function KanbanCard({ card, onUpdate }: KanbanCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening modal when dragging
    if (isDragging) return
    setIsModalOpen(true)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleCardClick}
        className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
      >
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {card.title}
        </h4>

        {card.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {/* Members */}
          <div className="flex -space-x-2">
            {card.members?.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white ${generateAvatarColor(member.id)}`}
                title={member.name || member.email}
              >
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
            ))}
            {(card.members?.length || 0) > 3 && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-gray-200 text-gray-600 border-2 border-white">
                +{(card.members?.length || 0) - 3}
              </div>
            )}
          </div>

          {/* Comments count */}
          {(card.comments_count || 0) > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <MessageSquare size={14} />
              <span className="text-xs">{card.comments_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal
        cardId={card.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  )
}
