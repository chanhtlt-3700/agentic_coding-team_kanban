import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCardSchema } from '@/lib/validations'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const { title, description } = createCardSchema.parse(json)
    const position = json.position || 0

    const { data: card, error } = await supabase
      .from('cards')
      .insert({
        list_id: listId,
        title,
        description,
        position,
        created_by: user.id,
      })
      .select(`
        *,
        creator:profiles!cards_created_by_fkey(id, name, email, avatar_url)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ card }, { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
}
