import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function chainable(result = { data: [], error: null, count: 0 }) {
  const builder = {
    select() { return builder; },
    eq() { return builder; },
    order() { return builder; },
    range() { return builder; },
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    from() { return builder; },
    rpc: async () => ({ data: null, error: null }),
    then(onFulfilled, onRejected) {
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        createSignedUrl: async () => ({ data: null, error: null }),
      }),
    },
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      updateUser: async () => ({ data: null, error: null }),
    },
  };
  return builder;
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : chainable();
