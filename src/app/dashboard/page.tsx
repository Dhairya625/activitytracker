import { redirect } from 'next/navigation'
import { getCachedUser } from '@/lib/cached-user'
import LogActivityForm from '@/components/forms/LogActivityForm'
import ActivityFeed from '@/components/feed/ActivityFeed'
import LeaderboardAnalytics from '@/components/charts/LeaderboardAnalytics'
import TaskBoard from '@/components/tasks/TaskBoard'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { user, profile } = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  const isLeader = profile?.role === 'leader'

  const resolvedSearchParams = await searchParams
  const tab = resolvedSearchParams.tab || 'tasks'

  return (
    <div className="min-h-[400px]">
      {tab === 'tasks' && <TaskBoard currentUserId={user.id} />}
      {tab === 'log' && <LogActivityForm isLeader={isLeader} currentUserId={user.id} />}
      {tab === 'feed' && <ActivityFeed />}
      {tab === 'leaderboard' && <LeaderboardAnalytics isLeader={isLeader} />}
    </div>
  )
}
