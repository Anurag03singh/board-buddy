# How to Add Members and Assign Tasks

## 🎯 Complete Flow: From New User to Task Assignment

### Step 1: Create Multiple User Accounts

To test the member/assignment feature, you need multiple users:

1. **User 1 (Board Owner)**:
   - Email: owner@example.com
   - Password: password123
   - This user will create the board

2. **User 2 (Team Member)**:
   - Open a new **incognito/private browser window**
   - Go to: http://localhost:8080/
   - Sign up with: member@example.com / password123
   - **Important**: Just sign up, then close this window

3. **User 3 (Another Member)** (Optional):
   - Repeat step 2 with: member2@example.com

### Step 2: Add Members to Board (as Owner)

1. **Sign in as owner@example.com**
2. **Create or open a board**
3. **Click "MEMBERS (0)"** button in the board header
4. **In the dialog**:
   - Enter: `member@example.com`
   - Click the **"+"** button
   - You'll see: "Added member@example.com to the board"
5. **Repeat** for any other members

### Step 3: Assign Members to Tasks

1. **Click on any task** (or create a new one)
2. **In the task dialog**, scroll to **"Assigned To"** section
3. **Click "Assign"** button
4. **Select from dropdown**:
   - You'll now see `member@example.com` in the list!
   - Click on their name to assign them
5. **Done!** The member is now assigned to the task

### Step 4: Test Real-Time (Optional)

1. **Keep owner logged in** in one browser
2. **Open incognito window** and sign in as `member@example.com`
3. **Both users** can now see the same board (if you update RLS policies)
4. **Changes sync in real-time!**

---

## 🔧 Current System Design

### How It Works:

```
1. User signs up → Profile created
2. Board owner adds user by email → board_members table
3. Task assignment shows all board members
4. Assign member to task → task_assignments table
```

### Database Tables:

- **profiles**: All registered users
- **boards**: Project boards (owner_id)
- **board_members**: Who has access to which board
- **tasks**: Individual tasks
- **task_assignments**: Which users are assigned to which tasks

---

## 🎨 UI Features Added:

### BoardMembers Component:
- **Location**: Board header (next to Activity button)
- **Shows**: Current member count
- **Features**:
  - Add members by email
  - View all members
  - Remove members (owner only)
  - Shows member avatars with initials

### TaskAssignments Component:
- **Location**: Inside task dialog
- **Shows**: Assigned users with avatars
- **Features**:
  - Assign board members to tasks
  - Unassign users
  - Visual avatar display
  - Shows member names/emails

---

## 📝 Quick Test Script:

```bash
# Terminal 1: Keep server running
npm run dev

# Browser 1: Owner
1. Go to http://localhost:8080/
2. Sign up: owner@example.com / password123
3. Create board: "Team Project"
4. Create list: "To Do"
5. Create task: "Setup database"

# Browser 2 (Incognito): Member
1. Go to http://localhost:8080/
2. Sign up: member@example.com / password123
3. Close window (just need the account)

# Back to Browser 1: Add member
1. Open "Team Project" board
2. Click "MEMBERS (0)"
3. Enter: member@example.com
4. Click "+"
5. See: "Added member@example.com to the board"

# Assign to task
1. Click on "Setup database" task
2. Scroll to "Assigned To"
3. Click "Assign"
4. Select "member@example.com"
5. Done! Member is assigned
```

---

## ⚠️ Important Notes:

### Current RLS Limitation:

The current RLS policies only allow **board owners** to see their boards. This means:

- ✅ Owner can add members
- ✅ Owner can assign members to tasks
- ❌ Members can't see the board yet (need to update RLS)

### To Allow Members to See Boards:

Run this SQL in Supabase:

```sql
-- Allow board members to see boards they're added to
DROP POLICY IF EXISTS "Board visible to owner" ON public.boards;

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

After running this, members can:
- ✅ See boards they're added to
- ✅ View and edit tasks
- ✅ See real-time updates

---

## 🎯 Summary:

**To add a "random new member" to a task:**

1. **They must have an account** (sign up first)
2. **Board owner adds them** via "MEMBERS" button
3. **Then they appear** in task assignment dropdown
4. **Owner assigns them** to specific tasks

This is the proper way to handle team collaboration with proper access control!
