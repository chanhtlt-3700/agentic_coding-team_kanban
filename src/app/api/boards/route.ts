import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBoardSchema } from '@/lib/validations'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: boards, error } = await supabase
      .from('boards')
      .select(`
        *,
        owner:profiles!boards_owner_id_fkey(id, name, email, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ boards })
  } catch (error) {
    console.error('Error fetching boards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const body = createBoardSchema.parse(json)

    const { data: board, error } = await (supabase
      .from('boards') as any)
      .insert({
        title: body.title,
        description: body.description,
        owner_id: user.id,
      })
      .select(`
        *,
        owner:profiles!boards_owner_id_fkey(id, name, email, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return NextResponse.json({ board }, { status: 201 })
  } catch (error) {
    console.error('Error creating board:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    )
  }
}
