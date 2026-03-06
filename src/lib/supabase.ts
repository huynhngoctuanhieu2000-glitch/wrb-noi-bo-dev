import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client for use in the browser (CSR).
 */
export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Supabase client for use in server-side code (API routes, server components).
 * Uses the standard supabase-js client instead of the SSR browser client.
 */
export const createServerClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Lazy singleton — only created when actually called at runtime, not at build time.
let _supabase: ReturnType<typeof createServerClient> | null = null
export const supabase = new Proxy({} as ReturnType<typeof createServerClient>, {
    get(_target, prop) {
        if (!_supabase) {
            _supabase = createServerClient()
        }
        return (_supabase as any)[prop]
    }
})
