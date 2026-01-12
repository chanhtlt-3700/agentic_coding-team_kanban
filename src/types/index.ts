import { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Board = Database['public']['Tables']['boards']['Row']
export type BoardMember = Database['public']['Tables']['board_members']['Row']
export type List = Database['public']['Tables']['lists']['Row']
export type Card = Database['public']['Tables']['cards']['Row']
export type CardMember = Database['public']['Tables']['card_members']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']

// Extended types with relations
export interface BoardWithOwner extends Board {
  owner: Profile
}

export interface ListWithCards extends List {
  cards: CardWithMembers[]
}

export interface CardWithMembers extends Card {
  members: Profile[]
  comments_count?: number
}

export interface CardDetails extends Card {
  members: Profile[]
  comments: CommentWithUser[]
  creator: Profile
}

export interface CommentWithUser extends Comment {
  user: Profile
}

export interface ActivityWithUser extends Activity {
  user: Profile
}

export interface BoardDetails extends Board {
  owner: Profile
  lists: ListWithCards[]
  members: Profile[]
}
