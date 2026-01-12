-- Create lists table
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lists_board ON lists(board_id);
CREATE INDEX idx_lists_position ON lists(board_id, position);

-- Enable RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Lists policies
CREATE POLICY "Users can view lists"
  ON lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = lists.board_id
      AND (
        boards.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members
          WHERE board_members.board_id = boards.id
          AND board_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Board members can create lists"
  ON lists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_id
      AND (
        boards.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members
          WHERE board_members.board_id = boards.id
          AND board_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Board members can update lists"
  ON lists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = lists.board_id
      AND (
        boards.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members
          WHERE board_members.board_id = boards.id
          AND board_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Board members can delete lists"
  ON lists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = lists.board_id
      AND (
        boards.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members
          WHERE board_members.board_id = boards.id
          AND board_members.user_id = auth.uid()
        )
      )
    )
  );

-- Update trigger
CREATE TRIGGER update_lists_updated_at 
  BEFORE UPDATE ON lists
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
