-- ============================================
-- CLEAN ALL POLICIES AND START FRESH
-- ============================================
-- This drops EVERYTHING and recreates clean policies

-- Step 1: Drop ALL policies (including any we might have created)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on boards
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'boards' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.boards';
    END LOOP;
    
    -- Drop all policies on board_members
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'board_members' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.board_members';
    END LOOP;
    
    -- Drop all policies on lists
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'lists' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.lists';
    END LOOP;
    
    -- Drop all policies on tasks
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'tasks' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.tasks';
    END LOOP;
    
    -- Drop all policies on task_assignments
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'task_assignments' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.task_assignments';
    END LOOP;
    
    -- Drop all policies on activity_log
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'activity_log' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.activity_log';
    END LOOP;
END $$;

-- Step 2: Create clean, simple policies

-- BOARDS: Owner only (no recursion)
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

-- BOARD_MEMBERS: Simple, no recursion
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

-- LISTS: Check owner OR member (no recursion)
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

-- TASKS: Same pattern
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

-- TASK_ASSIGNMENTS
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

-- ACTIVITY_LOG
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

-- Success!
SELECT 'All policies cleaned and recreated successfully!' as status;
