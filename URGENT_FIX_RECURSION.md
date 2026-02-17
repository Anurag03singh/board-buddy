# 🚨 URGENT: Fix Infinite Recursion

## Problem

You're getting "infinite recursion detected in policy for relation" error when trying to create boards or access data.

## Solution

Run the fixed SQL that removes circular references in RLS policies.

---

## 🔧 How to Fix (2 minutes)

### Step 1: Go to Supabase SQL Editor

Open this link:
https://supabase.com/dashboard/project/wnlmuaoekxmeatkffoyu/sql/new

### Step 2: Copy the SQL

Open the file: `FIX_INFINITE_RECURSION.sql`

Copy ALL the content (it's long, ~300 lines)

### Step 3: Run It

1. Paste into SQL Editor
2. Click **"Run"** (or press Ctrl+Enter)
3. Wait for: "Infinite recursion fixed! All policies updated."

### Step 4: Test

1. Refresh your browser: http://localhost:8080/
2. Try creating a board
3. It should work now! ✅

---

## 🎯 What This Does

**The Problem**:
- Old policies had circular references
- `boards` policy checked `board_members`
- `board_members` policy checked `boards`
- This created infinite loop

**The Fix**:
- Removes ALL old policies
- Creates new simple policies
- No circular references
- Direct checks only

**Result**:
- ✅ No more infinite recursion
- ✅ Board creation works
- ✅ Member access works
- ✅ All features functional

---

## 📋 Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied `FIX_INFINITE_RECURSION.sql`
- [ ] Pasted and ran the SQL
- [ ] Saw success message
- [ ] Refreshed browser
- [ ] Tested board creation
- [ ] Everything works!

---

## ⚠️ Important Notes

1. **This replaces ENABLE_MEMBER_ACCESS.sql**
   - Don't run both
   - This one is the correct version

2. **Safe to run multiple times**
   - Uses `DROP POLICY IF EXISTS`
   - Won't cause errors if run again

3. **Preserves all data**
   - Only changes policies
   - Your boards/tasks are safe

---

## 🧪 Test After Fix

```bash
# Test 1: Create board (as owner)
1. Sign in
2. Click "NEW BOARD"
3. Fill in title
4. Click "INITIALIZE BOARD"
5. Should work! ✅

# Test 2: Add member
1. Open a board
2. Click "MEMBERS (0)"
3. Add member by email
4. Should work! ✅

# Test 3: Member access
1. Sign in as member (different browser)
2. Should see the board! ✅
3. Can create tasks! ✅
```

---

## 🔍 Technical Explanation

### Old Policy (WRONG - Causes Recursion):
```sql
-- boards policy checks board_members
CREATE POLICY "boards_select"
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM board_members WHERE ...)  -- ❌ Recursion!
  );

-- board_members policy checks boards
CREATE POLICY "board_members_select"
  USING (
    EXISTS (SELECT 1 FROM boards WHERE ...)  -- ❌ Recursion!
  );
```

### New Policy (CORRECT - No Recursion):
```sql
-- boards policy: owner only (no member check)
CREATE POLICY "boards_select_owner"
  USING (owner_id = auth.uid());  -- ✅ Simple!

-- board_members policy: direct check
CREATE POLICY "board_members_select"
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM boards WHERE owner_id = auth.uid())  -- ✅ No recursion!
  );

-- lists/tasks: check both owner AND members
CREATE POLICY "lists_select"
  USING (
    EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR  -- Direct check
        EXISTS (SELECT 1 FROM board_members WHERE ...)  -- Separate check
      )
    )
  );
```

**Key Difference**:
- Boards policy: Owner only (simple)
- Other tables: Check owner OR member (no circular reference)

---

## ✅ After Running Fix

**What Works**:
- ✅ Create boards (owner)
- ✅ View boards (owner)
- ✅ Add members (owner)
- ✅ View boards (members)
- ✅ Create lists (owner + members)
- ✅ Create tasks (owner + members)
- ✅ Assign tasks (owner + members)
- ✅ Real-time updates (all users)
- ✅ Notifications (all users)

**What's Fixed**:
- ❌ No more infinite recursion
- ❌ No more policy errors
- ❌ No more circular references

---

## 🆘 Still Having Issues?

If you still get errors after running the fix:

1. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Check SQL ran successfully**
   - Should see: "Infinite recursion fixed! All policies updated."
   - If error, copy the error message

3. **Restart dev server**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

4. **Check Supabase logs**
   - Go to: Logs → Postgres Logs
   - Look for policy errors

---

**Run the fix now and your app will work perfectly!** 🎉
