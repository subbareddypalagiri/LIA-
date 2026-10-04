'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check if already installed in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      setIsStandalone(isStandaloneMode)
    }
    checkStandalone()

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIos(isIosDevice)

    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.log('SW registration error:', err))
    } else if ('serviceWorker' in navigator) {
      // In dev mode, still register so browser install heuristics pass
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {})
    }

    // Capture beforeinstallprompt for Android & Desktop Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  if (!isMounted || isStandalone || isDismissed) {
    return null
  }

  // Show if deferredPrompt exists or on iOS device
  const canShowPrompt = deferredPrompt !== null || isIos

  if (!canShowPrompt) {
    return null
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setIsStandalone(true)
      }
      setDeferredPrompt(null)
    } else if (isIos) {
      setShowIosGuide(true)
    }
  }

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-neutral-950/95 p-3.5 shadow-2xl backdrop-blur-xl sm:p-4">
          <div className="flex items-center gap-3">
            {/* App Icon */}
            <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-neutral-900 to-black shadow-lg shadow-amber-500/10">
              <span className="font-heading text-base font-black text-amber-400">LIA</span>
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-xs font-bold uppercase tracking-wider text-white">
                  LIA Iron Club App
                </span>
                <span className="shrink-0 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 uppercase">
                  PWA
                </span>
              </div>
              <p className="line-clamp-1 text-[11px] text-neutral-400">
                Install on home screen for 1-tap pass & offline macros
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-black shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Install</span>
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss banner"
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍎</span>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Install on iPhone / iPad</h4>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 py-4 text-xs text-neutral-300">
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-400">1</span>
                <p>Tap the <span className="font-semibold text-white">Share button</span> (⎋ square with upward arrow) at the bottom of Safari.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-400">2</span>
                <p>Scroll down and select <span className="font-semibold text-white">&quot;Add to Home Screen&quot;</span> (➕).</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-400">3</span>
                <p>Tap <span className="font-semibold text-white">Add</span> in the top right corner. The app will appear on your home screen!</p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full rounded-xl bg-neutral-800 py-2.5 text-xs font-bold text-white hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  )
}
