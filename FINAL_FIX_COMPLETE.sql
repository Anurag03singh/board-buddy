-- ============================================
-- FINAL FIX: Enable Full Collaboration
-- ============================================
-- This fixes profiles access and board member visibility

-- Step 1: Fix profiles policies (for member search)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);  -- All authenticated users can see all profiles

-- Step 2: Update boards policy to include members
DROP POLICY IF EXISTS "boards_select_owner" ON public.boards;

CREATE POLICY "boards_select_owner_and_members"
  ON public.boards FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.board_members
      WHERE board_id = boards.id
      AND user_id = auth.uid()
    )
  );

-- Step 3: Verify all other policies are correct
-- (They should be from CLEAN_AND_FIX.sql)

-- Success!
SELECT 'Complete! Members can now see boards and profiles.' as status;
