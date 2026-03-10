'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function logActivity(formData: FormData) {
  const supabase = await createClient()

  // Extract fields
  const taskName = formData.get('taskName') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const hours = parseInt(formData.get('hours') as string || '0', 10)
  const minutes = parseInt(formData.get('minutes') as string || '0', 10)
  
  // Conditionally process 'userId' if submitted by a leader
  let targetUserId = formData.get('userId') as string
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // If no specific user selected (or not a leader), use logged in user
  if (!targetUserId) {
    targetUserId = user.id
  }

  // Calculate total decimal hours
  const totalDecimalHours = hours + (minutes / 60)
  if (totalDecimalHours <= 0) {
    return { error: 'Time spent must be greater than 0' }
  }

  if (!taskName || !category) {
    return { error: 'Task name and category are required' }
  }

  const { error } = await supabase.from('activities').insert({
    user_id: targetUserId,
    task_name: taskName,
    description: description || null,
    category,
    hours: Number(totalDecimalHours.toFixed(2))
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getTeamMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name')
  
  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }
  return data
}
