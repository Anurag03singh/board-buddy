# Setup Demo User - Step by Step Guide

## Option 1: Create Demo User via Supabase Dashboard (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com
2. Sign in to your account
3. Select your project: `wnlmuaoekxmeatkffoyu`

### Step 2: Create Demo User
1. Click on **Authentication** in the left sidebar
2. Click on **Users** tab
3. Click **Add User** button
4. Fill in the form:
   - **Email**: `demo@taskflow.com`
   - **Password**: `demo123456`
   - **Auto Confirm User**: ✅ Check this box (important!)
5. Click **Create User**

### Step 3: Verify User Creation
1. You should see the new user in the users list
2. Note the **UUID** (user ID) - you'll need this for the next step
3. The user should have a green "Confirmed" badge

### Step 4: Create Demo Profile (Optional)
The profile should be created automatically via trigger, but if not:

1. Go to **Table Editor** in the left sidebar
2. Select **profiles** table
3. Click **Insert** → **Insert row**
4. Fill in:
   - **id**: (same UUID from step 3)
   - **user_id**: (same UUID from step 3)
   - **email**: `demo@taskflow.com`
   - **display_name**: `Demo User`
5. Click **Save**

---

## Option 2: Create Demo User via Application

### Step 1: Use the Signup Form
1. Open your application: `http://localhost:5173`
2. Click **"Create account"**
3. Fill in:
   - **Display Name**: `Demo User`
   - **Email**: `demo@taskflow.com`
   - **Password**: `demo123456`
4. Click **"INITIALIZE"**

### Step 2: Confirm Email (if required)
1. Check the email inbox for `demo@taskflow.com`
2. Click the confirmation link
3. Or, disable email confirmation in Supabase:
   - Go to **Authentication** → **Settings**
   - Under **Email Auth**, uncheck **Enable email confirmations**
   - Click **Save**

---

## Option 3: Disable Email Confirmation (Easiest for Testing)

### Step 1: Disable Email Confirmation
1. Go to Supabase Dashboard
2. Click **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. **Uncheck** "Enable email confirmations"
5. Click **Save**

### Step 2: Create User via Signup
1. Open your app: `http://localhost:5173`
2. Click **"Create account"**
3. Fill in any credentials:
   - Email: `demo@taskflow.com`
   - Password: `demo123456`
   - Display Name: `Demo User`
4. Click **"INITIALIZE"**
5. User is created and logged in immediately!

---

## Troubleshooting

### "Invalid login credentials"
- **Cause**: User doesn't exist or password is wrong
- **Solution**: Create the user via Supabase Dashboard (Option 1)

### "Email not confirmed"
- **Cause**: Email confirmation is enabled
- **Solution**: 
  - Confirm email via link, OR
  - Disable email confirmation (Option 3)

### "User already registered"
- **Cause**: User already exists
- **Solution**: Try logging in instead of signing up

### Profile not created
- **Cause**: Trigger might not have fired
- **Solution**: Manually create profile (Step 4 in Option 1)

---

## Verify Demo User Works

### Test Login:
1. Go to `http://localhost:5173/auth`
2. Enter:
   - Email: `demo@taskflow.com`
   - Password: `demo123456`
3. Click **"AUTHENTICATE"**
4. Should redirect to `/boards` page

### Expected Result:
- ✅ Login successful
- ✅ Redirected to boards page
- ✅ Can create boards
- ✅ Can create tasks
- ✅ Real-time updates work

---

## Quick SQL to Check User Exists

Run this in Supabase SQL Editor:

```sql
-- Check if demo user exists in auth
SELECT id, email, confirmed_at, created_at 
FROM auth.users 
WHERE email = 'demo@taskflow.com';

-- Check if profile exists
SELECT * 
FROM public.profiles 
WHERE email = 'demo@taskflow.com';
```

If the first query returns nothing, the user doesn't exist yet.

---

## Recommended Approach

**For Development/Testing:**
1. Disable email confirmation (Option 3)
2. Create user via signup form
3. Start using immediately

**For Production/Demo:**
1. Create user via Supabase Dashboard (Option 1)
2. Auto-confirm the user
3. Share credentials with reviewers

---

## Current Demo Credentials

```
Email: demo@taskflow.com
Password: demo123456
```

These credentials are documented in:
- README.md
- QUICK_START_GUIDE.md
- SUBMISSION_CHECKLIST.md
