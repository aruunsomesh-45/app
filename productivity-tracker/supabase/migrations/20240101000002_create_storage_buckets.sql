-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('book-covers', 'book-covers', true),
  ('workout-media', 'workout-media', false),
  ('note-attachments', 'note-attachments', false)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Policy: Avatars (Public Read, Auth Insert/Update/Delete)
create policy "Avatar Public Read"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Avatar Auth Insert"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Avatar Auth Update"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Avatar Auth Delete"
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Policy: Book Covers (Public Read, Auth Insert/Update/Delete)
create policy "BookCovers Public Read"
  on storage.objects for select
  using ( bucket_id = 'book-covers' );

create policy "BookCovers Auth Insert"
  on storage.objects for insert
  with check ( bucket_id = 'book-covers' and auth.role() = 'authenticated' );

create policy "BookCovers Auth Update"
  on storage.objects for update
  using ( bucket_id = 'book-covers' and auth.role() = 'authenticated' );

create policy "BookCovers Auth Delete"
  on storage.objects for delete
  using ( bucket_id = 'book-covers' and auth.role() = 'authenticated' );

-- Policy: Workout Media (Auth Read/Insert/Update/Delete - Private)
create policy "WorkoutMedia Auth Read"
  on storage.objects for select
  using ( bucket_id = 'workout-media' and auth.role() = 'authenticated' );

create policy "WorkoutMedia Auth Insert"
  on storage.objects for insert
  with check ( bucket_id = 'workout-media' and auth.role() = 'authenticated' );

create policy "WorkoutMedia Auth Update"
  on storage.objects for update
  using ( bucket_id = 'workout-media' and auth.role() = 'authenticated' );

create policy "WorkoutMedia Auth Delete"
  on storage.objects for delete
  using ( bucket_id = 'workout-media' and auth.role() = 'authenticated' );

-- Policy: Note Attachments (Auth Read/Insert/Update/Delete - Private)
create policy "NoteAttachments Auth Read"
  on storage.objects for select
  using ( bucket_id = 'note-attachments' and auth.role() = 'authenticated' );

create policy "NoteAttachments Auth Insert"
  on storage.objects for insert
  with check ( bucket_id = 'note-attachments' and auth.role() = 'authenticated' );

create policy "NoteAttachments Auth Update"
  on storage.objects for update
  using ( bucket_id = 'note-attachments' and auth.role() = 'authenticated' );

create policy "NoteAttachments Auth Delete"
  on storage.objects for delete
  using ( bucket_id = 'note-attachments' and auth.role() = 'authenticated' );
