'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

const TABS = [
  { id: 'log', label: 'LOG' },
  { id: 'feed', label: 'FEED' },
  { id: 'leaderboard', label: 'STATS' },
]

export default function TabNav() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // Default to first tab if none is specified
  const activeTab = searchParams.get('tab') || 'log'

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  return (
    <div className="border-b border-border w-full">
      <div className="max-w-[960px] mx-auto px-5 md:px-[40px]">
        <nav className="flex items-end h-[48px] gap-8" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <Link
                key={tab.id}
                href={pathname + '?' + createQueryString('tab', tab.id)}
                className={`
                  text-[11px] font-semibold uppercase tracking-[0.1em] pb-[10px] border-b-[2px] -mb-[1px] transition-colors
                  ${isActive
                    ? 'border-accent text-text-bright'
                    : 'border-transparent text-muted hover:text-text-primary'
                  }
                `}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
