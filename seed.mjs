import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables.")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function seed() {
  console.log("Creating default leader account...")
  
  // 1. Create the user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: 'leader@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Admin Leader'
    }
  })

  if (authError) {
    if (authError.message.includes('already exists')) {
      console.log("User leader@example.com already exists!")
    } else {
      console.error("Error creating user:", authError.message)
      return
    }
  } else {
    console.log("Successfully created user leader@example.com!")
    
    const userId = authData.user.id
    
    // 2. Try to insert or update their profile to ensure they are a 'leader'
    // Note: If you have a trigger on auth.users, it might have already created a profile.
    // So we'll upsert.
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: 'Admin Leader',
      role: 'leader'
    })
    
    if (profileError) {
      console.error("Error setting role to leader. Make sure your database tables are created!\n", profileError.message)
    } else {
      console.log("Successfully set user role to 'leader'.")
    }
  }
}

seed()
