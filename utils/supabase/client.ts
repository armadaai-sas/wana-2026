import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function makeStubClient() {
  const builder: any = {
    select: async () => ({ data: [], error: null, count: 0 }),
    eq() { return builder },
    order() { return builder },
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    from() { return builder },
    rpc: async () => ({ data: null, error: null }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        createSignedUrl: async () => ({ data: null, error: null }),
      })
    },
    auth: {
      getUser: async () => ({ data: null, error: null }),
    }
  }

  return builder
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn('Supabase env missing for client: returning stub client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
    return makeStubClient();
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
