
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Boards table
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  color TEXT DEFAULT '#14b8a6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Board members table
CREATE TABLE public.board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(board_id, user_id)
);

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

-- Board policies: owner + members can see/edit
CREATE POLICY "Board visible to owner and members"
  ON public.boards FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
  );

CREATE POLICY "Owner can insert boards"
  ON public.boards FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can update boards"
  ON public.boards FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete boards"
  ON public.boards FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Board members policies
CREATE POLICY "Board members visible to board participants"
  ON public.board_members FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members bm WHERE bm.board_id = board_members.board_id AND bm.user_id = auth.uid())))
  );

CREATE POLICY "Board owner can manage members"
  ON public.board_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND owner_id = auth.uid())
  );

CREATE POLICY "Board owner can remove members"
  ON public.board_members FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND owner_id = auth.uid()) OR user_id = auth.uid()
  );

-- Lists table
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lists visible to board participants"
  ON public.lists FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = lists.board_id AND board_members.user_id = auth.uid())))
  );

CREATE POLICY "Board participants can insert lists"
  ON public.lists FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = lists.board_id AND board_members.user_id = auth.uid())))
  );

CREATE POLICY "Board participants can update lists"
  ON public.lists FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = lists.board_id AND board_members.user_id = auth.uid())))
  );

CREATE POLICY "Board participants can delete lists"
  ON public.lists FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = lists.board_id AND board_members.user_id = auth.uid())))
  );

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks visible to board participants"
  ON public.tasks FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = tasks.board_id AND board_members.user_id = auth.uid())))
  );

CREATE POLICY "Board participants can insert tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = tasks.board_id AND board_members.user_id = auth.uid())))
  );

CREATE POLICY "Board participants can update tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = tasks.board_id AND board_members.user_id = auth.uid())))
  );

CREATE POLICY "Board participants can delete tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = tasks.board_id AND board_members.user_id = auth.uid())))
  );

-- Task assignments
CREATE TABLE public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task assignments visible to board participants"
  ON public.task_assignments FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tasks t JOIN public.boards b ON t.board_id = b.id WHERE t.id = task_id AND (b.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = b.id AND board_members.user_id = auth.uid())))
  );

CREATE POLICY "Board participants can assign tasks"
  ON public.task_assignments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks t JOIN public.boards b ON t.board_id = b.id WHERE t.id = task_id AND (b.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = b.id AND board_members.user_id = auth.uid())))
  );

CREATE POLICY "Board participants can unassign tasks"
  ON public.task_assignments FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tasks t JOIN public.boards b ON t.board_id = b.id WHERE t.id = task_id AND (b.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = b.id AND board_members.user_id = auth.uid())))
  );

-- Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_title TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity visible to board participants"
  ON public.activity_log FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.board_members WHERE board_members.board_id = activity_log.board_id AND board_members.user_id = auth.uid())))
  );

CREATE POLICY "Authenticated users can insert activity"
  ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON public.boards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON public.lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;

-- Indexes
CREATE INDEX idx_board_members_user ON public.board_members(user_id);
CREATE INDEX idx_board_members_board ON public.board_members(board_id);
CREATE INDEX idx_lists_board ON public.lists(board_id);
CREATE INDEX idx_tasks_list ON public.tasks(list_id);
CREATE INDEX idx_tasks_board ON public.tasks(board_id);
CREATE INDEX idx_task_assignments_task ON public.task_assignments(task_id);
CREATE INDEX idx_activity_log_board ON public.activity_log(board_id);
CREATE INDEX idx_tasks_title ON public.tasks USING gin(to_tsvector('english', title));
