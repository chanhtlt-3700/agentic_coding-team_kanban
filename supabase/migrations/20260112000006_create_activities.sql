-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_board ON activities(board_id);
CREATE INDEX idx_activities_created_at ON activities(board_id, created_at DESC);
CREATE INDEX idx_activities_user ON activities(user_id);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Activities policies
CREATE POLICY "Users can view activities"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = activities.board_id
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

-- Only allow system to insert activities (via triggers)
CREATE POLICY "System can insert activities"
  ON activities FOR INSERT
  WITH CHECK (true);

-- Create function to log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  board_id_val UUID;
  action_val TEXT;
  metadata_val JSONB;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    action_val := TG_TABLE_NAME || '_created';
  ELSIF TG_OP = 'UPDATE' THEN
    action_val := TG_TABLE_NAME || '_updated';
  ELSIF TG_OP = 'DELETE' THEN
    action_val := TG_TABLE_NAME || '_deleted';
  END IF;

  -- Get board_id based on table
  IF TG_TABLE_NAME = 'boards' THEN
    board_id_val := COALESCE(NEW.id, OLD.id);
    metadata_val := jsonb_build_object(
      'title', COALESCE(NEW.title, OLD.title)
    );
  ELSIF TG_TABLE_NAME = 'lists' THEN
    board_id_val := COALESCE(NEW.board_id, OLD.board_id);
    metadata_val := jsonb_build_object(
      'title', COALESCE(NEW.title, OLD.title),
      'position', COALESCE(NEW.position, OLD.position)
    );
  ELSIF TG_TABLE_NAME = 'cards' THEN
    SELECT lists.board_id INTO board_id_val
    FROM lists WHERE lists.id = COALESCE(NEW.list_id, OLD.list_id);
    metadata_val := jsonb_build_object(
      'title', COALESCE(NEW.title, OLD.title),
      'list_id', COALESCE(NEW.list_id, OLD.list_id)
    );
  ELSIF TG_TABLE_NAME = 'comments' THEN
    SELECT lists.board_id INTO board_id_val
    FROM cards
    JOIN lists ON lists.id = cards.list_id
    WHERE cards.id = COALESCE(NEW.card_id, OLD.card_id);
    metadata_val := jsonb_build_object(
      'card_id', COALESCE(NEW.card_id, OLD.card_id),
      'content_preview', LEFT(COALESCE(NEW.content, OLD.content), 100)
    );
  ELSIF TG_TABLE_NAME = 'card_members' THEN
    SELECT lists.board_id INTO board_id_val
    FROM cards
    JOIN lists ON lists.id = cards.list_id
    WHERE cards.id = COALESCE(NEW.card_id, OLD.card_id);
    metadata_val := jsonb_build_object(
      'card_id', COALESCE(NEW.card_id, OLD.card_id),
      'member_id', COALESCE(NEW.user_id, OLD.user_id)
    );
    IF TG_OP = 'INSERT' THEN
      action_val := 'member_assigned';
    ELSIF TG_OP = 'DELETE' THEN
      action_val := 'member_unassigned';
    END IF;
  END IF;

  -- Insert activity
  IF board_id_val IS NOT NULL AND auth.uid() IS NOT NULL THEN
    INSERT INTO activities (board_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (
      board_id_val,
      auth.uid(),
      action_val,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      metadata_val
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to relevant tables
CREATE TRIGGER log_board_activity
  AFTER INSERT OR UPDATE OR DELETE ON boards
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_list_activity
  AFTER INSERT OR UPDATE OR DELETE ON lists
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_card_activity
  AFTER INSERT OR UPDATE OR DELETE ON cards
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_comment_activity
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_card_member_activity
  AFTER INSERT OR DELETE ON card_members
  FOR EACH ROW EXECUTE FUNCTION log_activity();
