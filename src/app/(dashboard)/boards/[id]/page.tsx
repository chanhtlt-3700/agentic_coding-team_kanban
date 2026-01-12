import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import KanbanBoard from '@/components/KanbanBoard'

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  const { data: board, error } = await supabase
    .from('boards')
    .select(`
      *,
      owner:profiles!boards_owner_id_fkey(id, name, email, avatar_url),
      lists(
        *,
        cards(
          *,
          creator:profiles!cards_created_by_fkey(id, name, email, avatar_url),
          card_members(
            user:profiles(id, name, email, avatar_url)
          )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !board) {
    redirect('/dashboard')
  }

  // Transform data
  const transformedBoard = {
    ...board,
    lists: (board as any).lists
      .sort((a: any, b: any) => a.position - b.position)
      .map((list: any) => ({
        ...list,
        cards: list.cards
          .sort((a: any, b: any) => a.position - b.position)
          .map((card: any) => ({
            ...card,
            members: card.card_members.map((cm: any) => cm.user),
          })),
      })),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <h1 className="text-2xl font-bold text-gray-900">{transformedBoard.title}</h1>
              {transformedBoard.description && (
                <p className="text-sm text-gray-600 mt-1">{transformedBoard.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KanbanBoard board={transformedBoard} />
      </main>
    </div>
  )
}
