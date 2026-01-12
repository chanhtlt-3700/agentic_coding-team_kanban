# API Documentation

## Overview

The Team Kanban API provides RESTful endpoints for managing boards, lists, cards, comments, and activities.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.vercel.app/api
```

## Authentication

All API endpoints (except auth endpoints) require authentication using Supabase session tokens.

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": { ... }
}
```

#### POST /api/auth/login
#### POST /api/auth/logout
#### GET /api/auth/me

### Boards API

#### GET /api/boards
Get all boards for current user.

**Response:**
```json
{
  "boards": [
    {
      "id": "uuid",
      "title": "My Project",
      "description": "Project description",
      "owner_id": "uuid",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z",
      "owner": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

#### POST /api/boards

Create a new board.

**Request:**
```json
{
  "title": "Project Alpha",
  "description": "Project management board"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "title": "Project Alpha",
  "description": "Main project board",
  "owner_id": "user-uuid",
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:00:00Z"
}
```

#### GET /api/boards/:id

Get board details with lists and cards.

**Response:**
```json
{
  "id": "uuid",
  "title": "My Board",
  "description": "Board description",
  "owner_id": "uuid",
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:00:00Z",
  "lists": [
    {
      "id": "uuid",
      "title": "To Do",
      "position": 0,
      "cards": [
        {
          "id": "uuid",
          "title": "Task 1",
          "description": "Description",
          "position": 0,
          "members": [],
          "comment_count": 0
        }
      ]
    }
  ]
}
```

### PUT /api/boards/:id
Update board details.

**Request Body:**
```json
{
  "title": "Updated Board Title",
  "description": "Updated description"
}
```

**Response:** Updated board object

### DELETE /api/boards/:id

Deletes a board and all associated data.

**Response:** 204 No Content

---

## Lists

### POST /api/boards/:boardId/lists

Create a new list in a board.

**Request Body:**
```json
{
  "title": "In Review",
  "position": 2
}
```

**Response:**
```json
{
  "id": "uuid",
  "board_id": "uuid",
  "title": "In Review",
  "position": 2,
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:00:00Z"
}
```

### PUT /api/lists/:id

Update a list.

**Request Body:**
```json
{
  "title": "Completed"
}
```

### DELETE /api/lists/:id

Delete a list and archive its cards.

### PUT /api/lists/:id/position

Reorder a list.

**Request Body:**
```json
{
  "position": 2
}
```

## Cards

### GET /api/boards/:boardId/cards

Get all cards for a board.

**Response:**
```json
{
  "cards": [
    {
      "id": "uuid",
      "list_id": "uuid",
      "title": "Card title",
      "description": "Card description",
      "position": 0,
      "created_by": "user-uuid",
      "created_at": "2026-01-12T10:00:00Z",
      "updated_at": "2026-01-12T10:00:00Z",
      "members": [...],
      "comments_count": 3
    }
  ]
}
```

### POST /api/lists/:listId/cards

Create a new card in a list.

**Request:**
```json
{
  "title": "Implement login page",
  "description": "Create login page with email/password form"
}
```

**Response:**
```json
{
  "id": "uuid",
  "list_id": "uuid",
  "title": "Implement login page",
  "description": "...",
  "position": 0,
  "created_by": "user-uuid",
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:00:00Z"
}
```

### GET /api/cards/:id

Get card details with members and comments.

**Response:**
```json
{
  "id": "uuid",
  "list_id": "uuid",
  "title": "Implement login",
  "description": "Create login page with email/password",
  "position": 0,
  "created_by": "uuid",
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:00:00Z",
  "members": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "avatar_url": "https://..."
    }
  ],
  "comments": [
    {
      "id": "comment-uuid",
      "user_id": "user-uuid",
      "user": {
        "name": "Jane Smith",
        "avatar_url": "..."
      },
      "content": "Working on this",
      "created_at": "2026-01-12T10:00:00Z"
    }
  ]
}
```

### PUT /api/cards/:id

Update card details.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

### PUT /api/cards/:id/move

Move card to a different list.

**Request Body:**
```json
{
  "list_id": "list-uuid",
  "position": 2
}
```

### DELETE /api/cards/:id

Delete a card.

## Comments API

### POST /api/cards/:cardId/comments

Add a comment to a card.

**Request Body:**
```json
{
  "content": "This is a comment"
}
```

### PUT /api/comments/:id

Update a comment.

**Request Body:**
```json
{
  "content": "Updated comment"
}
```

### DELETE /api/comments/:id

Delete a comment.

## Activities API

### GET /api/boards/:boardId/activities

Get activity log for a board.

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20

**Response:**
```json
{
  "activities": [
    {
      "id": "activity-uuid",
      "user": {
        "name": "John Doe",
        "avatar_url": "..."
      },
      "action": "card_created",
      "entity_type": "cards",
      "entity_id": "card-uuid",
      "metadata": {
        "card_title": "New task"
      },
      "created_at": "2026-01-12T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "has_more": true
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

Common HTTP status codes:
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to perform action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
