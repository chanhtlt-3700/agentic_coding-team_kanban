'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ListWithCards } from '@/types'
import KanbanCard from './KanbanCard'
import CreateCardButton from './CreateCardButton'
import { MoreHorizontal } from 'lucide-react'

interface KanbanListProps {
  list: ListWithCards
  boardId: string
  onCardCreated?: (listId: string, card: any) => void
  onCardUpdated?: () => void
}

export default function KanbanList({ list, boardId, onCardCreated, onCardUpdated }: KanbanListProps) {
  const { setNodeRef } = useDroppable({
    id: list.id,
  })

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-100 rounded-lg p-4 h-full flex flex-col">
        {/* List Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {list.title} <span className="text-gray-500 text-sm">({list.cards.length})</span>
          </h3>
          <button className="text-gray-500 hover:text-gray-700">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Cards */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto space-y-3 mb-3"
        >
          <SortableContext
            items={list.cards.map(card => card.id)}
            strategy={verticalListSortingStrategy}
          >
            {list.cards.map((card) => (
              <KanbanCard 
                key={card.id} 
                card={card} 
                onUpdate={onCardUpdated}
              />
            ))}
          </SortableContext>
        </div>

        {/* Add Card Button */}
        <CreateCardButton 
          listId={list.id} 
          position={list.cards.length}
          onCardCreated={(card) => onCardCreated?.(list.id, card)}
        />
      </div>
    </div>
  )
}
