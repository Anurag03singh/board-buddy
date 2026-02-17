# TaskFlow API Documentation

## Overview

TaskFlow uses Supabase's auto-generated REST API (PostgREST) for all backend operations. All endpoints require authentication via JWT token in the Authorization header.

**Base URL**: `https://your-project.supabase.co/rest/v1`

**Authentication**: 
```
Authorization: Bearer <JWT_TOKEN>
```

## Authentication API

### Sign Up

Create a new user account.

**Endpoint**: `POST /auth/v1/signup`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "data": {
    "display_name": "John Doe"
  }
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "display_name": "John Doe"
    }
  }
}
```

**Errors**:
- `400`: Invalid email or password format
- `422`: User already exists

---

### Sign In

Authenticate existing user.

**Endpoint**: `POST /auth/v1/token?grant_type=password`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Errors**:
- `400`: Invalid credentials
- `401`: Unauthorized

---

### Sign Out

Invalidate current session.

**Endpoint**: `POST /auth/v1/logout`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response** (204 No Content)

---

### Refresh Token

Get new access token using refresh token.

**Endpoint**: `POST /auth/v1/token?grant_type=refresh_token`

**Request Body**:
```json
{
  "refresh_token": "..."
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "..."
}
```

---

## Profiles API

### Get Current User Profile

**Endpoint**: `GET /profiles?user_id=eq.{user_id}`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Update Profile

**Endpoint**: `PATCH /profiles?user_id=eq.{user_id}`

**Request Body**:
```json
{
  "display_name": "Jane Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "email": "user@example.com",
    "display_name": "Jane Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "updated_at": "2024-01-02T00:00:00Z"
  }
]
```

---

## Boards API

### List Boards

Get all boards accessible to the current user.

**Endpoint**: `GET /boards?order=created_at.desc`

**Query Parameters**:
- `order`: Sort order (e.g., `created_at.desc`, `title.asc`)
- `limit`: Number of results (default: all)
- `offset`: Pagination offset

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "title": "Project Alpha",
    "description": "Main project board",
    "owner_id": "uuid",
    "color": "#14b8a6",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Get Single Board

**Endpoint**: `GET /boards?id=eq.{board_id}`

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "title": "Project Alpha",
    "description": "Main project board",
    "owner_id": "uuid",
    "color": "#14b8a6",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**Errors**:
- `404`: Board not found or no access

---

### Create Board

**Endpoint**: `POST /boards`

**Request Body**:
```json
{
  "title": "New Project",
  "description": "Project description",
  "owner_id": "uuid",
  "color": "#6366f1"
}
```

**Response** (201 Created):
```json
[
  {
    "id": "uuid",
    "title": "New Project",
    "description": "Project description",
    "owner_id": "uuid",
    "color": "#6366f1",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**Errors**:
- `400`: Invalid request body
- `401`: Unauthorized

---

### Update Board

**Endpoint**: `PATCH /boards?id=eq.{board_id}`

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "color": "#f43f5e"
}
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "owner_id": "uuid",
    "color": "#f43f5e",
    "updated_at": "2024-01-02T00:00:00Z"
  }
]
```

**Errors**:
- `403`: Not board owner
- `404`: Board not found

---

### Delete Board

**Endpoint**: `DELETE /boards?id=eq.{board_id}`

**Response** (204 No Content)

**Errors**:
- `403`: Not board owner
- `404`: Board not found

---

## Lists API

### Get Lists for Board

**Endpoint**: `GET /lists?board_id=eq.{board_id}&order=position.asc`

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "board_id": "uuid",
    "title": "To Do",
    "position": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": "uuid",
    "board_id": "uuid",
    "title": "In Progress",
    "position": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Create List

**Endpoint**: `POST /lists`

**Request Body**:
```json
{
  "board_id": "uuid",
  "title": "Done",
  "position": 2
}
```

**Response** (201 Created):
```json
[
  {
    "id": "uuid",
    "board_id": "uuid",
    "title": "Done",
    "position": 2,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Update List

**Endpoint**: `PATCH /lists?id=eq.{list_id}`

**Request Body**:
```json
{
  "title": "Completed",
  "position": 3
}
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "board_id": "uuid",
    "title": "Completed",
    "position": 3,
    "updated_at": "2024-01-02T00:00:00Z"
  }
]
```

---

### Delete List

**Endpoint**: `DELETE /lists?id=eq.{list_id}`

**Response** (204 No Content)

**Note**: All tasks in the list will be cascade deleted.

---

## Tasks API

### Get Tasks for Board

**Endpoint**: `GET /tasks?board_id=eq.{board_id}&order=position.asc`

**Query Parameters**:
- `list_id=eq.{list_id}`: Filter by list
- `priority=eq.{priority}`: Filter by priority
- `title=ilike.*{search}*`: Search by title

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "list_id": "uuid",
    "board_id": "uuid",
    "title": "Implement authentication",
    "description": "Add user login and signup",
    "position": 0,
    "priority": "high",
    "due_date": "2024-01-15T00:00:00Z",
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Get Single Task

**Endpoint**: `GET /tasks?id=eq.{task_id}`

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "list_id": "uuid",
    "board_id": "uuid",
    "title": "Implement authentication",
    "description": "Add user login and signup",
    "position": 0,
    "priority": "high",
    "due_date": "2024-01-15T00:00:00Z",
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Create Task

**Endpoint**: `POST /tasks`

**Request Body**:
```json
{
  "list_id": "uuid",
  "board_id": "uuid",
  "title": "New task",
  "description": "Task details",
  "priority": "medium",
  "due_date": "2024-01-20T00:00:00Z",
  "created_by": "uuid",
  "position": 0
}
```

**Response** (201 Created):
```json
[
  {
    "id": "uuid",
    "list_id": "uuid",
    "board_id": "uuid",
    "title": "New task",
    "description": "Task details",
    "position": 0,
    "priority": "medium",
    "due_date": "2024-01-20T00:00:00Z",
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Update Task

**Endpoint**: `PATCH /tasks?id=eq.{task_id}`

**Request Body**:
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "high",
  "due_date": "2024-01-25T00:00:00Z"
}
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "title": "Updated task title",
    "description": "Updated description",
    "priority": "high",
    "due_date": "2024-01-25T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  }
]
```

---

### Move Task

Move task to different list or position.

**Endpoint**: `PATCH /tasks?id=eq.{task_id}`

**Request Body**:
```json
{
  "list_id": "uuid",
  "position": 2
}
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "list_id": "uuid",
    "position": 2,
    "updated_at": "2024-01-02T00:00:00Z"
  }
]
```

---

### Delete Task

**Endpoint**: `DELETE /tasks?id=eq.{task_id}`

**Response** (204 No Content)

---

## Task Assignments API

### Get Task Assignees

**Endpoint**: `GET /task_assignments?task_id=eq.{task_id}`

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "task_id": "uuid",
    "user_id": "uuid",
    "assigned_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Assign User to Task

**Endpoint**: `POST /task_assignments`

**Request Body**:
```json
{
  "task_id": "uuid",
  "user_id": "uuid"
}
```

**Response** (201 Created):
```json
[
  {
    "id": "uuid",
    "task_id": "uuid",
    "user_id": "uuid",
    "assigned_at": "2024-01-01T00:00:00Z"
  }
]
```

**Errors**:
- `409`: User already assigned to task

---

### Unassign User from Task

**Endpoint**: `DELETE /task_assignments?task_id=eq.{task_id}&user_id=eq.{user_id}`

**Response** (204 No Content)

---

## Board Members API

### Get Board Members

**Endpoint**: `GET /board_members?board_id=eq.{board_id}`

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "board_id": "uuid",
    "user_id": "uuid",
    "role": "member",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Add Board Member

**Endpoint**: `POST /board_members`

**Request Body**:
```json
{
  "board_id": "uuid",
  "user_id": "uuid",
  "role": "member"
}
```

**Response** (201 Created):
```json
[
  {
    "id": "uuid",
    "board_id": "uuid",
    "user_id": "uuid",
    "role": "member",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Errors**:
- `403`: Only board owner can add members
- `409`: User already a member

---

### Remove Board Member

**Endpoint**: `DELETE /board_members?board_id=eq.{board_id}&user_id=eq.{user_id}`

**Response** (204 No Content)

**Errors**:
- `403`: Only board owner can remove members

---

## Activity Log API

### Get Board Activity

**Endpoint**: `GET /activity_log?board_id=eq.{board_id}&order=created_at.desc&limit=50`

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "board_id": "uuid",
    "user_id": "uuid",
    "action": "created",
    "entity_type": "task",
    "entity_id": "uuid",
    "entity_title": "New task",
    "metadata": {
      "priority": "high"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Log Activity

**Endpoint**: `POST /activity_log`

**Request Body**:
```json
{
  "board_id": "uuid",
  "user_id": "uuid",
  "action": "updated",
  "entity_type": "task",
  "entity_id": "uuid",
  "entity_title": "Task title",
  "metadata": {
    "field": "priority",
    "old_value": "medium",
    "new_value": "high"
  }
}
```

**Response** (201 Created):
```json
[
  {
    "id": "uuid",
    "board_id": "uuid",
    "user_id": "uuid",
    "action": "updated",
    "entity_type": "task",
    "entity_id": "uuid",
    "entity_title": "Task title",
    "metadata": {
      "field": "priority",
      "old_value": "medium",
      "new_value": "high"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## Real-Time Subscriptions

### Subscribe to Board Changes

**WebSocket Connection**: `wss://your-project.supabase.co/realtime/v1/websocket`

**Channel**: `board-{board_id}`

**Events**:
- `postgres_changes:public.tasks:*` - All task changes
- `postgres_changes:public.lists:*` - All list changes
- `postgres_changes:public.activity_log:INSERT` - New activities

**Example (JavaScript)**:
```javascript
const channel = supabase
  .channel(`board-${boardId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks',
    filter: `board_id=eq.${boardId}`
  }, (payload) => {
    console.log('Task changed:', payload)
  })
  .subscribe()
```

---

## Error Responses

### Standard Error Format

```json
{
  "code": "error_code",
  "message": "Human readable error message",
  "details": "Additional details",
  "hint": "Suggestion to fix the error"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET/PATCH request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Duplicate resource
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

## Rate Limiting

**Current Limits** (Supabase Free Tier):
- 500 requests per second per IP
- 2GB database size
- 50,000 monthly active users

**Headers**:
```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 499
X-RateLimit-Reset: 1640000000
```

---

## Pagination

Use `limit` and `offset` query parameters:

```
GET /tasks?board_id=eq.{board_id}&limit=20&offset=0
```

**Response Headers**:
```
Content-Range: 0-19/100
```

---

## Filtering & Sorting

### Operators

- `eq`: Equals
- `neq`: Not equals
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal
- `like`: Pattern matching
- `ilike`: Case-insensitive pattern matching
- `in`: In list
- `is`: Is null/not null

### Examples

```
GET /tasks?priority=eq.high
GET /tasks?title=ilike.*urgent*
GET /tasks?due_date=gte.2024-01-01
GET /tasks?priority=in.(high,medium)
GET /tasks?order=created_at.desc,title.asc
```

---

## Client Libraries

### JavaScript/TypeScript

```bash
npm install @supabase/supabase-js
```

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// Example: Get boards
const { data, error } = await supabase
  .from('boards')
  .select('*')
  .order('created_at', { ascending: false })
```

### Other Languages

- Python: `supabase-py`
- Dart: `supabase-flutter`
- C#: `supabase-csharp`
- Swift: `supabase-swift`

---

## Postman Collection

Import this collection to test the API:

[Download Postman Collection](./postman_collection.json)

---

## Support

For API issues or questions:
- GitHub Issues: [repository-url]/issues
- Email: support@taskflow.com
- Documentation: https://supabase.com/docs
