'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { BoardDetails } from '@/types'
import KanbanList from './KanbanList'
import KanbanCard from './KanbanCard'
import CreateListButton from './CreateListButton'

interface KanbanBoardProps {
  board: BoardDetails
}

export default function KanbanBoard({ board: initialBoard }: KanbanBoardProps) {
  const [board, setBoard] = useState(initialBoard)
  const [activeCard, setActiveCard] = useState<any>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = board.lists
      .flatMap(list => list.cards)
      .find(card => card.id === active.id)
    
    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeCardId = active.id as string
    const overListId = over.id as string

    // Find source list and card
    const sourceList = board.lists.find(list => 
      list.cards.some(card => card.id === activeCardId)
    )
    
    if (!sourceList) return

    const sourceCard = sourceList.cards.find(card => card.id === activeCardId)
    if (!sourceCard) return

    // Check if we're over a different list
    const targetList = board.lists.find(list => list.id === overListId)
    
    if (targetList && targetList.id !== sourceList.id) {
      // Move card to new list
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(list => {
          if (list.id === sourceList.id) {
            // Remove from source
            return {
              ...list,
              cards: list.cards.filter(card => card.id !== activeCardId),
            }
          } else if (list.id === targetList.id) {
            // Add to target
            return {
              ...list,
              cards: [...list.cards, sourceCard],
            }
          }
          return list
        }),
      }))
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const cardId = active.id as string
    const newListId = over.id as string

    // Find the list containing this card
    const targetList = board.lists.find(list => 
      list.cards.some(card => card.id === cardId)
    )

    if (!targetList) return

    const cardIndex = targetList.cards.findIndex(card => card.id === cardId)

    // Update card position in database
    try {
      await fetch(`/api/cards/${cardId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: targetList.id,
          position: cardIndex,
        }),
      })
    } catch (error) {
      console.error('Failed to move card:', error)
      // Revert on error
      window.location.reload()
    }
  }

  const handleCardCreated = (listId: string, newCard: any) => {
    setBoard(prevBoard => ({
      ...prevBoard,
      lists: prevBoard.lists.map(list => 
        list.id === listId 
          ? { ...list, cards: [...list.cards, { ...newCard, members: [] }] }
          : list
      ),
    }))
  }

  const handleCardUpdated = async () => {
    // Refetch board data to update card details (comments count, members)
    try {
      const response = await fetch(`/api/boards/${board.id}`)
      if (response.ok) {
        const updatedBoard = await response.json()
        setBoard(updatedBoard)
      }
    } catch (error) {
      console.error('Failed to refresh board:', error)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 h-full p-6">
          {board.lists.map((list) => (
            <KanbanList 
              key={list.id} 
              list={list} 
              boardId={board.id}
              onCardCreated={handleCardCreated}
            />
          ))}
          <CreateListButton boardId={board.id} position={board.lists.length} />
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="rotate-3 opacity-80">
            <KanbanCard card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
