'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Tasks Actions

export async function fetchTasks() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .select(`
            *,
            task_assignees (
                user_id,
                profiles:user_id(full_name)
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tasks:', error)
        return []
    }

    return data
}

export async function createTask(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const assignedUserIds = formData.getAll('assignedTo') as string[]

    if (!title) {
        return { error: 'Task title is required' }
    }

    // 1. Insert the Task
    const { data: insertedTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
            title,
            description: description || null,
            status: 'pending'
        })
        .select('id')
        .single()

    if (taskError) return { error: taskError.message }

    // 2. Insert into task_assignees if any users were selected
    const uniqueUserIds = Array.from(new Set(assignedUserIds.filter(id => id.trim() !== '')))

    if (uniqueUserIds.length > 0) {
        const assigneeRecords = uniqueUserIds.map(userId => ({
            task_id: insertedTask.id,
            user_id: userId
        }))

        const { error: assigneesError } = await supabase
            .from('task_assignees')
            .insert(assigneeRecords)

        if (assigneesError) return { error: assigneesError.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'completed') {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteTask(taskId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

// Monthly Goals Actions

export async function fetchMonthlyGoal(monthYear: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('month_year', monthYear)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching monthly goal:', error)
        return null
    }

    return data
}

export async function updateMonthlyGoal(monthYear: string, goalText: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Check if goal exists
    const existingGoal = await fetchMonthlyGoal(monthYear)

    if (existingGoal) {
        const { error } = await supabase
            .from('monthly_goals')
            .update({
                goal_text: goalText,
                updated_by: user.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingGoal.id)

        if (error) return { error: error.message }
    } else {
        const { error } = await supabase
            .from('monthly_goals')
            .insert({
                month_year: monthYear,
                goal_text: goalText,
                updated_by: user.id
            })

        if (error) return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
