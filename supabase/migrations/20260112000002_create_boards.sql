-- Create boards table
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_boards_owner ON boards(owner_id);
CREATE INDEX idx_boards_created_at ON boards(created_at DESC);

-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Boards policies
CREATE POLICY "Users can view their boards"
  ON boards FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = boards.id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update boards"
  ON boards FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete boards"
  ON boards FOR DELETE
  USING (owner_id = auth.uid());

-- Update trigger
CREATE TRIGGER update_boards_updated_at 
  BEFORE UPDATE ON boards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create board_members table
CREATE TABLE board_members (
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (board_id, user_id)
);

CREATE INDEX idx_board_members_user ON board_members(user_id);
CREATE INDEX idx_board_members_board ON board_members(board_id);

-- Enable RLS
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Board members policies
CREATE POLICY "Users can view board members"
  ON board_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_members.board_id
      AND (
        boards.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members bm
          WHERE bm.board_id = boards.id
          AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Owners can add members"
  ON board_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_id
      AND boards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can remove members"
  ON board_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_id
      AND boards.owner_id = auth.uid()
    )
  );
