-- Enable pgvector
create extension if not exists vector;

-- Products table with occasion tags
create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  product_name text not null,
  brand text,
  category text not null default 'women_clothing',
  price numeric,
  original_price numeric,
  image_url text,
  link text,
  availability text default 'In Stock',
  product_description text,
  occasion_weekend_social float default 0,
  occasion_date_night float default 0,
  occasion_everyday_casual float default 0,
  primary_occasion text check (primary_occasion in ('weekend_social', 'date_night', 'everyday_casual')),
  thai_climate_rating int,
  temple_appropriate boolean default false,
  ac_friendly boolean default true,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Knowledge chunks table
create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  category text not null,
  tier int not null,
  title text,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes
create index idx_products_occasion_weekend on products (occasion_weekend_social desc);
create index idx_products_occasion_date on products (occasion_date_night desc);
create index idx_products_occasion_everyday on products (occasion_everyday_casual desc);
create index idx_products_primary_occasion on products (primary_occasion);
create index idx_knowledge_category on knowledge_chunks (category);

-- RPC function for semantic product search
create or replace function search_products(
  query_embedding vector(1536),
  occasion_filter text default null,
  match_threshold float default 0.7,
  match_count int default 20
)
returns table (
  id uuid,
  product_name text,
  brand text,
  price numeric,
  image_url text,
  link text,
  primary_occasion text,
  occasion_weekend_social float,
  occasion_date_night float,
  occasion_everyday_casual float,
  similarity float
)
language plpgsql as $$
begin
  return query
  select
    p.id, p.product_name, p.brand, p.price, p.image_url, p.link,
    p.primary_occasion, p.occasion_weekend_social, p.occasion_date_night,
    p.occasion_everyday_casual,
    1 - (p.embedding <=> query_embedding) as similarity
  from products p
  where
    (occasion_filter is null or p.primary_occasion = occasion_filter)
    and 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RPC function for knowledge search
create or replace function search_knowledge(
  query_embedding vector(1536),
  category_filter text default null,
  match_threshold float default 0.7,
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
    k.id, k.source_file, k.category, k.title, k.content,
    1 - (k.embedding <=> query_embedding) as similarity
  from knowledge_chunks k
  where
    (category_filter is null or k.category = category_filter)
    and 1 - (k.embedding <=> query_embedding) > match_threshold
  order by k.embedding <=> query_embedding
  limit match_count;
end;
$$;
