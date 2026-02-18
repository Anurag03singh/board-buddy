-- Create Demo User Account
-- Run this in your Supabase SQL Editor

-- Note: You need to create the user through Supabase Auth API or Dashboard
-- This SQL is for reference - actual user creation should be done via:
-- 1. Supabase Dashboard > Authentication > Users > Add User
-- 2. Or use the signup form in your app

-- Demo User Details:
-- Email: demo@taskflow.com
-- Password: demo123456

-- After creating the user via Supabase Dashboard, run this to set up the profile:

-- Insert demo user profile (replace USER_ID with actual UUID from auth.users)
INSERT INTO public.profiles (id, user_id, email, display_name, avatar_url, created_at, updated_at)
VALUES (
  'REPLACE_WITH_USER_UUID',  -- Get this from auth.users table
  'REPLACE_WITH_USER_UUID',  -- Same UUID
  'demo@taskflow.com',
  'Demo User',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create a sample board for demo user
INSERT INTO public.boards (title, description, owner_id, color, created_at, updated_at)
VALUES (
  'Demo Project Board',
  'Welcome to TaskFlow! This is a sample board to get you started.',
  'REPLACE_WITH_USER_UUID',
  '#14b8a6',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Get the board ID and create sample lists
WITH demo_board AS (
  SELECT id FROM public.boards WHERE owner_id = 'REPLACE_WITH_USER_UUID' LIMIT 1
)
INSERT INTO public.lists (board_id, title, position, created_at, updated_at)
SELECT 
  demo_board.id,
  list_title,
  list_position,
  NOW(),
  NOW()
FROM demo_board,
LATERAL (VALUES 
  ('To Do', 0),
  ('In Progress', 1),
  ('Done', 2)
) AS lists(list_title, list_position)
ON CONFLICT DO NOTHING;

-- Create sample tasks
WITH demo_board AS (
  SELECT id FROM public.boards WHERE owner_id = 'REPLACE_WITH_USER_UUID' LIMIT 1
),
demo_lists AS (
  SELECT id, title FROM public.lists WHERE board_id = (SELECT id FROM demo_board)
)
INSERT INTO public.tasks (
  board_id, 
  list_id, 
  title, 
  description, 
  priority, 
  position, 
  created_by,
  created_at, 
  updated_at
)
SELECT 
  demo_board.id,
  demo_lists.id,
  task_title,
  task_desc,
  task_priority,
  task_position,
  'REPLACE_WITH_USER_UUID',
  NOW(),
  NOW()
FROM demo_board, demo_lists,
LATERAL (VALUES 
  ('Welcome to TaskFlow!', 'This is your first task. Click to edit or drag to move.', 'medium', 0),
  ('Create your first board', 'Click "NEW BOARD" to create your own project board.', 'high', 1),
  ('Invite team members', 'Add collaborators to work together in real-time.', 'low', 2)
) AS tasks(task_title, task_desc, task_priority, task_position)
WHERE demo_lists.title = 'To Do'
ON CONFLICT DO NOTHING;

-- Verify the demo user setup
SELECT 
  'Demo user profile' as check_type,
  COUNT(*) as count 
FROM public.profiles 
WHERE email = 'demo@taskflow.com'
UNION ALL
SELECT 
  'Demo boards' as check_type,
  COUNT(*) as count 
FROM public.boards 
WHERE owner_id = 'REPLACE_WITH_USER_UUID'
UNION ALL
SELECT 
  'Demo lists' as check_type,
  COUNT(*) as count 
FROM public.lists 
WHERE board_id IN (SELECT id FROM public.boards WHERE owner_id = 'REPLACE_WITH_USER_UUID')
UNION ALL
SELECT 
  'Demo tasks' as check_type,
  COUNT(*) as count 
FROM public.tasks 
WHERE board_id IN (SELECT id FROM public.boards WHERE owner_id = 'REPLACE_WITH_USER_UUID');
