import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardId } = await params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }
    console.log('user_id', user_id, cardId);

    // Check if member already assigned
    const { data: existing } = await supabase
      .from('card_members')
      .select('card_id')
      .eq('card_id', cardId)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Member already assigned' },
        { status: 400 }
      );
    }

    // Add member
    const { error: insertError } = await supabase.from('card_members').insert({
      card_id: cardId,
      user_id: user_id,
    } as any);

    if (insertError) {
      console.log('Error adding card member:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Fetch the member details
    const { data: member } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .eq('id', user_id)
      .single();

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error adding card member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardId } = await params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Remove member
    const { error } = await supabase
      .from('card_members')
      .delete()
      .eq('card_id', cardId)
      .eq('user_id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing card member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
