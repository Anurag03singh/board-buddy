# Role-Based Permissions Guide

## 🔐 New Feature: Role-Based Member Management

Only board owners (and admins they designate) can add or remove members!

---

## 📋 Setup

### Step 1: Run the SQL

1. Go to: https://supabase.com/dashboard/project/wnlmuaoekxmeatkffoyu/sql/new
2. Copy: `ADD_ROLE_PERMISSIONS.sql`
3. Paste and Run
4. See: "Role permissions added!"

### Step 2: Refresh Browser

The UI is already updated!

---

## 👥 Roles Explained

### Owner (Board Creator)
- ✅ Can add members
- ✅ Can remove members
- ✅ Can change member roles
- ✅ Can promote members to admin
- ✅ Full control over board

### Admin (Promoted by Owner)
- ✅ Can add members
- ✅ Can remove members
- ❌ Cannot change roles (owner only)
- ✅ Can manage lists and tasks

### Member (Default Role)
- ❌ Cannot add members
- ❌ Cannot remove members
- ❌ Cannot change roles
- ✅ Can view board
- ✅ Can create/edit lists and tasks
- ✅ Can be assigned to tasks

---

## 🎯 How It Works

### Scenario 1: Owner Adds Member

**User1 (Owner)**:
1. Creates board
2. Clicks "MEMBERS (0)"
3. Adds user2@example.com
4. User2 is added as "member" role ✅

**User2 (Member)**:
1. Can see the board ✅
2. Opens "MEMBERS" dialog
3. Sees yellow notice: "Only the board owner can add or remove members" ⚠️
4. Cannot add other users ❌

### Scenario 2: Owner Promotes to Admin

**User1 (Owner)**:
1. Opens "MEMBERS" dialog
2. Clicks role dropdown next to User2
3. Changes from "member" to "admin"
4. User2 is now admin ✅

**User2 (Admin)**:
1. Opens "MEMBERS" dialog
2. Can now add members! ✅
3. Can remove members ✅
4. Cannot change roles (owner only) ❌

---

## 🎨 UI Changes

### For Owner:
- ✅ "Add New Member" section visible
- ✅ Can remove members (X button)
- ✅ Role dropdown to change member roles
- ✅ Shield icon (🛡️) next to admins

### For Admin:
- ✅ "Add New Member" section visible
- ✅ Can remove members (X button)
- ❌ No role dropdown (can't change roles)
- ✅ Can see who is admin

### For Member:
- ❌ "Add New Member" section hidden
- ⚠️ Yellow notice: "Only the board owner can add or remove members"
- ❌ No remove buttons
- ✅ Can see all members and their roles

---

## 🔧 Technical Implementation

### Database Level:

```sql
-- Only owner can add members
CREATE POLICY "board_members_insert_owner_only"
  ON public.board_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND owner_id = auth.uid()
    )
  );
```

### Application Level:

```typescript
// Check if user can manage members
const canManageMembers = 
  isOwner || 
  (memberRole === 'admin');

// Show/hide add member UI
{canManageMembers && (
  <div>Add Member Form</div>
)}

// Show permission notice
{!canManageMembers && (
  <div>Only owner can add members</div>
)}
```

---

## 🧪 Test Scenarios

### Test 1: Member Cannot Add

```
Browser 1 (Owner):
1. Create board
2. Add member2@example.com

Browser 2 (Member):
1. Sign in as member2
2. Open board
3. Click "MEMBERS"
4. See yellow notice ⚠️
5. No "Add Member" section ❌
6. Try to add someone - blocked! ✅
```

### Test 2: Admin Can Add

```
Browser 1 (Owner):
1. Open "MEMBERS"
2. Change member2 role to "admin"

Browser 2 (Admin):
1. Refresh page
2. Click "MEMBERS"
3. See "Add Member" section! ✅
4. Can add member3@example.com ✅
5. Cannot change roles ❌
```

### Test 3: Owner Has Full Control

```
Browser 1 (Owner):
1. Can add members ✅
2. Can remove members ✅
3. Can change roles ✅
4. Can promote to admin ✅
5. Can demote from admin ✅
```

---

## 📊 Permission Matrix

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| View board | ✅ | ✅ | ✅ |
| Create lists | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Assign tasks | ✅ | ✅ | ✅ |
| Add members | ✅ | ✅ | ❌ |
| Remove members | ✅ | ✅ | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| Delete board | ✅ | ❌ | ❌ |

---

## 🎯 Benefits

### Security:
- ✅ Prevents unauthorized member additions
- ✅ Owner maintains control
- ✅ Clear permission hierarchy

### Flexibility:
- ✅ Owner can delegate to admins
- ✅ Admins can help manage large teams
- ✅ Members focus on work, not management

### User Experience:
- ✅ Clear visual indicators
- ✅ Helpful permission notices
- ✅ Role badges (shield icon for admins)
- ✅ Intuitive role dropdown

---

## 🐛 Troubleshooting

### "I'm a member but can't add users"

**Expected behavior!** Only owners and admins can add members.

**Solution**: Ask the board owner to:
- Add the user for you, OR
- Promote you to admin role

### "I'm an admin but can't change roles"

**Expected behavior!** Only the board owner can change roles.

**Solution**: Ask the board owner to change roles.

### "Permission denied when adding member"

**Possible causes**:
- You're a regular member (not owner/admin)
- Database policy not updated

**Solution**:
1. Check your role in the members list
2. Run `ADD_ROLE_PERMISSIONS.sql` if not done
3. Refresh browser

---

## ✅ Summary

**What Changed**:
1. ✅ Added role-based permissions
2. ✅ Only owner can add members by default
3. ✅ Owner can promote members to admin
4. ✅ Admins can also add/remove members
5. ✅ Clear UI indicators for permissions
6. ✅ Permission notices for restricted users

**Roles**:
- **Owner**: Full control
- **Admin**: Can manage members (promoted by owner)
- **Member**: Cannot manage members (default)

**Your board now has proper access control!** 🎉
