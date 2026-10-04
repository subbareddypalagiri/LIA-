'use client'

import * as Nav from '@/components/Nav'
import { useGymModal, openGymModal } from '@/store/gymHub'
import { useAuth } from '@/store/authStore'

export default function HeaderNav() {
	const { activeModal } = useGymModal()
	const { user, isOwner, isMember } = useAuth()

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

			{/* Role-Based Nav Item */}
			{isOwner && (
				<Nav.Item
					active={activeModal === 'owner'}
					onClick={() => openGymModal('owner')}
					title="Gym Owner Desk: Revenue, Fees, Attendance & Onboarding"
					className="flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200"
				>
					<span>👑 Owner Desk</span>
				</Nav.Item>
			)}

			{isMember && (
				<Nav.Item
					active={activeModal === 'my-membership'}
					onClick={() => openGymModal('my-membership')}
					title="My Athlete Membership Card & Attendance"
					className="flex items-center gap-1 font-bold text-emerald-300 hover:text-emerald-200"
				>
					<span>🪪 My Pass ({user?.name.split(' ')[0]})</span>
				</Nav.Item>
			)}

			{!user && (
				<Nav.Item
					active={activeModal === 'auth'}
					onClick={() => openGymModal('auth')}
					title="Gym Portal Login for Members & Owner"
					className="flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300"
				>
					<span>🔐 Login</span>
				</Nav.Item>
			)}
		</Nav.Root>
	)
}
