-- Function to create default lists when a board is created
CREATE OR REPLACE FUNCTION create_default_lists()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default lists
  INSERT INTO lists (board_id, title, position)
  VALUES
    (NEW.id, 'To Do', 0),
    (NEW.id, 'In Progress', 1),
    (NEW.id, 'Done', 2);
  
  -- Add owner as board member
  INSERT INTO board_members (board_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default lists
CREATE TRIGGER create_default_lists_trigger
  AFTER INSERT ON boards
  FOR EACH ROW
  EXECUTE FUNCTION create_default_lists();

-- Function to reorder items after position change
CREATE OR REPLACE FUNCTION reorder_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder for more complex reordering logic
  -- In practice, you might want to normalize positions
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
