'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { BoardDetails } from '@/types';
import BoardMembersModal from './BoardMembersModal';

interface BoardHeaderProps {
  board: BoardDetails;
}

export default function BoardHeader({ board }: BoardHeaderProps) {
  const [showMembersModal, setShowMembersModal] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {board.title}
              </h1>
              {board.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {board.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowMembersModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Users size={18} />
              Members
            </button>
          </div>
        </div>
      </header>

      <BoardMembersModal
        boardId={board.id}
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
      />
    </>
  );
}
