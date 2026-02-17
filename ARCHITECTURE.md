# TaskFlow Architecture Documentation

## System Overview

TaskFlow is a real-time collaborative task management platform built using a modern JAMstack architecture with Supabase as the backend-as-a-service provider.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite + TypeScript)                       │  │
│  │  - Component Library (shadcn/ui)                     │  │
│  │  - State Management (TanStack Query + Context)       │  │
│  │  - Routing (React Router)                            │  │
│  │  - Real-time (Supabase Realtime Client)              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Platform                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Auth API   │  │  REST API    │  │  Realtime API   │  │
│  │   (GoTrue)   │  │  (PostgREST) │  │  (Phoenix)      │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                            ↕                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         PostgreSQL Database + RLS                    │  │
│  │  - Tables: boards, lists, tasks, profiles, etc.      │  │
│  │  - Row Level Security Policies                       │  │
│  │  - Triggers & Functions                              │  │
│  │  - Indexes for Performance                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── QueryClientProvider (TanStack Query)
│   │   ├── TooltipProvider
│   │   │   ├── BrowserRouter
│   │   │   │   ├── Routes
│   │   │   │   │   ├── Index (Landing)
│   │   │   │   │   ├── Auth (Login/Signup)
│   │   │   │   │   ├── Boards (Board List)
│   │   │   │   │   └── BoardView (Kanban Board)
│   │   │   │   │       ├── DragDropContext
│   │   │   │   │       │   ├── List (Droppable)
│   │   │   │   │       │   │   └── TaskCard (Draggable)
│   │   │   │   │       │   └── TaskDialog
│   │   │   │   │       └── ActivityPanel
│   │   │   ├── Toaster (Notifications)
│   │   │   └── Sonner (Toast)
```

### State Management Strategy

**1. Server State (TanStack Query)**
- Caching API responses
- Background refetching
- Optimistic updates
- Automatic retry logic

**2. Authentication State (React Context)**
- User session management
- Auth state propagation
- Sign in/out handlers

**3. Local UI State (useState/useReducer)**
- Form inputs
- Modal open/close
- Search filters
- Drag-and-drop state

**4. Real-time State (Supabase Subscriptions)**
- WebSocket connections
- Live data updates
- Automatic refetch triggers

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Optimistic UI Update (optional)
    ↓
Supabase API Call
    ↓
Database Operation + RLS Check
    ↓
Response to Client
    ↓
TanStack Query Cache Update
    ↓
Component Re-render
    ↓
Realtime Broadcast (if applicable)
    ↓
Other Clients Receive Update
    ↓
Auto-refetch Data
    ↓
UI Updates Across All Clients
```

### Key Design Patterns

**1. Container/Presenter Pattern**
- Pages handle data fetching
- Components handle presentation
- Clear separation of concerns

**2. Compound Components**
- Dialog, Select, Dropdown use composition
- Flexible and reusable
- Type-safe props

**3. Custom Hooks**
- `useAuth()` - Authentication state
- `useToast()` - Notifications
- Encapsulate complex logic

**4. Optimistic Updates**
- Immediate UI feedback
- Rollback on error
- Better perceived performance

## Backend Architecture

### Supabase Components

**1. PostgreSQL Database**
- Primary data store
- ACID compliance
- Full SQL capabilities
- JSON/JSONB support

**2. PostgREST API Layer**
- Auto-generated REST endpoints
- Direct table access via HTTP
- Query parameters for filtering
- Automatic OpenAPI documentation

**3. GoTrue Authentication**
- JWT-based auth
- Email/password support
- OAuth providers (extensible)
- User metadata storage

**4. Realtime Server (Phoenix)**
- WebSocket connections
- Postgres CDC (Change Data Capture)
- Broadcast channels
- Presence tracking (not used)

### Row Level Security (RLS)

RLS policies enforce authorization at the database level:

```sql
-- Example: Users can only see boards they own or are members of
CREATE POLICY "Board visible to owner and members"
  ON public.boards FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = boards.id 
      AND user_id = auth.uid()
    )
  );
```

**Benefits:**
- Security enforced at database level
- No way to bypass via API
- Consistent across all clients
- Reduces backend code

### Database Design Principles

**1. Normalization**
- 3NF for most tables
- Denormalized `board_id` in tasks for performance

**2. Referential Integrity**
- Foreign keys with CASCADE deletes
- Ensures data consistency

**3. Indexing Strategy**
- B-tree indexes on foreign keys
- GIN index on task titles for full-text search
- Composite indexes for common queries

**4. Audit Trail**
- `created_at` and `updated_at` on all tables
- Immutable `activity_log` table
- Triggers for automatic timestamp updates

## Real-Time Architecture

### Subscription Model

```typescript
// Client subscribes to board-specific channel
const channel = supabase
  .channel(`board-${boardId}`)
  .on('postgres_changes', {
    event: '*',           // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'tasks',
    filter: `board_id=eq.${boardId}`
  }, handleChange)
  .subscribe()
```

### Message Flow

```
User A: Update Task
    ↓
Client A: Optimistic Update
    ↓
Client A: API Call to Supabase
    ↓
PostgreSQL: Update Row
    ↓
PostgreSQL: Trigger WAL Event
    ↓
Realtime Server: Capture CDC Event
    ↓
Realtime Server: Broadcast to Channel
    ↓
Client B, C, D: Receive Event
    ↓
Clients: Refetch Data
    ↓
Clients: Update UI
```

### Conflict Resolution

