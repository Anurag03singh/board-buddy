-- ============================================
-- Add Role-Based Permissions
-- ============================================
-- Roles: 'owner', 'admin', 'member'
-- Only owner and admin can add members

-- Step 1: Update board_members table to ensure role column exists
-- (It should already exist, but let's make sure)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'board_members' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.board_members 
        ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
    END IF;
END $$;

-- Step 2: Add check constraint for valid roles
ALTER TABLE public.board_members 
DROP CONSTRAINT IF EXISTS board_members_role_check;

ALTER TABLE public.board_members 
ADD CONSTRAINT board_members_role_check 
CHECK (role IN ('owner', 'admin', 'member'));

-- Step 3: Update board_members INSERT policy
-- Only board owner can add members (not other members)
DROP POLICY IF EXISTS "board_members_insert" ON public.board_members;

CREATE POLICY "board_members_insert_owner_only"
  ON public.board_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_id 
      AND owner_id = auth.uid()
    )
  );

-- Step 4: Create a function to check if user can manage members
CREATE OR REPLACE FUNCTION can_manage_board_members(board_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM boards 
    WHERE id = board_uuid 
    AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM board_members
    WHERE board_id = board_uuid
    AND user_id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Success!
SELECT 'Role permissions added! Only owner can add members by default.' as status;
