'use client'
'use no memo'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface PwaState {
	canInstall: boolean
	isStandalone: boolean
	isIos: boolean
	showIosGuide: boolean
}

const PWA_CHANGE_EVENT = 'lia-pwa-state-change'
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null

let globalPwaState: PwaState = {
	canInstall: false,
	isStandalone: false,
	isIos: false,
	showIosGuide: false
}

function dispatchPwaUpdate(newState: Partial<PwaState>) {
	globalPwaState = { ...globalPwaState, ...newState }
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent(PWA_CHANGE_EVENT, { detail: globalPwaState }))
	}
}

export function promptInstall() {
	if (globalDeferredPrompt) {
		globalDeferredPrompt.prompt().then(() => {
			globalDeferredPrompt?.userChoice.then((choice) => {
				if (choice.outcome === 'accepted') {
					dispatchPwaUpdate({ isStandalone: true, canInstall: false })
				}
				globalDeferredPrompt = null
			})
		})
	} else if (globalPwaState.isIos) {
		dispatchPwaUpdate({ showIosGuide: true })
	} else {
		alert('To install LIA Iron Club, tap your browser menu and choose "Add to Home Screen" or "Install App".')
	}
}

export function closeIosGuide() {
	dispatchPwaUpdate({ showIosGuide: false })
}

export function usePwa() {
	const [state, setState] = useState<PwaState>(() => globalPwaState)

	useEffect(() => {
		const handleUpdate = (e: Event) => {
			const customEvent = e as CustomEvent<PwaState>
			setState(customEvent.detail)
		}

		window.addEventListener(PWA_CHANGE_EVENT, handleUpdate)

		// Initial browser checks
		const isStandaloneMode =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as unknown as { standalone?: boolean }).standalone === true

		const userAgent = window.navigator.userAgent.toLowerCase()
		const isIosDevice = /iphone|ipad|ipod/.test(userAgent)

		dispatchPwaUpdate({
			isStandalone: isStandaloneMode,
			isIos: isIosDevice,
			canInstall: !isStandaloneMode
		})

		// Register Service Worker
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch(() => {})
		}

		const handleBeforeInstall = (e: Event) => {
			e.preventDefault()
			globalDeferredPrompt = e as BeforeInstallPromptEvent
			dispatchPwaUpdate({ canInstall: true })
		}

		const handleAppInstalled = () => {
			dispatchPwaUpdate({ isStandalone: true, canInstall: false })
			globalDeferredPrompt = null
		}

		window.addEventListener('beforeinstallprompt', handleBeforeInstall)
		window.addEventListener('appinstalled', handleAppInstalled)

		return () => {
			window.removeEventListener(PWA_CHANGE_EVENT, handleUpdate)
			window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
			window.removeEventListener('appinstalled', handleAppInstalled)
		}
	}, [])

	return {
		...state,
		promptInstall,
		closeIosGuide
	}
}
