'use client'

import { useActionState } from 'react'
import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm pt-8">
        <div className="mb-10 text-left">
          <h1 className="text-[13px] font-semibold text-text-bright tracking-normal">&gt; activity_tracker_login</h1>
        </div>

        <form action={formAction} className="space-y-[24px]">
          {state?.error && (
            <div className="bg-surface border border-[#333333] p-[10px] text-[12px] text-text-primary flex gap-2">
              <span className="text-[#555555]">&gt; err</span> <span>{state.error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] mb-[8px]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full bg-surface border border-border rounded-none px-[12px] py-[10px] text-[13px] text-text-primary placeholder-muted focus:border-text-bright focus:outline-none transition-colors"
              placeholder="// you@example.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] mb-[8px]" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full bg-surface border border-border rounded-none px-[12px] py-[10px] text-[13px] text-text-primary placeholder-muted focus:border-text-bright focus:outline-none transition-colors"
              placeholder="// ••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-[10px] px-[20px] bg-white text-black text-[12px] font-semibold rounded-none hover:bg-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 transition-colors"
            >
              {isPending ? '[ ... ]' : '[ authenticate ]'}
            </button>
          </div>

          <p className="mt-6 text-left text-[11px] font-normal text-muted">
            <Link href="/signup" className="text-text-secondary hover:text-text-primary hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
              [ create_new_account ]
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
