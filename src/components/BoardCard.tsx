'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BoardWithOwner } from '@/types'

interface BoardCardProps {
  board: BoardWithOwner
}

export default function BoardCard({ board }: BoardCardProps) {
  return (
    <Link href={`/boards/${board.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {board.title}
        </h3>
        {board.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {board.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created by {board.owner.name || board.owner.email}</span>
          <span>{formatDate(board.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}
