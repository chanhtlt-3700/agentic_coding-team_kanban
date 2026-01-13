import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId } = params

    // Fetch card with members and comments
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select(`
        *,
        creator:profiles!cards_created_by_fkey(id, name, email, avatar_url),
        members:card_members(
          user:profiles(id, name, email, avatar_url)
        ),
        comments:comments(
          id,
          content,
          user_id,
          created_at,
          updated_at,
          user:profiles(id, name, email, avatar_url)
        )
      `)
      .eq('id', cardId)
      .single()

    if (cardError) {
      return NextResponse.json({ error: cardError.message }, { status: 500 })
    }

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Transform the data to match CardDetails type
    const cardWithRelations: any = card
    const cardDetails = {
      ...cardWithRelations,
      members: cardWithRelations.members?.map((m: any) => m.user) || [],
      comments: cardWithRelations.comments?.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ) || [],
    }

    return NextResponse.json(cardDetails)
  } catch (error) {
    console.error('Error fetching card details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId } = params
    const body = await request.json()
    const { title, description } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description

    // @ts-ignore - Supabase generated types issue
    const { data: card, error } = await supabase
      .from('cards')
      .update(updateData as never)
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error updating card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId } = params

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
