import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const client = createClient(url, key);

async function main() {
  const { count: total } = await client.from('products').select('*', { count: 'exact', head: true });
  const { count: withImg } = await client.from('products').select('*', { count: 'exact', head: true }).not('image_url', 'is', null).neq('image_url', '');
  const { count: withEmb } = await client.from('products').select('*', { count: 'exact', head: true }).not('embedding', 'is', null);
  const { count: withGender } = await client.from('products').select('*', { count: 'exact', head: true }).not('gender', 'is', null);
  const { count: noGender } = await client.from('products').select('*', { count: 'exact', head: true }).is('gender', null);
  console.log(`Total: ${total} | With image: ${withImg} | With embedding: ${withEmb} | Gender set: ${withGender} | No gender: ${noGender}`);
}

main().catch(console.error);
