import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogActivityForm from '@/components/forms/LogActivityForm'
import ActivityFeed from '@/components/feed/ActivityFeed'
import LeaderboardAnalytics from '@/components/charts/LeaderboardAnalytics'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for roles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isLeader = profile?.role === 'leader'

  const resolvedSearchParams = await searchParams
  const tab = resolvedSearchParams.tab || 'log'

  return (
    <div className="min-h-[400px]">
      {tab === 'log' && <LogActivityForm isLeader={isLeader} currentUserId={user.id} />}
      {tab === 'feed' && <ActivityFeed />}
      {tab === 'leaderboard' && <LeaderboardAnalytics isLeader={isLeader} />}
    </div>
  )
}
