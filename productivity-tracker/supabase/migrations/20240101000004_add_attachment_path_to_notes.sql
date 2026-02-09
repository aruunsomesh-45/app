-- Add attachment_path column to life_notes table
alter table life_notes
add column if not exists attachment_path text;
