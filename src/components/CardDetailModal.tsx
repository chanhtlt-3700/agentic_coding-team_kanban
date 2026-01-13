'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, UserPlus, Trash2 } from 'lucide-react';
import { CardDetails, Profile } from '@/types';
import { getInitials, generateAvatarColor, formatDate } from '@/lib/utils';

interface CardDetailModalProps {
  cardId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function CardDetailModal({
  cardId,
  isOpen,
  onClose,
  onUpdate,
}: CardDetailModalProps) {
  const [card, setCard] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [boardMembers, setBoardMembers] = useState<Profile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  useEffect(() => {
    if (isOpen && cardId) {
      fetchCardDetails();
    }
  }, [isOpen, cardId]);

  const fetchCardDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cards/${cardId}`);
      if (!response.ok) throw new Error('Failed to fetch card details');
      const data = await response.json();
      setCard(data);

      // Fetch board members after we have the card data
      if (data.list_id) {
        await fetchBoardMembersForCard(data.list_id);
      }
    } catch (error) {
      console.error('Error fetching card details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardMembersForCard = async (listId: string) => {
    try {
      setLoadingMembers(true);
      // First get the list to find the board_id
      const listResponse = await fetch(`/api/lists/${listId}`);
      if (!listResponse.ok) return;

      const listData = await listResponse.json();
      const boardId = listData.board_id;

      if (boardId) {
        const membersResponse = await fetch(`/api/boards/${boardId}/members`);
        if (membersResponse.ok) {
          const data = await membersResponse.json();
          setBoardMembers(data.members || []);
        }
      }
    } catch (error) {
      console.error('Error fetching board members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !card) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/cards/${cardId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment.trim() }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setComment('');
      await fetchCardDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(
        `/api/cards/${cardId}/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete comment');

      await fetchCardDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleAssignMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberId }),
      });

      if (!response.ok) throw new Error('Failed to assign member');

      await fetchCardDetails();
      setShowMemberDropdown(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error assigning member:', error);
      alert('Failed to assign member. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberId }),
      });

      if (!response.ok) throw new Error('Failed to remove member');

      await fetchCardDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 pt-20">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[85vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : card ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {card.title}
                  </h2>
                  {card.description && (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {card.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Members Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">
                    Members
                  </h3>
                  <button
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <UserPlus size={16} />
                    Add Member
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {card.members && card.members.length > 0 ? (
                    card.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 group hover:bg-gray-200"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${generateAvatarColor(member.id)}`}
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
                        <span className="text-sm text-gray-700">
                          {member.name || member.email}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-600 ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No members assigned</p>
                  )}
                </div>

                {/* Member Dropdown */}
                {showMemberDropdown && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {loadingMembers ? (
                      <p className="text-sm text-gray-600 text-center py-2">
                        Loading members...
                      </p>
                    ) : boardMembers.length > 0 ? (
                      <div className="space-y-2">
                        {boardMembers
                          .filter(
                            (member) =>
                              !card?.members?.some((m) => m.id === member.id)
                          )
                          .map((member) => (
                            <button
                              key={member.id}
                              onClick={() => handleAssignMember(member.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${generateAvatarColor(member.id)}`}
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
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {member.name || 'Unnamed User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {member.email}
                                </p>
                              </div>
                            </button>
                          ))}
                        {boardMembers.every((member) =>
                          card?.members?.some((m) => m.id === member.id)
                        ) && (
                          <p className="text-sm text-gray-600 text-center py-2">
                            All board members are already assigned to this card
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 text-center py-2">
                        No board members available. Add members to the board
                        first.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={20} className="text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">
                    Comments ({card.comments?.length || 0})
                  </h3>
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submittingComment || !comment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {card.comments && card.comments.length > 0 ? (
                    card.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0 ${generateAvatarColor(comment.user_id)}`}
                        >
                          {comment.user.avatar_url ? (
                            <img
                              src={comment.user.avatar_url}
                              alt={comment.user.name || ''}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(comment.user.name || comment.user.email)
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.user.name || comment.user.email}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.created_at)}
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete comment"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Failed to load card details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
