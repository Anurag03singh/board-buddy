-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================
-- Run this in Supabase SQL Editor
-- This removes circular references in policies

-- Step 1: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Board visible to owner and members" ON public.boards;
DROP POLICY IF EXISTS "Board visible to owner" ON public.boards;
DROP POLICY IF EXISTS "Owner can insert boards" ON public.boards;
DROP POLICY IF EXISTS "Owner can update boards" ON public.boards;
DROP POLICY IF EXISTS "Owner can delete boards" ON public.boards;

DROP POLICY IF EXISTS "Board members visible to participants" ON public.board_members;
DROP POLICY IF EXISTS "Board members visible to board participants" ON public.board_members;
DROP POLICY IF EXISTS "Board owner can manage members" ON public.board_members;
DROP POLICY IF EXISTS "Board owner can remove members" ON public.board_members;

DROP POLICY IF EXISTS "Lists visible to board owner" ON public.lists;
DROP POLICY IF EXISTS "Lists visible to board participants" ON public.lists;
DROP POLICY IF EXISTS "Board owner can insert lists" ON public.lists;
DROP POLICY IF EXISTS "Board participants can insert lists" ON public.lists;
DROP POLICY IF EXISTS "Board owner can update lists" ON public.lists;
DROP POLICY IF EXISTS "Board participants can update lists" ON public.lists;
DROP POLICY IF EXISTS "Board owner can delete lists" ON public.lists;
DROP POLICY IF EXISTS "Board participants can delete lists" ON public.lists;

DROP POLICY IF EXISTS "Tasks visible to board owner" ON public.tasks;
DROP POLICY IF EXISTS "Tasks visible to board participants" ON public.tasks;
DROP POLICY IF EXISTS "Board owner can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Board participants can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Board owner can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Board participants can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Board owner can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Board participants can delete tasks" ON public.tasks;

DROP POLICY IF EXISTS "Task assignments visible to board owner" ON public.task_assignments;
DROP POLICY IF EXISTS "Task assignments visible to board participants" ON public.task_assignments;
DROP POLICY IF EXISTS "Board owner can assign tasks" ON public.task_assignments;
DROP POLICY IF EXISTS "Board participants can assign tasks" ON public.task_assignments;
DROP POLICY IF EXISTS "Board owner can unassign tasks" ON public.task_assignments;
DROP POLICY IF EXISTS "Board participants can unassign tasks" ON public.task_assignments;

DROP POLICY IF EXISTS "Activity visible to board owner" ON public.activity_log;
DROP POLICY IF EXISTS "Activity visible to board participants" ON public.activity_log;

-- Step 2: Create SIMPLE policies without recursion

-- BOARDS: Simple owner-only access (no member check to avoid recursion)
CREATE POLICY "boards_select_owner"
  ON public.boards FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "boards_insert_owner"
  ON public.boards FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "boards_update_owner"
  ON public.boards FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "boards_delete_owner"
  ON public.boards FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- BOARD_MEMBERS: Simple policies
CREATE POLICY "board_members_select"
  ON public.board_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND owner_id = auth.uid())
  );

CREATE POLICY "board_members_insert"
  ON public.board_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND owner_id = auth.uid())
  );

CREATE POLICY "board_members_delete"
  ON public.board_members FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND owner_id = auth.uid()) OR
    user_id = auth.uid()
  );

-- LISTS: Check board ownership OR membership directly
CREATE POLICY "lists_select"
  ON public.lists FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "lists_insert"
  ON public.lists FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "lists_update"
  ON public.lists FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "lists_delete"
  ON public.lists FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

-- TASKS: Same pattern as lists
CREATE POLICY "tasks_select"
  ON public.tasks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "tasks_insert"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "tasks_update"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "tasks_delete"
  ON public.tasks FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

-- TASK_ASSIGNMENTS: Check via tasks and boards
CREATE POLICY "task_assignments_select"
  ON public.task_assignments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.boards b ON t.board_id = b.id
      WHERE t.id = task_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "task_assignments_insert"
  ON public.task_assignments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.boards b ON t.board_id = b.id
      WHERE t.id = task_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "task_assignments_delete"
  ON public.task_assignments FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.boards b ON t.board_id = b.id
      WHERE t.id = task_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

-- ACTIVITY_LOG: Same pattern
CREATE POLICY "activity_log_select"
  ON public.activity_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.board_members bm
          WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "activity_log_insert"
  ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Success message
SELECT 'Infinite recursion fixed! All policies updated.' as status;
