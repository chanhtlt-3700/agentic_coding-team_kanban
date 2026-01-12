-- Create cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cards_list ON cards(list_id);
CREATE INDEX idx_cards_position ON cards(list_id, position);
CREATE INDEX idx_cards_created_by ON cards(created_by);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Cards policies
CREATE POLICY "Users can view cards"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
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

CREATE POLICY "Board members can create cards"
  ON cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = list_id
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

CREATE POLICY "Board members can update cards"
  ON cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
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

CREATE POLICY "Board members can delete cards"
  ON cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
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
CREATE TRIGGER update_cards_updated_at 
  BEFORE UPDATE ON cards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create card_members table
CREATE TABLE card_members (
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (card_id, user_id)
);

CREATE INDEX idx_card_members_card ON card_members(card_id);
CREATE INDEX idx_card_members_user ON card_members(user_id);

-- Enable RLS
ALTER TABLE card_members ENABLE ROW LEVEL SECURITY;

-- Card members policies
CREATE POLICY "Users can view card members"
  ON card_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cards
      JOIN lists ON lists.id = cards.list_id
      JOIN boards ON boards.id = lists.board_id
      WHERE cards.id = card_members.card_id
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

CREATE POLICY "Board members can assign card members"
  ON card_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards
      JOIN lists ON lists.id = cards.list_id
      JOIN boards ON boards.id = lists.board_id
      WHERE cards.id = card_id
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

CREATE POLICY "Board members can unassign card members"
  ON card_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM cards
      JOIN lists ON lists.id = cards.list_id
      JOIN boards ON boards.id = lists.board_id
      WHERE cards.id = card_id
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
