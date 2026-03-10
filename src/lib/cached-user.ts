import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getCachedUser = cache(async () => {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { user: null, profile: null, authError }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    return { user, profile, authError: null }
})
