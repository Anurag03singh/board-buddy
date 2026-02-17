-- ============================================
-- Enable Board Members to See and Collaborate
-- ============================================
-- Run this in Supabase SQL Editor
-- This allows members to see boards they're added to

-- Step 1: Update Board visibility policy
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

-- Step 2: Update Lists policies for members
DROP POLICY IF EXISTS "Lists visible to board owner" ON public.lists;
DROP POLICY IF EXISTS "Board owner can insert lists" ON public.lists;
DROP POLICY IF EXISTS "Board owner can update lists" ON public.lists;
DROP POLICY IF EXISTS "Board owner can delete lists" ON public.lists;

CREATE POLICY "Lists visible to board participants"
  ON public.lists FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Board participants can insert lists"
  ON public.lists FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Board participants can update lists"
  ON public.lists FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Board participants can delete lists"
  ON public.lists FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
      )
    )
  );

-- Step 3: Update Tasks policies for members
DROP POLICY IF EXISTS "Tasks visible to board owner" ON public.tasks;
DROP POLICY IF EXISTS "Board owner can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Board owner can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Board owner can delete tasks" ON public.tasks;

CREATE POLICY "Tasks visible to board participants"
  ON public.tasks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Board participants can insert tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Board participants can update tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Board participants can delete tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
      )
    )
  );

-- Step 4: Update Task Assignments policies
DROP POLICY IF EXISTS "Task assignments visible to board owner" ON public.task_assignments;
DROP POLICY IF EXISTS "Board owner can assign tasks" ON public.task_assignments;
DROP POLICY IF EXISTS "Board owner can unassign tasks" ON public.task_assignments;

CREATE POLICY "Task assignments visible to board participants"
  ON public.task_assignments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.boards b ON t.board_id = b.id 
      WHERE t.id = task_id 
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = b.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Board participants can assign tasks"
  ON public.task_assignments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.boards b ON t.board_id = b.id 
      WHERE t.id = task_id 
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = b.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Board participants can unassign tasks"
  ON public.task_assignments FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.boards b ON t.board_id = b.id 
      WHERE t.id = task_id 
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = b.id AND user_id = auth.uid())
      )
    )
  );

-- Step 5: Update Activity Log policies
DROP POLICY IF EXISTS "Activity visible to board owner" ON public.activity_log;

CREATE POLICY "Activity visible to board participants"
  ON public.activity_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
      )
    )
  );

-- Success message
SELECT 'Member access enabled! Board members can now see and collaborate on boards.' as status;
