# Screenshots and User Guide

## Application Overview

Team Kanban is a collaborative task management application built with Next.js, TypeScript, and Supabase.

## Screenshots Guide

### 1. Landing Page

**Location**: `/` (redirects to `/login` if not authenticated)

**What to screenshot**:
- Initial page load
- Clean landing page design

**How to capture**:
```bash
# Start the app
npm run dev

# Navigate to http://localhost:3000
# Take screenshot of landing page
```

---

### 2. Registration Page

**Location**: `/register`

**Features to show**:
- Registration form with email, name, password
- Link to login page
- Form validation

**Screenshot checklist**:
- [ ] Empty form
- [ ] Form with sample data
- [ ] Validation error messages
- [ ] Success state (redirects to dashboard)

**Test data**:
```
Name: John Doe
Email: john@example.com
Password: password123
```

---

### 3. Login Page

**Location**: `/login`

**Features to show**:
- Login form with email and password
- Link to register page
- Remember session

**Screenshot checklist**:
- [ ] Empty login form
- [ ] Login form with data
- [ ] Error message (wrong credentials)
- [ ] Successful login (redirects to dashboard)

---

### 4. Dashboard

**Location**: `/dashboard`

**Features to show**:
- List of user's boards
- Create new board button
- User profile in header
- Logout button

**Screenshot checklist**:
- [ ] Empty dashboard (no boards)
- [ ] Dashboard with multiple boards
- [ ] Board cards showing title, description, owner
- [ ] Create board modal open

---

### 5. Create Board Modal

**Trigger**: Click "Create Board" button on dashboard

**Features to show**:
- Board title input
- Description textarea
- Create/Cancel buttons

**Screenshot checklist**:
- [ ] Empty modal
- [ ] Modal with sample data
- [ ] Validation errors
- [ ] Success (board created)

**Sample data**:
```
Title: Project Alpha
Description: Main development project for Q1 2026
```

---

### 6. Board View

**Location**: `/boards/[id]`

**Features to show**:
- Board title and description in header
- Multiple lists (To Do, In Progress, Done)
- Cards within lists
- Add card buttons
- Add list button
- Drag and drop functionality

**Screenshot checklist**:
- [ ] Empty board with default lists
- [ ] Board with multiple cards
- [ ] Card being dragged (drag state)
- [ ] Card hover state
- [ ] Create card form open

---

### 7. Kanban Lists

**Features to show**:
- List headers with titles
- Card count in list header
- Cards within lists
- Add card button

**Screenshot checklist**:
- [ ] "To Do" list with tasks
- [ ] "In Progress" list with tasks
- [ ] "Done" list with completed tasks
- [ ] Empty list

---

### 8. Cards

**Features to show**:
- Card title
- Card description (if any)
- Assigned members (avatars)
- Comment count
- Card hover effect

**Screenshot checklist**:
- [ ] Simple card (title only)
- [ ] Card with description
- [ ] Card with assigned members
- [ ] Card with comments
- [ ] Multiple cards in different states

---

### 9. Create Card

**Trigger**: Click "Add a card" in any list

**Features to show**:
- Inline card creation form
- Text area for card title
- Add/Cancel buttons

**Screenshot checklist**:
- [ ] Empty form
- [ ] Form with text
- [ ] Card being added

---

### 10. Drag and Drop

**Features to show**:
- Card being dragged
- Drop zone highlighted
- Card moved to new list
- Smooth animation

**Screenshot checklist**:
- [ ] Card in original position
- [ ] Card being dragged (opacity change)
- [ ] Card over different list (preview)
- [ ] Card in new position

**How to capture**:
1. Open browser DevTools
2. Use "Capture screenshot" feature while dragging
3. Or use screen recording and extract frame

---

### 11. Create List

**Trigger**: Click "Add a list" button

**Features to show**:
- Inline list creation
- List title input
- Add list/Cancel buttons

