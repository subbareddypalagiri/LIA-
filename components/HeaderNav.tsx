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
				active={activeModal === 'nutrition'}
				onClick={() => openGymModal('nutrition')}
				title="Athlete Nutrition & Macro Hypertrophy Calculator"
				className="flex items-center gap-1 text-amber-300/90 hover:text-amber-300"
			>
				<span>Nutrition</span>
				<span className="rounded bg-amber-400/20 px-1 py-0.2 text-[8px] font-bold text-amber-300">PRO</span>
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
					className="flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200"
				>
					<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
					</svg>
					<span>Owner Desk</span>
				</Nav.Item>
			)}

			{isMember && (
				<Nav.Item
					active={activeModal === 'my-membership'}
					onClick={() => openGymModal('my-membership')}
					title="My Athlete Membership Card & Attendance"
					className="flex items-center gap-1.5 font-bold text-emerald-300 hover:text-emerald-200"
				>
					<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<rect width="18" height="18" x="3" y="3" rx="2" />
						<circle cx="12" cy="10" r="3" />
						<path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
					</svg>
					<span>My Pass ({user?.name.split(' ')[0]})</span>
				</Nav.Item>
			)}

			{!user && (
				<Nav.Item
					active={activeModal === 'auth'}
					onClick={() => openGymModal('auth')}
					title="Gym Portal Login for Members & Owner"
					className="flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300"
				>
					<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
						<path d="M7 11V7a5 5 0 0 1 10 0v4" />
					</svg>
					<span>Login</span>
				</Nav.Item>
			)}
		</Nav.Root>
	)
}
