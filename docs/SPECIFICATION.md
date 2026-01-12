# Team Kanban - Product Specification

## 1. Product Overview

### 1.1 Purpose
Team Kanban is a collaborative task management application designed for small teams to organize and track their work using the Kanban methodology.

### 1.2 Target Users
- Small development teams (2-10 members)
- Project managers
- Freelancers managing multiple projects
- Teams practicing Agile/Scrum methodologies

### 1.3 Key Benefits
- Visual workflow management
- Real-time collaboration
- Simple and intuitive interface
- Activity tracking and transparency
- Flexible task organization

## 2. Functional Requirements

### 2.1 User Management

#### 2.1.1 Authentication
- **FR-AUTH-001**: Users can register with email and password
- **FR-AUTH-002**: Users can log in with email and password
- **FR-AUTH-003**: Users can log out
- **FR-AUTH-004**: Users can reset password via email
- **FR-AUTH-005**: System maintains user session

#### 2.1.2 User Profile
- **FR-USER-001**: Users have a profile with name, email, and avatar
- **FR-USER-002**: Users can update their profile information

### 2.2 Board Management

#### 2.2.1 Board Creation
- **FR-BOARD-001**: Users can create new boards with a title and description
- **FR-BOARD-002**: Board creator becomes the owner
- **FR-BOARD-003**: Each board has a unique identifier

#### 2.2.2 Board Access
- **FR-BOARD-004**: Users can view list of their boards
- **FR-BOARD-005**: Users can open a board to see its contents
- **FR-BOARD-006**: Users can edit board title and description
- **FR-BOARD-007**: Users can delete boards they own
- **FR-BOARD-008**: Deleting a board also deletes all its lists and cards

#### 2.2.3 Board Sharing
- **FR-BOARD-009**: Board owners can invite other users via email
- **FR-BOARD-010**: Invited users receive access to the board
- **FR-BOARD-011**: Board owners can remove users from the board

### 2.3 List Management

#### 2.3.1 List Creation
- **FR-LIST-001**: Users can create lists within a board
- **FR-LIST-002**: Each list has a title
- **FR-LIST-003**: Lists are ordered within a board
- **FR-LIST-004**: Default boards come with three lists: "To Do", "In Progress", "Done"

#### 2.3.2 List Operations
- **FR-LIST-005**: Users can rename lists
- **FR-LIST-006**: Users can delete lists (moves cards to archive)
- **FR-LIST-007**: Users can reorder lists via drag-and-drop
- **FR-LIST-008**: Users can archive lists

### 2.4 Card Management

#### 2.4.1 Card Creation
- **FR-CARD-001**: Users can create cards within a list
- **FR-CARD-002**: Cards have a title (required)
- **FR-CARD-003**: Cards have a description (optional)
- **FR-CARD-004**: Cards are ordered within a list

#### 2.4.2 Card Details
- **FR-CARD-005**: Users can view card details in a modal/drawer
- **FR-CARD-006**: Users can edit card title and description
- **FR-CARD-007**: Cards display creation date and creator
- **FR-CARD-008**: Cards show assigned members
- **FR-CARD-009**: Cards display number of comments

#### 2.4.3 Card Operations
- **FR-CARD-010**: Users can delete cards
- **FR-CARD-011**: Users can archive cards
- **FR-CARD-012**: Users can move cards between lists via drag-and-drop
- **FR-CARD-013**: Users can reorder cards within a list via drag-and-drop
- **FR-CARD-014**: Moving cards updates their status

### 2.5 Card Assignment

#### 2.5.1 Member Assignment
- **FR-ASSIGN-001**: Users can assign board members to cards
- **FR-ASSIGN-002**: Multiple members can be assigned to one card
- **FR-ASSIGN-003**: Users can unassign members from cards
- **FR-ASSIGN-004**: Assigned members see visual indication on card

### 2.6 Comments

#### 2.6.1 Comment Creation
- **FR-COMMENT-001**: Users can add comments to cards
- **FR-COMMENT-002**: Comments have text content
- **FR-COMMENT-003**: Comments display author and timestamp
- **FR-COMMENT-004**: Comments are ordered chronologically

#### 2.6.2 Comment Operations
- **FR-COMMENT-005**: Users can edit their own comments
- **FR-COMMENT-006**: Users can delete their own comments
- **FR-COMMENT-007**: Comment count is visible on card preview

### 2.7 Activity Log

#### 2.7.1 Activity Tracking
- **FR-ACTIVITY-001**: System logs all board activities
- **FR-ACTIVITY-002**: Tracked activities include:
  - Board created/updated/deleted
  - List created/updated/deleted/moved
  - Card created/updated/deleted/moved
  - Member assigned/unassigned
  - Comment added/edited/deleted
- **FR-ACTIVITY-003**: Each activity records: actor, action, timestamp, target

#### 2.7.2 Activity Display
- **FR-ACTIVITY-004**: Users can view activity log for a board
- **FR-ACTIVITY-005**: Activities are displayed in reverse chronological order
- **FR-ACTIVITY-006**: Activities show user-friendly descriptions
- **FR-ACTIVITY-007**: Activity log is paginated

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-PERF-001**: Page load time < 2 seconds
- **NFR-PERF-002**: Drag-and-drop operations feel instant (< 100ms)
- **NFR-PERF-003**: Real-time updates appear within 1 second

