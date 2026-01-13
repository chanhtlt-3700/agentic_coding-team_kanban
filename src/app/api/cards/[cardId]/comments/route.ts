import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCommentSchema } from '@/lib/validations';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ cardId: string }> }
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

    const { cardId } = await context.params;
    const body = await request.json();

    // Validate input
    const validationResult = createCommentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { content } = validationResult.data;

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        card_id: cardId,
        user_id: user.id,
        content,
      } as any)
      .select(
        `
        *,
        user:profiles(id, name, email, avatar_url)
      `
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
