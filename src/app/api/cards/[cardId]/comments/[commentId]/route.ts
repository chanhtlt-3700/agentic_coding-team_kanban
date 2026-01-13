import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateCommentSchema } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ cardId: string; commentId: string }> }
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

    const { commentId } = await context.params;
    const body = await request.json();

    // Validate input
    const validationResult = updateCommentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { content } = validationResult.data;

    // Check if user owns the comment
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    const commentData: any = existingComment;
    if (commentData?.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update comment
    // @ts-ignore - Supabase generated types issue
    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content } as never)
      .eq('id', commentId)
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

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ cardId: string; commentId: string }> }
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

    const { commentId } = await context.params;

    // Check if user owns the comment
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    const commentData: any = existingComment;
    if (commentData?.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
