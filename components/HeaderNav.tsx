'use client'

import * as Nav from '@/components/Nav'
import { useGymModal, openGymModal } from '@/store/gymHub'

export default function HeaderNav() {
	const { activeModal } = useGymModal()

	return (
		<Nav.Root className="hidden md:block">
			<Nav.Item
				active={activeModal === 'exercises'}
				onClick={() => openGymModal('exercises')}
				title="View Hypertrophy Exercise Library & Biomechanics"
			>
				Exercises
			</Nav.Item>
			<Nav.Item
				active={activeModal === 'splits'}
				onClick={() => openGymModal('splits')}
				title="Explore PPL, Arnold, and Strength Training Splits"
			>
				Splits
			</Nav.Item>
			<Nav.Item
				active={activeModal === 'equipment'}
				onClick={() => openGymModal('equipment')}
				title="View Solid Steel Dumbbells, Plates & Cable Towers"
			>
				Equipment
			</Nav.Item>
			<Nav.Item
				active={activeModal === 'timings'}
				onClick={() => openGymModal('timings')}
				title="Check Morning & Evening Batch Timings"
			>
				Timings
			</Nav.Item>
			<Nav.Item
				active={activeModal === 'owner'}
				onClick={() => openGymModal('owner')}
				title="Gym Owner Desk: Revenue, Fees, Attendance & Onboarding"
				className="flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200"
			>
				<span>👑 Owner Desk</span>
			</Nav.Item>
		</Nav.Root>
	)
}
