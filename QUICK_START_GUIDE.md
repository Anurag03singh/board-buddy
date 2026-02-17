# TaskFlow - Quick Start Guide

## 🚀 Getting Started (Step-by-Step)

### Step 1: Access the Application
Open your browser and go to: **http://localhost:8080/**

### Step 2: Create an Account

1. You'll see the **SYSTEM ACCESS** page
2. Click **"Create account"** at the bottom
3. Fill in:
   - **Display Name**: Your Name
   - **Email Address**: your@email.com
   - **Password**: minimum 6 characters
4. Click **"INITIALIZE"**
5. Check your email for verification (or skip if using test mode)

### Step 3: Sign In

1. If you created an account, click **"Sign in"** 
2. Enter your email and password
3. Click **"AUTHENTICATE"**
4. You'll be redirected to the Boards page

### Step 4: Create Your First Board

1. On the Boards page, click **"NEW BOARD"** button (top right)
2. Fill in the dialog:
   - **Board Title**: e.g., "My Project"
   - **Description**: e.g., "Project management board"
   - **Accent Color**: Choose a color
3. Click **"INITIALIZE BOARD"**
4. Your board will appear in the grid!

### Step 5: Open a Board

1. Click on any board card
2. You'll see the Kanban board view

### Step 6: Create Lists

1. Click **"Add list"** on the right
2. Enter a list name (e.g., "To Do", "In Progress", "Done")
3. Click **"Add"**

### Step 7: Create Tasks

1. Click the **"+"** icon in any list header
2. Fill in task details:
   - Title
   - Description
   - Priority
   - Due Date
3. Click **"Create"**

### Step 8: Drag & Drop

1. Hover over a task card
2. Click and drag the grip icon (⋮⋮)
3. Drop it in another list
4. Watch real-time updates!

### Step 9: Assign Users (Optional)

1. Click on a task to open it
2. In the dialog, find **"Assigned To"** section
3. Click **"Assign"** to add team members
4. Select users from the dropdown

### Step 10: View Activity

1. Click **"Activity"** button in the board header
2. See real-time activity log
3. All actions are tracked!

---

## 🐛 Troubleshooting

### "Create Board not working"

**Possible causes:**

1. **Not logged in**
   - Solution: Make sure you're signed in first
   - Check if you see your email in the top navigation

2. **Database connection issue**
   - Solution: Check browser console (F12) for errors
   - Verify .env file has correct Supabase credentials

3. **Form validation**
   - Solution: Make sure "Board Title" is filled in
   - Title cannot be empty

4. **RLS Policy issue**
   - Solution: Make sure you're authenticated
   - Try signing out and back in

### "Can't see boards"

- Make sure you created at least one board
- Check if you're logged in with the correct account
- Try refreshing the page

### "Real-time not working"

- Check your internet connection
- Look for the green "ACTIVE" indicator in the nav
- Try refreshing the page

---

## 🧪 Test the Full Flow

### Quick Test Script:

```bash
# 1. Open app
http://localhost:8080/

# 2. Sign up
Email: test@example.com
Password: test123456
Name: Test User

# 3. Create board
Title: Test Board
Description: Testing the flow
Color: Any

# 4. Open board
Click on "Test Board"

# 5. Create lists
- "To Do"
- "In Progress"  
- "Done"

# 6. Create tasks
In "To Do":
- Task 1: "Setup project"
- Task 2: "Write code"

# 7. Drag task
Drag "Setup project" to "In Progress"

# 8. Check activity
Click "Activity" button - see the move logged!
```

---

## ✅ Expected Behavior

### After Sign Up:
- ✅ Redirected to Boards page
- ✅ See empty state: "NO BOARDS FOUND"
- ✅ See "NEW BOARD" button

### After Creating Board:
- ✅ Dialog closes
- ✅ Board appears in grid
- ✅ Can click to open board

### After Opening Board:
- ✅ See board title with color accent
- ✅ See "Add list" button
- ✅ See "Activity" button

### After Creating List:
- ✅ List appears immediately
- ✅ Can add tasks to list
- ✅ Can delete list

### After Creating Task:
- ✅ Task appears in list
- ✅ Can drag to other lists
- ✅ Can click to edit
- ✅ Activity logged

### Real-time Features:
- ✅ Open same board in 2 tabs
- ✅ Create task in tab 1
- ✅ See it appear in tab 2 instantly!

---

## 📞 Still Having Issues?

1. **Check browser console** (F12 → Console tab)
2. **Look for error messages** in red
3. **Check network tab** for failed requests
4. **Verify database connection** (see earlier test results)

### Common Error Messages:

- **"Invalid credentials"** → Wrong email/password
- **"Email not confirmed"** → Check your email
- **"Row Level Security"** → Not authenticated properly
- **"Network error"** → Check internet connection

---

## 🎯 Success Indicators

You'll know everything is working when:

- ✅ Green "ACTIVE" indicator in navigation
- ✅ Your email shows in top bar
- ✅ Boards appear after creation
- ✅ Tasks can be dragged
- ✅ Activity log updates
- ✅ Changes appear in other tabs instantly

---

**Need help?** Check the browser console for specific error messages!
