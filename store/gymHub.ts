'use client'
'use no memo'

import { useEffect, useState } from 'react'

export type GymModalType = 'exercises' | 'splits' | 'equipment' | 'timings' | 'owner' | 'auth' | 'my-membership' | null

const EVENT_NAME = 'lia-gym-modal-change'
let currentModal: GymModalType = null

export function openGymModal(modal: GymModalType) {
	currentModal = modal
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent<GymModalType>(EVENT_NAME, { detail: modal }))
	}
}

export function closeGymModal() {
	openGymModal(null)
}

export function useGymModal() {
	const [activeModal, setActiveModal] = useState<GymModalType>(() => currentModal)

	useEffect(() => {
		const handleModal = (e: Event) => {
			const customEvent = e as CustomEvent<GymModalType>
			setActiveModal(customEvent.detail)
		}
		window.addEventListener(EVENT_NAME, handleModal)
		return () => {
			window.removeEventListener(EVENT_NAME, handleModal)
		}
	}, [])

	return {
		activeModal,
		openModal: openGymModal,
		closeModal: closeGymModal
	}
}
