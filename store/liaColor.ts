'use client'
'use no memo'

import { useEffect, useState } from 'react'

const EVENT_NAME = 'lia-color-change'
const liaStore = { color: '#ffe082' }

export function setLiaColor(color: string) {
	liaStore.color = color
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent<string>(EVENT_NAME, { detail: color }))
	}
}

export function useLiaColor() {
	const [color, setColor] = useState(() => liaStore.color)

	useEffect(() => {
		const handleColor = (e: Event) => {
			const customEvent = e as CustomEvent<string>
			if (customEvent.detail) {
				setColor(customEvent.detail)
			}
		}
		window.addEventListener(EVENT_NAME, handleColor)
		return () => {
			window.removeEventListener(EVENT_NAME, handleColor)
		}
	}, [])

	return color
}