**Strategy: Last-Write-Wins**
- Simplest approach for MVP
- Relies on `updated_at` timestamps
- No complex CRDTs or OT

**Limitations:**
- Concurrent edits may be lost
- No merge conflict UI
- Acceptable for task management use case

**Future Improvements:**
- Implement version vectors
- Add conflict detection UI
- Use operational transforms for text fields

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. GoTrue validates and issues JWT
3. JWT stored in localStorage (httpOnly cookie in production)
4. JWT included in all API requests
5. PostgREST validates JWT signature
6. RLS policies check auth.uid()
7. Query executed with user context
```

### Security Layers

**1. Transport Security**
- HTTPS only in production
- WSS for WebSocket connections
- Certificate pinning (browser default)

**2. Authentication**
- JWT with expiration
- Refresh token rotation
- Secure password hashing (bcrypt)

**3. Authorization**
- Row Level Security policies
- Role-based access (owner/member)
- Database-level enforcement

**4. Input Validation**
- Client-side validation (UX)
- Database constraints (security)
- Type checking (TypeScript)

**5. XSS Prevention**
- React auto-escaping
- Content Security Policy headers
- Sanitized user input

**6. CSRF Protection**
- SameSite cookies
- JWT in Authorization header
- No state-changing GET requests

## Performance Optimization

### Frontend Optimizations

**1. Code Splitting**
- Route-based lazy loading
- Dynamic imports for heavy components
- Reduced initial bundle size

**2. Caching Strategy**
- TanStack Query cache
- Stale-while-revalidate pattern
- Background refetching

**3. Rendering Optimization**
- React.memo for expensive components
- useMemo/useCallback for computations
- Virtual scrolling for long lists (future)

**4. Asset Optimization**
- Vite's automatic code splitting
- Tree shaking unused code
- Minification and compression

### Backend Optimizations

**1. Database Indexes**
- Foreign key indexes
- Composite indexes for common queries
- Full-text search index

**2. Query Optimization**
- Select only needed columns
- Limit result sets
- Use pagination (to be implemented)

**3. Connection Pooling**
- PgBouncer for connection management
- Reduces connection overhead
- Handles concurrent users

**4. Caching (Future)**
- Redis for frequently accessed data
- Cache invalidation on updates
- Reduced database load

## Deployment Architecture

### Current Setup (Development)

```
Developer Machine
    ↓
Vite Dev Server (localhost:5173)
    ↓
Supabase Cloud (hosted)
```

### Production Setup

```
Git Repository
    ↓
CI/CD Pipeline (GitHub Actions)
    ↓
Build Process (npm run build)
    ↓
Static Assets (dist/)
    ↓
CDN / Static Hosting (Vercel/Netlify)
    ↓
Users (Global)
    ↓
Supabase Cloud (Multi-region)
```

### Recommended Production Stack

**Frontend Hosting:**
- Vercel / Netlify / Cloudflare Pages
- Global CDN
- Automatic HTTPS
- Preview deployments

**Backend:**
- Supabase Cloud (managed)
- Automatic backups
- Point-in-time recovery
- Multi-region support

**Monitoring:**
- Sentry for error tracking
- Supabase Dashboard for DB metrics
- Vercel Analytics for performance

## Scalability Considerations

### Current Capacity

- **Users**: 0-10K concurrent
- **Boards**: Unlimited
- **Tasks per board**: ~1000 (tested)
- **Real-time connections**: Limited by Supabase plan

### Scaling Strategies

**Phase 1: 10K-100K users**
- Upgrade Supabase plan
- Implement Redis caching
- Add rate limiting
- Optimize database queries
- Use read replicas

**Phase 2: 100K-1M users**
- Horizontal database sharding
- Microservices architecture
- Separate WebSocket server cluster
- Message queue for async operations
- Multi-region deployment

**Phase 3: 1M+ users**
- Custom backend infrastructure
- Distributed database (CockroachDB)
- Kubernetes orchestration
- Global load balancing
- Advanced caching strategies

### Bottlenecks & Solutions

**Bottleneck 1: Database Connections**
- Solution: Connection pooling (PgBouncer)
- Solution: Read replicas for queries

**Bottleneck 2: Real-time Connections**
- Solution: WebSocket server cluster
- Solution: Redis pub/sub for message distribution

**Bottleneck 3: API Rate Limits**
- Solution: Implement client-side request batching
- Solution: Use Supabase Edge Functions for complex operations

**Bottleneck 4: Large Boards**
- Solution: Implement pagination
- Solution: Virtual scrolling
- Solution: Lazy load tasks

## Testing Strategy

### Test Pyramid

```
        /\
       /E2E\         (Few) - Critical user flows
      /------\
     /  INT   \      (Some) - Component integration
    /----------\
   /   UNIT     \    (Many) - Utility functions
  /--------------\
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Key user flows
- **E2E Tests**: Critical paths (auth, create board, move task)

### Testing Tools

- **Vitest**: Unit and integration tests
- **Testing Library**: Component tests
- **Playwright** (future): E2E tests
- **MSW** (future): API mocking

## Future Enhancements

### Short Term
- Implement task assignments UI
- Add pagination for large datasets
- Improve test coverage
- Add loading skeletons

### Medium Term
- Comments on tasks
- File attachments
- Board templates
- Email notifications
- Mobile app (React Native)

### Long Term
- Advanced permissions
- Custom fields
- Automation rules
- Time tracking
- Reporting and analytics
- API for third-party integrations
