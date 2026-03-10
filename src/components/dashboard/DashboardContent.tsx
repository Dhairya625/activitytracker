'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import TabNav, { type TabId } from '@/components/layout/TabNav'
import TaskBoard from '@/components/tasks/TaskBoard'
import LogActivityForm from '@/components/forms/LogActivityForm'
import ActivityFeed from '@/components/feed/ActivityFeed'
import LeaderboardAnalytics from '@/components/charts/LeaderboardAnalytics'
import type { TaskInfo } from '@/types/tasks'

export type TeamMember = { id: string; full_name: string }

type DashboardContentProps = {
  initialTab: string
  currentUserId: string
  isLeader: boolean
  teamMembers?: TeamMember[] | null
  initialTasks?: TaskInfo[] | null
  initialMonthlyGoal?: { goal_text: string } | null
  currentMonthYear?: string
}

export default function DashboardContent({
  initialTab,
  currentUserId,
  isLeader,
  teamMembers = null,
  initialTasks = null,
  initialMonthlyGoal = null,
  currentMonthYear = undefined,
}: DashboardContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'tasks')

  // Sync activeTab from URL when navigating (e.g. browser back/forward or initial load)
  useEffect(() => {
    setActiveTab(initialTab || 'tasks')
  }, [initialTab])

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
    const params = new URLSearchParams()
    params.set('tab', tabId)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="min-h-[400px] flex flex-col w-full">
      <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="pt-0 mt-0 flex-1">
        {activeTab === 'tasks' && (
          <TaskBoard
            currentUserId={currentUserId}
            teamMembers={teamMembers}
            initialTasks={initialTasks}
            initialMonthlyGoal={initialMonthlyGoal}
            currentMonthYear={currentMonthYear}
          />
        )}
        {activeTab === 'log' && (
          <LogActivityForm
            isLeader={isLeader}
            currentUserId={currentUserId}
            teamMembers={teamMembers}
          />
        )}
        {activeTab === 'feed' && (
          <ActivityFeed teamMembers={teamMembers} />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardAnalytics isLeader={isLeader} />
        )}
      </div>
    </div>
  )
}
