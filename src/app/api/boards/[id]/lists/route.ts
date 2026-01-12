import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createListSchema } from '@/lib/validations'

export async function POST(
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
    const body = createListSchema.parse(json)

    const { data: list, error } = await supabase
      .from('lists')
      .insert({
        board_id: id,
        title: body.title,
        position: body.position,
      } as any)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ list }, { status: 201 })
  } catch (error) {
    console.error('Error creating list:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    )
  }
}
