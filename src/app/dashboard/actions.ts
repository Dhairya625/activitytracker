'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath, unstable_cache } from 'next/cache'

export async function logActivity(formData: FormData, skipRevalidate = false) {
  const supabase = await createClient()

  // Extract fields
  const taskName = formData.get('taskName') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const hours = parseInt(formData.get('hours') as string || '0', 10)
  const minutes = parseInt(formData.get('minutes') as string || '0', 10)

  // Conditionally process 'userId' or 'userIds' if submitted
  let targetUserIdsParam = formData.getAll('userIds') as string[]
  const targetUserIdParam = formData.get('userId') as string

  // Clean up if the array contains a single stringified JSON array from the client
  if (targetUserIdsParam.length === 1 && targetUserIdsParam[0].startsWith('[')) {
    try {
      targetUserIdsParam = JSON.parse(targetUserIdsParam[0])
    } catch (e) { /* ignore */ }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Determine target user IDs
  let targetUserIds: string[] = []
  if (targetUserIdsParam && targetUserIdsParam.length > 0) {
    targetUserIds = targetUserIdsParam.filter(id => id && id.trim() !== '')
  }

  if (targetUserIds.length === 0 && targetUserIdParam && targetUserIdParam.trim() !== '') {
    targetUserIds = [targetUserIdParam]
  }

  if (targetUserIds.length === 0) {
    targetUserIds = [user.id]
  }

  // Calculate total decimal hours
  const totalDecimalHours = hours + (minutes / 60)
  if (totalDecimalHours <= 0) {
    return { error: 'Time spent must be greater than 0' }
  }

  if (!taskName || !category) {
    return { error: 'Task name and category are required' }
  }

  const activitiesToInsert = targetUserIds.map(userId => ({
    user_id: userId,
    task_name: taskName,
    description: description || null,
    category,
    hours: Number(totalDecimalHours.toFixed(2))
  }))

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminClient.from('activities').insert(activitiesToInsert)

  if (error) {
    return { error: error.message }
  }

  if (!skipRevalidate) {
    revalidatePath('/dashboard')
  }
  return { success: true }
}

async function fetchTeamMembersImpl() {
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .order('full_name')

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }
  return data
}

export async function getTeamMembers() {
  return unstable_cache(fetchTeamMembersImpl, ['team-members'], {
    revalidate: 60,
    tags: ['team-members'],
  })()
}
