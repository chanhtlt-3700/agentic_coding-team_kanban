import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/boards/:id/members - Get all members of a board
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get board members
    const { data: members, error } = await supabase
      .from('board_members')
      .select(
        `
        role,
        joined_at,
        user:profiles(id, name, email, avatar_url)
      `
      )
      .eq('board_id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data
    const transformedMembers =
      members?.map((m: any) => ({
        ...m.user,
        role: m.role,
        joined_at: m.joined_at,
      })) || [];

    return NextResponse.json({ members: transformedMembers });
  } catch (error) {
    console.error('Error fetching board members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/boards/:id/members - Add a member to a board
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, email } = body;
    console.log('targetUserId', user_id, id);

    // Check if the current user is the board owner
    const { data: board } = await supabase
      .from('boards')
      .select('owner_id')
      .eq('id', id)
      .single();

    const boardData: any = board;
    if (boardData?.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Only board owner can add members' },
        { status: 403 }
      );
    }

    let targetUserId = user_id;

    // If email is provided instead of user_id, look up the user
    if (!targetUserId && email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const profileData: any = profile;
      targetUserId = profileData.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'user_id or email is required' },
        { status: 400 }
      );
    }
    console.log('targetUserId', targetUserId, id);

    // Check if member already exists
    const { data: existing } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('board_id', id)
      .eq('user_id', targetUserId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Member already added to board' },
        { status: 400 }
      );
    }
    // Add member
    // @ts-ignore - Supabase generated types issue
    const { error: insertError } = await supabase.from('board_members').insert({
      board_id: id,
      user_id: targetUserId,
      role: 'member',
    } as any);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Fetch the member details
    const { data: memberProfile } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .eq('id', targetUserId)
      .single();

    const transformedMember = {
      ...memberProfile,
      role: 'member',
      joined_at: new Date().toISOString(),
    };

    return NextResponse.json({ member: transformedMember }, { status: 201 });
  } catch (error) {
    console.error('Error adding board member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/:id/members - Remove a member from a board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Check if the current user is the board owner
    const { data: board } = await supabase
      .from('boards')
      .select('owner_id')
      .eq('id', id)
      .single();

    const boardData: any = board;
    if (boardData?.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Only board owner can remove members' },
        { status: 403 }
      );
    }

    // Remove member
    const { error } = await supabase
      .from('board_members')
      .delete()
      .eq('board_id', id)
      .eq('user_id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing board member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
