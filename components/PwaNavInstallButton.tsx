'use client'

import { usePwa, promptInstall } from '@/store/pwaStore'

export default function PwaNavInstallButton() {
  const { isStandalone } = usePwa()

  if (isStandalone) return null

  return (
    <button
      type="button"
      onClick={promptInstall}
      title="Install LIA Iron Club App (PWA)"
      className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-200 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
    >
      <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v10m0 0 3-3m-3 3-3-3M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
      </svg>
      <span>Install</span>
    </button>
  )
}
