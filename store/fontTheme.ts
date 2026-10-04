'use client'
'use no memo'

import { useEffect, useState } from 'react'

export interface FontOption {
	id: string
	name: string
	category: string
	fontFamily: string
	badge: string
}

export const FONT_OPTIONS: FontOption[] = [
	{
		id: 'jakarta',
		name: 'Plus Jakarta Sans (Haute Modern)',
		category: 'Luxury Geometric',
		fontFamily: 'var(--font-jakarta)',
		badge: '✨ Elite'
	},
	{
		id: 'cera',
		name: 'Cera Pro (Swiss Geometry)',
		category: 'Architectural Clean',
		fontFamily: 'var(--font-cera)',
		badge: '📐 Clean'
	},
	{
		id: 'space',
		name: 'Space Grotesk (Tech Lab)',
		category: 'Modern Biomechanics',
		fontFamily: 'var(--font-space)',
		badge: '⚡ Tech'
	},
	{
		id: 'cinzel',
		name: 'Cinzel (Greek Monument)',
		category: 'Chiseled Sculpture',
		fontFamily: 'var(--font-cinzel)',
		badge: '🏛️ God'
	},
	{
		id: 'oswald',
		name: 'Oswald (Heavy Iron)',
		category: 'Condensed Power',
		fontFamily: 'var(--font-oswald)',
		badge: '🔥 Power'
	},
	{
		id: 'bebas',
		name: 'Bebas Neue (Power Plates)',
		category: 'Industrial All-Caps',
		fontFamily: 'var(--font-bebas)',
		badge: '🏋️ Plates'
	}
]

const EVENT_NAME = 'lia-font-change'
const fontStore = { current: FONT_OPTIONS[0] }

function applyDomFont(fontFamily: string) {
	if (typeof document !== 'undefined') {
		document.documentElement.style.setProperty('--font-heading', fontFamily)
	}
}

export function setFontTheme(fontId: string) {
	const found = FONT_OPTIONS.find((f) => f.id === fontId)
	if (found) {
		fontStore.current = found
		applyDomFont(found.fontFamily)
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent<FontOption>(EVENT_NAME, { detail: found }))
		}
	}
}

export function useFontTheme(): FontOption {
	const [font, setFont] = useState<FontOption>(() => fontStore.current)

	useEffect(() => {
		applyDomFont(font.fontFamily)

		const handleFontChange = (e: Event) => {
			const customEvent = e as CustomEvent<FontOption>
			if (customEvent.detail) {
				setFont(customEvent.detail)
				applyDomFont(customEvent.detail.fontFamily)
			}
		}
		window.addEventListener(EVENT_NAME, handleFontChange)
		return () => {
			window.removeEventListener(EVENT_NAME, handleFontChange)
		}
	}, [font.fontFamily])

	return font
}
