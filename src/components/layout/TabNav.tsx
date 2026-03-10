'use client'

const TABS = [
  { id: 'tasks', label: 'TASKS' },
  { id: 'log', label: 'LOG' },
  { id: 'feed', label: 'FEED' },
  { id: 'leaderboard', label: 'STATS' },
] as const

export type TabId = (typeof TABS)[number]['id']

type TabNavProps = {
  activeTab: string
  onTabChange: (tabId: TabId) => void
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="border-b border-border w-full">
      <div className="max-w-[960px] mx-auto px-5 md:px-[40px]">
        <nav className="flex items-end h-[48px] gap-8" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`
                  text-[11px] font-semibold uppercase tracking-[0.1em] pb-[10px] border-b-[2px] -mb-[1px] transition-colors bg-transparent border-transparent cursor-pointer
                  ${isActive
                    ? 'border-accent text-text-bright'
                    : 'border-transparent text-muted hover:text-text-primary'
                  }
                `}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
