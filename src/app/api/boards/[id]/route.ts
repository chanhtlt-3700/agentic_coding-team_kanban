import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateBoardSchema } from '@/lib/validations'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
            ),
            comments(count)
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Transform data for easier consumption
    const transformedBoard = {
      ...(board as any),
      lists: (board as any).lists
        .sort((a: any, b: any) => a.position - b.position)
        .map((list: any) => ({
          ...list,
          cards: list.cards
            .sort((a: any, b: any) => a.position - b.position)
            .map((card: any) => ({
              ...card,
              members: card.card_members.map((cm: any) => cm.user),
              comments_count: card.comments[0]?.count || 0,
            })),
        })),
    }

    return NextResponse.json({ board: transformedBoard })
  } catch (error) {
    console.error('Error fetching board:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const body = updateBoardSchema.parse(json)

    // @ts-ignore - Supabase generated types issue
    const { data: board, error } = await supabase
      .from('boards')
      .update(body as any)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ board })
  } catch (error) {
    console.error('Error updating board:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 204 })
  } catch (error) {
    console.error('Error deleting board:', error)
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    )
  }
}