**Screenshot checklist**:
- [ ] Add list button
- [ ] Create list form open
- [ ] New list created

---

### 12. User Interface Elements

**Miscellaneous screenshots**:
- [ ] Header navigation
- [ ] User menu
- [ ] Loading states
- [ ] Empty states
- [ ] Error messages
- [ ] Success notifications

---

## Creating a Complete Screenshot Set

### Recommended Workflow

1. **Setup**:
```bash
npm run dev
# Open http://localhost:3000
```

2. **Register a new user**:
   - Screenshot registration page
   - Complete registration
   - Screenshot dashboard

3. **Create boards**:
   - Screenshot create board modal
   - Create 2-3 boards with different names
   - Screenshot dashboard with boards

4. **Work with first board**:
   - Open board
   - Screenshot empty board
   - Add cards to "To Do" list
   - Screenshot populated list

5. **Demonstrate features**:
   - Move cards between lists
   - Screenshot drag and drop
   - Add more cards
   - Screenshot full board

6. **Create variations**:
   - Add cards with descriptions
   - Screenshot different card types
   - Show completed tasks in "Done"

### Screenshot Specifications

**Format**: PNG or JPEG
**Resolution**: 1920x1080 or higher
**Quality**: High quality, no compression artifacts

**Tools**:
- macOS: Cmd + Shift + 4 (region) or Cmd + Shift + 3 (full screen)
- Windows: Windows + Shift + S
- Browser: DevTools → Capture screenshot
- Third-party: Lightshot, Snagit, etc.

### Screenshot Organization

```
screenshots/
├── 01-landing-page.png
├── 02-register-page.png
├── 03-login-page.png
├── 04-dashboard-empty.png
├── 05-dashboard-with-boards.png
├── 06-create-board-modal.png
├── 07-board-view-empty.png
├── 08-board-view-populated.png
├── 09-drag-and-drop.png
├── 10-create-card.png
├── 11-create-list.png
└── 12-full-workflow.png
```

---

## Video Demo Alternative

Consider creating a short video demo:

1. **Screen recording** (2-3 minutes)
2. **Show**:
   - Registration/Login
   - Creating a board
   - Adding lists and cards
   - Drag and drop
   - Complete workflow

3. **Tools**:
   - macOS: QuickTime Player (Cmd + Shift + 5)
   - Windows: Xbox Game Bar (Windows + G)
   - Online: Loom, Screen Studio

---

## Documentation with Screenshots

Add screenshots to README.md:

```markdown
## Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)
*User dashboard showing multiple project boards*

### Kanban Board
![Kanban Board](./screenshots/board-view.png)
*Board view with drag-and-drop functionality*

### Card Management
![Card Management](./screenshots/cards.png)
*Creating and managing task cards*
```

---

## Tips for Great Screenshots

1. **Use realistic data**: Not "test test test"
2. **Show features in action**: Mid-drag, forms filled
3. **Clean UI**: Hide dev tools, close unnecessary tabs
4. **Consistent theme**: Use same browser, same zoom level
5. **Annotate if helpful**: Add arrows or highlights
6. **Multiple angles**: Show same feature from different views

---

## Next Steps

After capturing screenshots:

1. Create a `screenshots/` folder in the project
2. Add all screenshots with descriptive names
3. Update README.md with screenshots
4. Create a presentation (optional)
5. Prepare demo for submission

---

## Sample Data for Screenshots

Use this realistic data:

**Boards**:
- "Website Redesign Q1 2026"
- "Mobile App Development"
- "Marketing Campaign"

**Lists**:
- To Do
- In Progress
- Review
- Done

**Cards**:
- "Design homepage mockup"
- "Implement user authentication"
- "Set up database schema"
- "Write API documentation"
- "Create landing page"
- "Add payment integration"
- "Deploy to production"

**User**:
- Name: "Sarah Johnson"
- Email: "sarah@company.com"
