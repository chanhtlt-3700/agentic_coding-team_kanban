# Database Schema

## Overview

This document describes the database schema for the Team Kanban application using Supabase (PostgreSQL).

## Entity Relationship Diagram

```
Users 1---* Boards (owner)
Users *---* Boards (members via board_members)
Boards 1---* Lists
Lists 1---* Cards
Users 1---* Cards (creator)
Users *---* Cards (assignees via card_members)
Cards 1---* Comments
Users 1---* Comments
Boards 1---* Activities
```

## Tables

### users (via Supabase Auth)

Managed by Supabase Auth, extended with profiles table.

### profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
```

### boards

```sql
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
```

### board_members

```sql
CREATE TABLE board_members (
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (board_id, user_id)
);

CREATE INDEX idx_board_members_user ON board_members(user_id);
CREATE INDEX idx_board_members_board ON board_members(board_id);
```

### lists

```sql
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
```

### cards

```sql
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
```

### card_members

```sql
CREATE TABLE card_members (
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (card_id, user_id)
);

CREATE INDEX idx_card_members_card ON card_members(card_id);
CREATE INDEX idx_card_members_user ON card_members(user_id);
```

### comments

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_card ON comments(card_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(card_id, created_at DESC);
```

### activities

```sql
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
```

## Row Level Security (RLS) Policies

### profiles

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### boards

```sql
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Users can view boards they are members of
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

-- Users can create boards
CREATE POLICY "Users can create boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their boards
CREATE POLICY "Owners can update boards"
  ON boards FOR UPDATE
  USING (owner_id = auth.uid());

-- Owners can delete their boards
CREATE POLICY "Owners can delete boards"
  ON boards FOR DELETE
  USING (owner_id = auth.uid());
```

### board_members

```sql
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Users can view members of boards they have access to
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

-- Board owners can insert members
CREATE POLICY "Owners can add members"
  ON board_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_id
      AND boards.owner_id = auth.uid()
    )
  );

-- Board owners can delete members
CREATE POLICY "Owners can remove members"
  ON board_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_id
      AND boards.owner_id = auth.uid()
    )
  );
```

### lists

```sql
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Users can view lists from boards they have access to
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

-- Board members can create lists
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

-- Board members can update lists
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

-- Board members can delete lists
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
```

### cards

```sql
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Users can view cards from boards they have access to
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

-- Board members can create cards
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

-- Board members can update cards
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

-- Board members can delete cards
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
```

### Similar RLS policies for card_members, comments, and activities

## Functions and Triggers

### Update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Create default lists for new boards

```sql
CREATE OR REPLACE FUNCTION create_default_lists()
RETURNS TRIGGER AS $$
BEGIN
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
$$ language 'plpgsql';

CREATE TRIGGER create_default_lists_trigger
  AFTER INSERT ON boards
  FOR EACH ROW
  EXECUTE FUNCTION create_default_lists();
```

### Log activities

```sql
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  board_id_val UUID;
  action_val TEXT;
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
  ELSIF TG_TABLE_NAME = 'lists' THEN
    board_id_val := COALESCE(NEW.board_id, OLD.board_id);
  ELSIF TG_TABLE_NAME = 'cards' THEN
    SELECT lists.board_id INTO board_id_val
    FROM lists WHERE lists.id = COALESCE(NEW.list_id, OLD.list_id);
  ELSIF TG_TABLE_NAME = 'comments' THEN
    SELECT lists.board_id INTO board_id_val
    FROM cards
    JOIN lists ON lists.id = cards.list_id
    WHERE cards.id = COALESCE(NEW.card_id, OLD.card_id);
  END IF;

  -- Insert activity
  IF board_id_val IS NOT NULL THEN
    INSERT INTO activities (board_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (
      board_id_val,
      auth.uid(),
      action_val,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql' SECURITY DEFINER;

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
```

## Indexes

All necessary indexes are created inline with table definitions above. Key indexes include:

- Foreign key columns
- Frequently queried columns (owner_id, created_at)
- Position columns for ordering
- Composite indexes for common query patterns

## Data Migration

See [/supabase/migrations](../supabase/migrations/) for sequential migration files.
