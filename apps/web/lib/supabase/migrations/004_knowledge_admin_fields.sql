-- Add admin management fields for knowledge chunks
alter table knowledge_chunks
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz default now();

create index if not exists idx_knowledge_chunks_is_active on knowledge_chunks (is_active);

-- Ensure semantic retrieval excludes inactive knowledge
create or replace function search_knowledge(
  query_embedding text,
  category_filter text default null,
  match_threshold float default 0.25,
  match_count int default 10
)
returns table (
  id uuid,
  source_file text,
  category text,
  title text,
  content text,
  similarity float
)
language plpgsql as $$
begin
  return query
  select
    kc.id,
    kc.source_file,
    kc.category,
    kc.title,
    kc.content,
    1 - (kc.embedding <=> query_embedding::vector) as similarity
  from knowledge_chunks kc
  where kc.is_active = true
    and (category_filter is null or kc.category = category_filter)
    and 1 - (kc.embedding <=> query_embedding::vector) > match_threshold
  order by kc.embedding <=> query_embedding::vector
  limit match_count;
end;
$$;
