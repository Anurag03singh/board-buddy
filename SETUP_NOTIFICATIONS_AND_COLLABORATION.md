# Setup Notifications & Real-Time Collaboration

## 🚨 IMPORTANT: Run This SQL First!

Before testing, you **MUST** run the SQL to enable member access:

### Step 1: Enable Member Access

1. Go to: https://supabase.com/dashboard/project/wnlmuaoekxmeatkffoyu/sql/new
2. Copy the entire content from `ENABLE_MEMBER_ACCESS.sql`
3. Paste and click **"Run"**
4. You should see: "Member access enabled! Board members can now see and collaborate on boards."

This SQL updates the RLS policies so that:
- ✅ Board members can see boards they're added to
- ✅ Members can create/edit lists and tasks
- ✅ Members can assign tasks
- ✅ Members see real-time updates

---

## 🔔 New Features Added

### 1. Notifications System

**Location**: Bell icon (🔔) in the navigation bar

**Features**:
- Real-time notifications when assigned to tasks
- Toast popup when new assignment happens
- Red badge shows unread count
- Click to view all notifications
- Auto-marks as read when opened

**How it works**:
- Uses Supabase Realtime to listen for new task assignments
- Instantly notifies the assigned user
- Shows task title and timestamp
- Persists notification history

### 2. Board Members Management

**Location**: "MEMBERS (0)" button in board header

**Features**:
- Add members by email
- View all board members
- Remove members (owner only)
- Shows member avatars

### 3. Real-Time Collaboration

**After running the SQL**:
- Multiple users can see the same board
- Changes sync instantly across all users
- Drag & drop updates in real-time
- Activity log updates live

---

## 🧪 Complete Test Flow

### Setup (One Time):

```bash
# 1. Make sure server is running
npm run dev

# 2. Run ENABLE_MEMBER_ACCESS.sql in Supabase
# (See Step 1 above)
```

### Test Scenario:

**Browser 1 (Owner - Alice)**:
```
1. Go to http://localhost:8080/
2. Sign up: alice@example.com / password123
3. Create board: "Team Project"
4. Create list: "To Do"
5. Create task: "Setup database"
6. Click "MEMBERS (0)"
7. Add member: bob@example.com
8. Click on task "Setup database"
9. Assign to: bob@example.com
```

**Browser 2 (Member - Bob) - Incognito Window**:
```
1. Go to http://localhost:8080/
2. Sign up: bob@example.com / password123
3. You'll see "Team Project" board! ✅
4. Bell icon shows (1) notification 🔔
5. Click bell - see "You've been assigned to: Setup database"
6. Open the board
7. See the task with your avatar
8. Try dragging the task - Alice sees it move in real-time! ✅
```

**Back to Browser 1 (Alice)**:
```
1. Create new task: "Write tests"
2. Bob sees it appear instantly! ✅
3. Bob drags "Setup database" to another list
4. Alice sees it move in real-time! ✅
```

---

## 🎯 What You'll See

### When Assigning a Task:

**Assigner (Alice)**:
- Clicks task
- Selects Bob from "Assign" dropdown
- Task shows Bob's avatar

**Assignee (Bob)**:
- 🔔 Bell icon shows red badge with "1"
- Toast notification pops up: "New Task Assignment"
- Message: "You've been assigned to: Setup database"
- Can click bell to see notification history

### Real-Time Collaboration:

**User 1 creates a task**:
- User 2 sees it appear instantly
- No page refresh needed

**User 2 drags a task**:
- User 1 sees it move in real-time
- Position updates immediately

**User 1 edits a task**:
- User 2 sees changes instantly
- Activity log updates for both

---

## 🔧 Technical Details

### Notification System:

```typescript
// Listens for new task assignments
supabase
  .channel(`notifications-${user.id}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'task_assignments',
    filter: `user_id=eq.${user.id}`
  }, handleNotification)
  .subscribe()
```

### Real-Time Collaboration:

```typescript
// Listens for board changes
supabase
  .channel(`board-${boardId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks',
    filter: `board_id=eq.${boardId}`
  }, refetchData)
  .subscribe()
```

### RLS Policies:

**Before** (Only owner):
```sql
USING (owner_id = auth.uid())
```

**After** (Owner + Members):
```sql
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM board_members 
    WHERE board_id = boards.id 
    AND user_id = auth.uid()
  )
)
```

---

## ✅ Verification Checklist

After running the SQL, verify:

- [ ] Member can see boards they're added to
- [ ] Member can create lists and tasks
- [ ] Member can drag and drop tasks
- [ ] Member receives notification when assigned
- [ ] Bell icon shows unread count
- [ ] Toast popup appears on assignment
- [ ] Changes sync in real-time between users
- [ ] Activity log updates for all users
- [ ] Both users see same data

---

## 🐛 Troubleshooting

### "Member can't see the board"
- ✅ Did you run `ENABLE_MEMBER_ACCESS.sql`?
- ✅ Did you add the member via "MEMBERS" button?
- ✅ Try refreshing the page

### "No notification received"
- ✅ Is the member logged in?
- ✅ Check browser console for errors
- ✅ Make sure WebSocket connection is active

### "Real-time not working"
- ✅ Check internet connection
- ✅ Look for green "ACTIVE" indicator
- ✅ Try refreshing both browser windows

### "Can't assign tasks"
- ✅ Make sure user is added as board member first
- ✅ Check if you're the board owner or member
- ✅ Verify RLS policies were updated

---

## 📊 Summary

**What Changed**:

1. ✅ **RLS Policies Updated**: Members can now access boards
2. ✅ **Notifications Added**: Real-time task assignment alerts
3. ✅ **Board Members UI**: Easy member management
4. ✅ **Real-Time Sync**: All changes sync instantly

**New Components**:
- `Notifications.tsx` - Bell icon with real-time alerts
- `BoardMembers.tsx` - Member management dialog
- `ENABLE_MEMBER_ACCESS.sql` - Database policy updates

**Result**:
- Full team collaboration
- Real-time notifications
- Instant synchronization
- Professional UX

---

**Your TaskFlow is now a complete real-time collaboration platform!** 🎉
