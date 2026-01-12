import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { moveCardSchema } from '@/lib/validations'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const { listId, position } = moveCardSchema.parse(json)

    const { data: card, error } = await supabase
      .from('cards')
      .update({
        list_id: listId,
        position,
      })
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ card })
  } catch (error) {
    console.error('Error moving card:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to move card' },
      { status: 500 }
    )
  }
}
