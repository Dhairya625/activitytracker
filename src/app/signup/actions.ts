'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(state: any, formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!fullName || !email || !password) {
    return { error: 'Full name, email, and password are required' }
  }

  const supabase = await createClient()

  // Notice: We pass the full_name in options.data so the handle_new_user trigger in the DB
  // correctly picks it up when associating the user to the public.profiles table.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      // Assuming email confirmation is not strictly required right now,
      // If it is required by Supabase auth settings, they'll need to confirm first before login.
    },
  })

  // Check if signup failed
  if (error) {
    return { error: error.message }
  }

  // Once signed up successfully, redirect to the login page
  redirect('/login?registered=true')
}
