-- Create storage bucket for book PDFs
insert into storage.buckets (id, name, public)
values 
  ('book-pdfs', 'book-pdfs', false)
on conflict (id) do nothing;

-- Policy: Book PDFs (Auth Read/Insert/Update/Delete)
create policy "Book PDFs Auth Access"
  on storage.objects for all
  using ( bucket_id = 'book-pdfs' and auth.role() = 'authenticated' )
  with check ( bucket_id = 'book-pdfs' and auth.role() = 'authenticated' );
