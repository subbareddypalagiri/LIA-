'use client'

import { usePwa } from '@/store/pwaStore'

export default function PwaInstallPrompt() {
  const { showIosGuide, closeIosGuide } = usePwa()

  if (!showIosGuide) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v8m0 0 3-3m-3 3-3-3M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
              </svg>
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Install on iOS Safari</h4>
          </div>
          <button
            onClick={closeIosGuide}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3.5 py-4 text-xs text-neutral-300 font-sans">
          <div className="flex items-start gap-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-mono text-[11px] font-bold text-amber-400">1</span>
            <p className="leading-relaxed">Tap the <span className="font-semibold text-white">Share button</span> at the bottom bar of Safari.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-mono text-[11px] font-bold text-amber-400">2</span>
            <p className="leading-relaxed">Scroll down and select <span className="font-semibold text-white">&quot;Add to Home Screen&quot;</span>.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-mono text-[11px] font-bold text-amber-400">3</span>
            <p className="leading-relaxed">Tap <span className="font-semibold text-white">Add</span> in the top right corner. The app will launch with 0 browser bars!</p>
          </div>
        </div>

        <button
          onClick={closeIosGuide}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-black hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          Understood
        </button>
      </div>
    </div>
  )
}
