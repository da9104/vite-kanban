import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

// server/supabase.js
export const createClient = (req, res) => {
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(req.headers.cookie ?? '')
        },
        setAll(cookiesToSet) {
          if (res.headersSent) return; 
          cookiesToSet.forEach(({ name, value, options }) =>
            res.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
        },
      },
    }
  )
}