### 3.2 Usability
- **NFR-USE-001**: Interface is responsive (mobile, tablet, desktop)
- **NFR-USE-002**: Interface follows modern design principles
- **NFR-USE-003**: Drag-and-drop is intuitive and smooth
- **NFR-USE-004**: Loading states are clearly indicated

### 3.3 Security
- **NFR-SEC-001**: Passwords are hashed and never stored in plain text
- **NFR-SEC-002**: API endpoints are authenticated
- **NFR-SEC-003**: Users can only access boards they have permission for
- **NFR-SEC-004**: SQL injection is prevented

### 3.4 Reliability
- **NFR-REL-001**: System uptime > 99%
- **NFR-REL-002**: Data is backed up regularly
- **NFR-REL-003**: Errors are logged and monitored

### 3.5 Scalability
- **NFR-SCALE-001**: Support up to 1000 concurrent users
- **NFR-SCALE-002**: Support boards with up to 1000 cards

## 4. User Interface

### 4.1 Screen Flow
1. **Landing Page** → Login/Register
2. **Dashboard** → List of user's boards
3. **Board View** → Lists and cards with drag-and-drop
4. **Card Detail** → Full card information, comments, activity

### 4.2 Key Screens

#### 4.2.1 Dashboard
- Header with user profile and logout
- "Create New Board" button
- Grid/list of boards with titles and preview
- Board cards show last activity

#### 4.2.2 Board View
- Board title and description at top
- Horizontal scrollable lists
- Each list shows title and card count
- Cards show title, assigned members, comment count
- "Add List" button at the end
- Activity log in sidebar (optional)

#### 4.2.3 Card Detail Modal
- Card title (editable)
- Description text area
- Assigned members section with avatar list
- Comments section with add comment form
- Activity timeline
- Delete/Archive buttons

### 4.3 Drag and Drop Interactions
- **Cards**: Can be dragged between lists and reordered within lists
- **Lists**: Can be reordered horizontally
- Visual feedback: dragged item has opacity, drop zone is highlighted
- Smooth animations for reordering

## 5. Data Model

### 5.1 Entities

#### Users
- id (UUID)
- email (string, unique)
- name (string)
- avatar_url (string, nullable)
- created_at (timestamp)

#### Boards
- id (UUID)
- title (string)
- description (text, nullable)
- owner_id (UUID → Users)
- created_at (timestamp)
- updated_at (timestamp)

#### Board Members
- board_id (UUID → Boards)
- user_id (UUID → Users)
- role (string: owner, member)
- joined_at (timestamp)

#### Lists
- id (UUID)
- board_id (UUID → Boards)
- title (string)
- position (integer)
- created_at (timestamp)
- updated_at (timestamp)

#### Cards
- id (UUID)
- list_id (UUID → Lists)
- title (string)
- description (text, nullable)
- position (integer)
- created_by (UUID → Users)
- created_at (timestamp)
- updated_at (timestamp)

#### Card Members
- card_id (UUID → Cards)
- user_id (UUID → Users)
- assigned_at (timestamp)

#### Comments
- id (UUID)
- card_id (UUID → Cards)
- user_id (UUID → Users)
- content (text)
- created_at (timestamp)
- updated_at (timestamp)

#### Activities
- id (UUID)
- board_id (UUID → Boards)
- user_id (UUID → Users)
- action (string)
- entity_type (string)
- entity_id (UUID)
- metadata (jsonb)
- created_at (timestamp)

## 6. API Endpoints

### 6.1 Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/reset-password

### 6.2 Boards
- GET /api/boards - List user's boards
- POST /api/boards - Create board
- GET /api/boards/:id - Get board details
- PUT /api/boards/:id - Update board
- DELETE /api/boards/:id - Delete board

### 6.3 Lists
- POST /api/boards/:boardId/lists - Create list
- PUT /api/lists/:id - Update list
- DELETE /api/lists/:id - Delete list
- PUT /api/lists/:id/position - Reorder list

### 6.4 Cards
- POST /api/lists/:listId/cards - Create card
- GET /api/cards/:id - Get card details
- PUT /api/cards/:id - Update card
- DELETE /api/cards/:id - Delete card
- PUT /api/cards/:id/move - Move card to another list

### 6.5 Comments
- POST /api/cards/:cardId/comments - Add comment
- PUT /api/comments/:id - Update comment
- DELETE /api/comments/:id - Delete comment

### 6.6 Activities
- GET /api/boards/:boardId/activities - Get board activities

## 7. Implementation Phases

### Phase 1: Foundation (Week 1)
- Project setup and configuration
- Database schema and migrations
- Authentication system
- Basic UI layout

### Phase 2: Core Features (Week 2)
- Board CRUD operations
- List CRUD operations
- Card CRUD operations
- Basic drag-and-drop

### Phase 3: Collaboration (Week 3)
- Card assignments
- Comments system
- Activity logging
- Real-time updates

### Phase 4: Polish (Week 4)
- UI/UX improvements
- Performance optimization
- Testing
- Deployment

## 8. Success Metrics

- Users can create a board in < 30 seconds
- Users can create and organize 10 cards in < 2 minutes
- 90% of users understand drag-and-drop without tutorial
- Zero data loss incidents
- Page load time < 2 seconds
