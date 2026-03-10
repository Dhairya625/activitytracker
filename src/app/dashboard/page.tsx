import { redirect } from 'next/navigation'
import { getCachedUser } from '@/lib/cached-user'
import { getTeamMembers } from '@/app/dashboard/actions'
import { fetchTasks, fetchMonthlyGoal } from '@/app/dashboard/task-actions'
import DashboardContent from '@/components/dashboard/DashboardContent'

function getCurrentMonthYear() {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const tab = (resolvedSearchParams.tab as string) || 'tasks'
  const isTasksTab = tab === 'tasks'

  const [userResult, teamMembers, tasksData, monthlyGoalData] = await Promise.all([
    getCachedUser(),
    getTeamMembers(),
    isTasksTab ? fetchTasks() : Promise.resolve(null),
    isTasksTab ? fetchMonthlyGoal(getCurrentMonthYear()) : Promise.resolve(null),
  ])

  const { user, profile } = userResult
  if (!user) {
    redirect('/login')
  }

  const isLeader = profile?.role === 'leader'
  const currentMonthYear = getCurrentMonthYear()

  return (
    <DashboardContent
      initialTab={tab}
      currentUserId={user.id}
      isLeader={!!isLeader}
      teamMembers={teamMembers ?? []}
      initialTasks={tasksData ?? null}
      initialMonthlyGoal={monthlyGoalData ? { goal_text: monthlyGoalData.goal_text } : null}
      currentMonthYear={currentMonthYear}
    />
  )
}
