import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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

export function createClient({ useServiceRole = true }: { useServiceRole?: boolean } = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Avoid throwing during build — return a safe stub so UI can render.
    // Real Supabase functionality will be disabled until env vars are provided.
    // Log a warning to aid debugging in server logs.
    // eslint-disable-next-line no-console
    console.warn('Supabase env missing: returning stub client. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in deployment.')
    return makeStubClient()
  }

  return createSupabaseClient(supabaseUrl, supabaseKey)
}

