-- ============================================
-- ULTIMATE FIX: No Recursion At All
-- ============================================
-- Strategy: Keep boards simple, handle member access in application layer

-- Step 1: Drop the problematic boards policy
DROP POLICY IF EXISTS "boards_select_owner_and_members" ON public.boards;
DROP POLICY IF EXISTS "boards_select_owner" ON public.boards;

-- Step 2: Create SIMPLE boards policy (owner only, no member check)
-- Members will access boards through a database function instead
CREATE POLICY "boards_owner_only"
  ON public.boards FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

-- Step 3: Create a function to get boards including member access
CREATE OR REPLACE FUNCTION get_accessible_boards()
RETURNS SETOF public.boards
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT DISTINCT b.*
  FROM boards b
  LEFT JOIN board_members bm ON b.id = bm.board_id
  WHERE b.owner_id = auth.uid()
     OR bm.user_id = auth.uid();
$$;

-- Step 4: Fix profiles policy (for member search)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;

CREATE POLICY "profiles_viewable"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- Step 5: Ensure board_members policy is simple
DROP POLICY IF EXISTS "board_members_select" ON public.board_members;

CREATE POLICY "board_members_view"
  ON public.board_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND owner_id = auth.uid())
  );

-- Success!
SELECT 'Fixed! Use get_accessible_boards() function to fetch boards with member access.' as status;
