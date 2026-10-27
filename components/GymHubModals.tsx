'use client'
'use no memo'
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo, useEffect, useRef } from 'react'
import { useGymModal, type GymModalType } from '@/store/gymHub'
import ExerciseBiomechanicsEngine from './ExerciseBiomechanicsEngine'
import ExerciseVaultView from './ExerciseVaultView'
import AuthModal from './AuthModal'
import MemberProfileModal from './MemberProfileModal'
import AthleteNutritionModal, { AthleteNutritionView } from './AthleteNutritionModal'
import MemberTrackerModal, { MemberTrackerView } from './MemberTrackerModal'
import { exportMembersToCsv } from '@/lib/exportCsv'
import { formatWhatsAppReminder, getWhatsAppUrl, cleanPhoneNumber } from '@/lib/whatsapp'
import { useAuth, updateSessionUser } from '@/store/authStore'
import { generateUpiQrDataUrl } from '@/lib/upiQr'
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid'
import {
	fetchOwnerProfileData,
	saveOwnerProfileData,
	fetchMembersData,
	saveMemberData,
	isCloudSyncEnabled,
	type OwnerProfile,
	type GymMember
} from '@/lib/supabase'

// --- DATA STRUCTURES ---

interface SplitDay {
	day: string
	focus: string
	exercises: string[]
}

interface SplitProgram {
	id: string
	name: string
	tagline: string
	daysPerWeek: string
	difficulty: string
	days: SplitDay[]
}

const PplSplitIcon = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16M8 4v4m8-4v4m-8 4v4m8-4v4m-8 4v4m8-4v4" />
	</svg>
)

const ArnoldSplitIcon = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
	</svg>
)

const UpperLowerSplitIcon = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16V4m0 0L3 8m4-4l4 4m10 4v12m0 0l-4-4m4 4l4-4" />
	</svg>
)

const SPLIT_PROGRAMS: SplitProgram[] = [
	{
		id: 'ppl',
		name: 'Push / Pull / Legs (PPL)',
		tagline: 'The gold standard for modern muscle hypertrophy and balanced recovery',
		daysPerWeek: '6 Days / Week',
		difficulty: 'Intermediate to Advanced',
		days: [
			{
				day: 'Day 1: Push A',
				focus: 'Chest, Front Delts, Triceps',
				exercises: ['Incline DB Press (4x8)', 'Flat Barbell Bench (3x8)', 'Cable Lateral Raise (4x12)', 'Tricep Rope Pushdown (4x12)']
			},
			{
				day: 'Day 2: Pull A',
				focus: 'Back Thickness, Lats, Biceps',
				exercises: ['Barbell Row (4x8)', 'Lat Pulldown (4x10)', 'Face Pulls (3x15)', 'Incline DB Bicep Curl (4x10)']
			},
			{
				day: 'Day 3: Legs A',
				focus: 'Quads, Adductors, Calves',
				exercises: ['Barbell Squat (4x8)', 'Leg Press (4x12)', 'Walking Lunges (3x12)', 'Standing Calf Raise (4x15)']
			},
			{
				day: 'Day 4: Push B',
				focus: 'Shoulder Dominance & Upper Chest',
				exercises: ['Overhead Barbell Press (4x8)', 'Incline Hammer Press (3x10)', 'Pec Deck Fly (3x12)', 'Overhead Tricep Extension (4x12)']
			},
			{
				day: 'Day 5: Pull B',
				focus: 'Lat Width & Upper Back',
				exercises: ['Neutral Grip Lat Pulldown (4x10)', 'Chest-Supported Row (4x10)', 'Reverse Pec Deck (3x15)', 'Hammer Curls (4x12)']
			},
			{
				day: 'Day 6: Legs B',
				focus: 'Hamstrings, Glutes & Posterior Chain',
				exercises: ['Romanian Deadlift (4x8)', 'Lying Hamstring Curl (4x12)', 'Bulgarian Split Squat (3x10)', 'Seated Calf Raise (4x15)']
			},
			{
				day: 'Day 7: Active Recovery',
				focus: 'Mobility, Sauna & Hydration',
				exercises: ['20-min Light Walk', 'Foam Rolling & Hip Stretches', 'Protein & Sleep Focus']
			}
		]
	},
	{
		id: 'arnold',
		name: 'Arnold Golden Era Split',
		tagline: 'High volume antagonistic supersets for classic symmetry and massive blood pump',
		daysPerWeek: '6 Days / Week',
		difficulty: 'Advanced Lifters',
		days: [
			{
				day: 'Day 1 & 4: Chest & Back',
				focus: 'Antagonistic Torso Pump',
				exercises: ['Bench Press superset with Wide Pull-ups (4x10)', 'Incline DB Press superset with T-Bar Row (4x10)', 'Dumbbell Pullover (3x15)']
			},
			{
				day: 'Day 2 & 5: Shoulders & Arms',
				focus: '3D Deltoid Caps & Arm Hypertrophy',
				exercises: ['Seated DB Overhead Press (4x10)', 'Lateral Raises (5x12)', 'Barbell Bicep Curl superset with Skullcrushers (4x10)', 'Hammer Curls (3x12)']
			},
			{
				day: 'Day 3 & 6: Legs & Abs',
				focus: 'Quad Sweeps & Vacuum Core',
				exercises: ['Back Squat (5x8)', 'Stiff-Leg Deadlift (4x10)', 'Leg Extension & Leg Curl superset (4x15)', 'Hanging Leg Raises (4x20)']
			},
			{
				day: 'Day 7: Rest',
				focus: 'Full Nervous System Recovery',
				exercises: ['Deep sleep', 'Electrolyte hydration', 'Carb replenishment']
			}
		]
	},
	{
		id: 'upper-lower',
		name: 'Upper / Lower Heavy Split',
		tagline: 'High mechanical tension and strength progression with 3 full recovery days',
		daysPerWeek: '4 Days / Week',
		difficulty: 'All Levels / Strength Focus',
		days: [
			{
				day: 'Day 1: Upper Power',
				focus: 'Heavy Compounds (Chest/Back/Shoulders)',
				exercises: ['Barbell Bench Press (4x6)', 'Heavy Pendlay Row (4x6)', 'Standing Overhead Press (3x8)', 'Weighted Chins (3x8)']
			},
			{
				day: 'Day 2: Lower Power',
				focus: 'Heavy Squats & Posterior Chain',
				exercises: ['Low-Bar Back Squat (4x6)', 'Romanian Deadlift (4x6)', 'Leg Press (3x10)', 'Standing Calf Raise (4x12)']
			},
			{
				day: 'Day 3: Rest',
				focus: 'Mid-Week Recovery',
				exercises: ['Rest & Active Mobility']
			},
			{
				day: 'Day 4: Upper Hypertrophy',
				focus: 'High Rep Volume & Arm Isolation',
				exercises: ['Incline DB Press (4x10)', 'Neutral Lat Pulldown (4x12)', 'Lateral Raises (4x15)', 'Incline DB Curls & Dips superset (3x12)']
			},
			{
				day: 'Day 5: Lower Hypertrophy',
				focus: 'Quad Pump & Glute-Ham Focus',
				exercises: ['Front Squats or Hack Squat (4x10)', 'Lying Leg Curl (4x12)', 'Walking DB Lunges (3x12)', 'Seated Calf Raise (4x15)']
			},
			{
				day: 'Day 6 & 7: Weekend Rest',
				focus: 'Full Reset',
				exercises: ['Outdoor walk', 'Nutrition tracking', 'Meal prep']
			}
		]
	}
]

interface EquipmentItem {
	name: string
	category: string
	quantity: string
	specs: string
	status: 'Elite Condition' | 'Heavy Duty' | 'Competition Grade'
}

const EQUIPMENT_DATA: EquipmentItem[] = [
	{
		name: 'Solid Steel Heavy Dumbbells',
		category: 'Free Weights Vault',
		quantity: '2.5 kg to 60 kg (Pairs in 2.5kg increments)',
		specs: 'Knurled urethane-coated solid steel with zero plate wobble.',
		status: 'Heavy Duty'
	},
	{
		name: 'Eleiko Olympic Power Barbells & Calibrated Plates',
		category: 'Free Weights Vault',
		quantity: '8 Olympic Barbells + 2,500 kg Plates',
		specs: '20kg competition knurl bars with precision needle bearings.',
		status: 'Competition Grade'
	},
	{
		name: 'Hammer Strength Plate-Loaded Iso-Lateral Stations',
		category: 'Machine Arsenal',
		quantity: '12 Heavy Duty Stations',
		specs: 'Incline Chest Press, Wide Row, Leg Press 45°, Front Lat Pulldown.',
		status: 'Elite Condition'
	},
	{
		name: '8-Stack Cable Jungle & Functional Crossover',
		category: 'Cable Towers',
		quantity: '2 Multi-Station Towers',
		specs: 'Aircraft-grade high-tensile steel cables with smooth 2:1 pulley ratios.',
		status: 'Heavy Duty'
	},
	{
		name: 'Heavy Duty Power Cages & Olympic Squat Racks',
		category: 'Squat & Deadlift Platforms',
		quantity: '4 Full Power Cages with J-Hooks',
		specs: 'Integrated band pegs, multi-grip pull-up bars, safety spotter arms.',
		status: 'Competition Grade'
	},
	{
		name: 'Conditioning & Cardio Sanctum',
		category: 'Endurance & Stamina',
		quantity: 'Concept2 Rowers, StairMasters, Curved Treadmills',
		specs: 'Non-motorized high-intensity conditioning tools.',
		status: 'Elite Condition'
	}
]

// --- MAIN MODALS COMPONENT ---

export default function GymHubModals() {
	const { activeModal, closeModal, openModal } = useGymModal()
	const { user, isOwner, isMember, logout } = useAuth()

	// Modals internal states
	const [activeSplitId, setActiveSplitId] = useState('ppl')
	const [toastText, setToastText] = useState<string | null>(null)

	// Owner desk & profile state
	const [checkInCount, setCheckInCount] = useState(0)
	const [newMemberName, setNewMemberName] = useState('')
	const [newMemberPhone, setNewMemberPhone] = useState('')
	const [newMemberPlan, setNewMemberPlan] = useState('3 Months Hypertrophy (₹4,000)')
	const [newMemberPhoto, setNewMemberPhoto] = useState<string>('')
	const memberCameraInputRef = useRef<HTMLInputElement>(null)
	const memberGalleryInputRef = useRef<HTMLInputElement>(null)

	const handleMemberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				showToast('Image too large. Please select a photo under 5MB.')
				return
			}
			const reader = new FileReader()
			reader.onload = (event) => {
				if (event.target?.result) {
					setNewMemberPhoto(event.target.result as string)
					showToast('Athlete photo captured successfully!')
				}
			}
			reader.readAsDataURL(file)
		}
	}
	const [maintenanceLogged, setMaintenanceLogged] = useState(false)
	const [membersList, setMembersList] = useState<GymMember[]>([])
	const [viewingKpiModal, setViewingKpiModal] = useState<'active' | 'revenue' | 'dues' | null>(null)

	const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>({
		gymName: 'LIA Iron Club',
		ownerName: 'Palagiri Subbareddy',
		phone: '+91 98765 43210',
		email: 'subbareddy123sub@gmail.com',
		upiId: 'liaironclub@okhdfcbank',
		monthlyTarget: 180000,
		todayCheckins: 0
	})
	const [isEditingProfile, setIsEditingProfile] = useState(false)
	const [ownerPasswordInput, setOwnerPasswordInput] = useState('')
	const [cloudSyncActive, setCloudSyncActive] = useState(false)
	const [autoQrDataUrl, setAutoQrDataUrl] = useState<string>('')
	const qrFileInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		setCloudSyncActive(isCloudSyncEnabled())
		fetchOwnerProfileData().then((prof) => {
			setOwnerProfile(prof)
			setCheckInCount(prof.todayCheckins || 0)
		})
		fetchMembersData([]).then((mems) => {
			setMembersList(mems)
		})
	}, [activeModal])

	useEffect(() => {
		if (ownerProfile.upiId) {
			generateUpiQrDataUrl(ownerProfile.upiId, ownerProfile.gymName).then((url) => {
				setAutoQrDataUrl(url)
			})
		}
	}, [ownerProfile.upiId, ownerProfile.gymName])

	const getPlanPrice = (plan: string): number => {
		if (!plan) return 1500
		if (plan.includes('12,000') || plan.toLowerCase().includes('1 year') || plan.toLowerCase().includes('annual')) return 12000
		if (plan.includes('7,000') || plan.toLowerCase().includes('6 month')) return 7000
		if (plan.includes('6,000') || plan.toLowerCase().includes('personal')) return 6000
		if (plan.includes('4,000') || plan.toLowerCase().includes('3 month')) return 4000
		if (plan.includes('1,500') || plan.toLowerCase().includes('1 month')) return 1500
		return 1500
	}

	const activeMembersCount = useMemo(() => {
		return membersList.filter((m) => {
			const diff = new Date(m.expiryDate).getTime() - new Date().setHours(0, 0, 0, 0)
			return Math.ceil(diff / (1000 * 60 * 60 * 24)) >= 0
		}).length
	}, [membersList])

	const expiredMembers = useMemo(() => {
		return membersList.filter((m) => {
			const diff = new Date(m.expiryDate).getTime() - new Date().setHours(0, 0, 0, 0)
			return Math.ceil(diff / (1000 * 60 * 60 * 24)) < 0
		})
	}, [membersList])

	const monthRevenue = useMemo(() => {
		return membersList.reduce((acc, m) => acc + getPlanPrice(m.plan), 0)
	}, [membersList])

	const pendingDues = useMemo(() => {
		return expiredMembers.reduce((acc, m) => acc + getPlanPrice(m.plan), 0)
	}, [expiredMembers])

	const activeMembersList = useMemo(() => {
		return membersList.filter((m: GymMember) => {
			const diff = new Date(m.expiryDate).getTime() - new Date().setHours(0, 0, 0, 0)
			return Math.ceil(diff / (1000 * 60 * 60 * 24)) >= 0
		})
	}, [membersList])

	const dueAndExpiringMembers = useMemo(() => {
		return membersList.filter((m: GymMember) => {
			const diff = new Date(m.expiryDate).getTime() - new Date().setHours(0, 0, 0, 0)
			const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
			return days <= 3
		})
	}, [membersList])

	// Exercises view mode & inspected item (default to Vault list)
	const [exerciseSubView, setExerciseSubView] = useState<'studio' | 'list'>('list')
	const [inspectedExerciseId, setInspectedExerciseId] = useState<string>('bicep-curl')

	const showToast = (msg: string) => {
		setToastText(msg)
		setTimeout(() => setToastText(null), 3000)
	}

	if (!activeModal) return null

	if (activeModal === 'auth') {
		return <AuthModal onSuccess={() => showToast('Authenticated successfully!')} />
	}

	if (activeModal === 'my-membership') {
		return <MemberProfileModal showToast={showToast} />
	}



	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
				onClick={closeModal}
			/>

			{/* Toast Notification */}
			{toastText && (
				<div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-amber-400/40 bg-neutral-900/95 px-5 py-2.5 text-xs font-semibold text-amber-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
					{toastText}
				</div>
			)}

			{/* Modal Container */}
			<div className="relative z-10 w-full max-w-5xl lg:max-w-6xl max-h-[92dvh] overflow-hidden rounded-3xl border border-white/20 bg-neutral-950/98 shadow-2xl backdrop-blur-2xl flex flex-col text-white">
				
				{/* Top Bar with Navigation Tabs */}
				<div className="flex items-center justify-between border-b border-white/10 px-3.5 sm:px-6 py-2.5 sm:py-3 bg-neutral-950/90 font-sans">
					<div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 pr-2">
						<button
							onClick={() => openModal('exercises')}
							className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
								activeModal === 'exercises'
									? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-400/20'
									: 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
							}`}
						>
							<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
							</svg>
							<span>Exercises</span>
						</button>
						<button
							onClick={() => openModal('splits')}
							className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
								activeModal === 'splits'
									? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-400/20'
									: 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
							}`}
						>
							<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
								<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
								<path d="M9 14l2 2 4-4" />
							</svg>
							<span>Splits</span>
						</button>
						<button
							onClick={() => openModal('equipment')}
							className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
								activeModal === 'equipment'
									? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-400/20'
									: 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
							}`}
						>
							<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
							</svg>
							<span>Equipment</span>
						</button>
						<button
							onClick={() => openModal('nutrition')}
							className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
								activeModal === 'nutrition'
									? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-400/20'
									: 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
							}`}
						>
							<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<path d="M18 6 6 18" />
								<path d="m20 10-4-4" />
								<path d="m4 14 4 4" />
								<circle cx="12" cy="12" r="3" />
							</svg>
							<span>Nutrition</span>
						</button>
						<button
							onClick={() => openModal('timings')}
							className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
								activeModal === 'timings'
									? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-400/20'
									: 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
							}`}
						>
							<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="12" r="10" />
								<polyline points="12 6 12 12 16 14" />
							</svg>
							<span>Timings</span>
						</button>

						<button
							onClick={() => openModal('members')}
							className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
								activeModal === 'members'
									? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-400/20'
									: 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
							}`}
						>
							<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
							<span>Members</span>
							<span className="size-1.5 rounded-full bg-emerald-400" />
						</button>


						{/* Role-Based Tab: LIA Command if owner, My Pass if member, or Login if guest */}
						{isOwner && (
							<button
								onClick={() => openModal('owner')}
								className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
									activeModal === 'owner'
										? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-400/20'
										: 'border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
								}`}
							>
								<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
									<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
								</svg>
								<span>LIA Command</span>
								<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
							</button>
						)}

						{isMember && (
							<button
								onClick={() => openModal('my-membership')}
								className="rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
							>
								<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
									<rect width="18" height="18" x="3" y="3" rx="2" />
									<circle cx="12" cy="10" r="3" />
									<path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
								</svg>
								<span>My Pass ({user?.name.split(' ')[0]})</span>
								<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
							</button>
						)}

						{!user && (
							<button
								onClick={() => openModal('auth')}
								className="rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
							>
								<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
									<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
									<path d="M7 11V7a5 5 0 0 1 10 0v4" />
								</svg>
								<span>Login</span>
							</button>
						)}
					</div>

					<button
						onClick={closeModal}
						className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition-all ml-1.5"
						title="Close Modal"
					>
						<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Modal Content Body */}
				<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">

					{/* 1. EXERCISES LIBRARY & 3D BIOMECHANICS STUDIO */}
					{activeModal === 'exercises' && (
						<div>
							{/* Sleek Segmented Switcher */}
							<div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
								<div className="p-1 rounded-2xl bg-neutral-900/90 border border-white/10 flex items-center gap-1 w-full sm:w-auto max-w-md">
									<button
										onClick={() => setExerciseSubView('list')}
										className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
											exerciseSubView === 'list'
												? 'bg-amber-400 text-black font-bold shadow-sm'
												: 'text-neutral-400 hover:text-white'
										}`}
									>
										<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
											<rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
										</svg>
										<span>Movement Library (609)</span>
									</button>
									<button
										onClick={() => setExerciseSubView('studio')}
										className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
											exerciseSubView === 'studio'
												? 'bg-amber-400 text-black font-bold shadow-sm'
												: 'text-neutral-400 hover:text-white'
										}`}
									>
										<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
											<line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
										</svg>
										<span>3D Studio</span>
										<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
									</button>
								</div>

								<div className="text-[11px] text-neutral-400 hidden sm:block">
									{exerciseSubView === 'studio'
										? 'Interactive 3D rep scrubber & biomechanics'
										: '609 illustrated exercise protocols & contraction cues'}
								</div>
							</div>

							{exerciseSubView === 'studio' ? (
								<ExerciseBiomechanicsEngine
									initialExerciseId={inspectedExerciseId}
									onBack={() => setExerciseSubView('list')}
								/>
							) : (
								<ExerciseVaultView
									onOpenStudio={(studioId) => {
										setInspectedExerciseId(studioId)
										setExerciseSubView('studio')
									}}
									showToast={showToast}
								/>
							)}
						</div>
					)}

					{/* 2. WORKOUT SPLITS */}
					{activeModal === 'splits' && (
						<div className="font-sans">
							<div className="mb-4">
								<h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
									Training Splits
								</h2>
								<p className="text-xs text-neutral-400 mt-0.5">
									Select your preferred training frequency and daily compound blueprint.
								</p>
							</div>

							{/* Split Selector Bento Grid */}
							<BentoGrid className="mb-6 auto-rows-[13rem] sm:auto-rows-[16rem] md:auto-rows-[17.5rem]">
								{SPLIT_PROGRAMS.map((prog) => {
									const isCurrent = activeSplitId === prog.id
									const ProgIcon =
										prog.id === 'ppl'
											? PplSplitIcon
											: prog.id === 'arnold'
											? ArnoldSplitIcon
											: UpperLowerSplitIcon

									return (
										<BentoCard
											key={prog.id}
											name={prog.name}
											description={prog.tagline}
											badge={`${prog.daysPerWeek}`}
											cta={isCurrent ? 'Active Blueprint' : 'Activate Routine'}
											onClick={() => setActiveSplitId(prog.id)}
											Icon={ProgIcon}
											className={
												isCurrent
													? 'border-amber-400/90 dark:border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.22)] ring-1 ring-amber-400/50'
													: ''
											}
											background={
												<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.12),rgba(0,0,0,0))]" />
											}
										/>
									)
								})}
							</BentoGrid>

							{/* Active Split Day-by-Day View */}
							{(() => {
								const currentProg = SPLIT_PROGRAMS.find((p) => p.id === activeSplitId)!
								return (
									<div className="space-y-4">
										<div className="flex items-center justify-between border-b border-white/10 pb-3">
											<div>
												<h3 className="text-base font-bold text-white tracking-tight font-sans flex items-center gap-2">
													<span>{currentProg.name} Execution Plan</span>
													<span className="text-[10px] font-mono font-normal text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full bg-amber-400/10">
														{currentProg.difficulty}
													</span>
												</h3>
												<p className="text-xs text-neutral-400 mt-0.5">{currentProg.tagline}</p>
											</div>
											<button
												onClick={() => {
													const routineText = `${currentProg.name}\n${currentProg.days
														.map((d) => `${d.day} (${d.focus}):\n- ${d.exercises.join('\n- ')}`)
														.join('\n\n')}`
													navigator.clipboard?.writeText(routineText)
													showToast(`Copied ${currentProg.name} Routine to Clipboard!`)
												}}
												className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
											>
												<svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
												</svg>
												<span>Copy Routine</span>
											</button>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
											{currentProg.days.map((d, i) => (
												<div
													key={i}
													className="group relative rounded-2xl border border-white/[0.08] bg-neutral-950/80 p-4.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-amber-500/40 hover:shadow-[0_4px_24px_rgba(245,158,11,0.1)] transition-all duration-300"
												>
													<div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2.5">
														<span className="text-sm font-bold text-white tracking-tight font-sans">
															{d.day}
														</span>
														<span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 tracking-wide">
															{d.focus}
														</span>
													</div>
													<ul className="space-y-2 text-xs font-sans">
														{d.exercises.map((ex, eIdx) => {
															const match = ex.match(/^(.*?)\s*(\(.*?\))$/)
															const exName = match ? match[1] : ex
															const exReps = match ? match[2].replace(/[()]/g, '') : null

															return (
																<li key={eIdx} className="flex items-center justify-between gap-2 text-neutral-300">
																	<div className="flex items-center gap-2 min-w-0">
																		<span className="size-1.5 rounded-full bg-amber-400 shrink-0" />
																		<span className="truncate">{exName}</span>
																	</div>
																	{exReps && (
																		<span className="shrink-0 font-mono text-[10px] text-amber-300/90 font-medium px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
																			{exReps}
																		</span>
																	)}
																</li>
															)
														})}
													</ul>
												</div>
											))}
										</div>
									</div>
								)
							})()}
						</div>
					)}

					{/* 3. EQUIPMENT VAULT */}
					{activeModal === 'equipment' && (
						<div className="font-sans">
							<div className="mb-5">
								<h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
									Heavy Iron & Biomechanical Stations
								</h2>
								<p className="text-xs text-neutral-400 mt-0.5">
									Every barbell, cable stack, and plate-loaded station calibrated for joint safety and optimal resistance curves.
								</p>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
								{EQUIPMENT_DATA.map((eq, i) => (
									<div
										key={i}
										className="rounded-2xl border border-white/[0.08] bg-neutral-900/60 p-4 hover:border-amber-400/40 hover:bg-neutral-900/90 transition-all"
									>
										<div className="flex items-start justify-between gap-2 mb-2">
											<div>
												<span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide block mb-0.5">
													{eq.category}
												</span>
												<h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">{eq.name}</h3>
											</div>
											<span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 shrink-0">
												{eq.status}
											</span>
										</div>
										<p className="text-xs text-neutral-300 mb-3 leading-relaxed">{eq.specs}</p>
										<div className="rounded-xl bg-black/40 p-2 text-[11px] font-mono text-neutral-300 border border-white/5 flex items-center gap-2">
											<span className="text-amber-400 font-bold">Inventory:</span>
											<span>{eq.quantity}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* 4. ATHLETE NUTRITION ARCHITECT */}
					{activeModal === 'nutrition' && (
						<div>
							<AthleteNutritionView showToast={showToast} />
						</div>
					)}

					{/* 5. TIMINGS & BATCHES */}
					{activeModal === 'timings' && (
						<div className="font-sans">
							<div className="mb-4">
								<h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
									Training Batches & Operating Hours
								</h2>
								<p className="text-xs text-neutral-400 mt-0.5">
									Structured training slots with dedicated floor coaches and biomechanics guidance.
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
								{/* Morning */}
								<div className="rounded-2xl border border-white/[0.08] bg-neutral-900/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
									<div className="flex items-center gap-2.5 mb-3">
										<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
											<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2m-7.07-14.93 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
											</svg>
										</div>
										<h3 className="text-base font-bold text-white tracking-tight">Morning Sessions</h3>
										<span className="ml-auto rounded bg-amber-400/10 text-amber-400 px-2 py-0.5 text-[10px] font-bold">
											05:30 AM – 11:30 AM
										</span>
									</div>
									<div className="space-y-3 text-xs text-neutral-300">
										<div className="border-l-2 border-amber-400 pl-3">
											<div className="font-bold text-white">05:30 AM – 07:30 AM</div>
											<div className="text-neutral-400">Early Bird Powerlifters & Heavy Compounds</div>
										</div>
										<div className="border-l-2 border-white/20 pl-3">
											<div className="font-bold text-white">07:30 AM – 09:30 AM</div>
											<div className="text-neutral-400">Executive & Professional Hypertrophy</div>
										</div>
										<div className="border-l-2 border-white/20 pl-3">
											<div className="font-bold text-white">09:30 AM – 11:30 AM</div>
											<div className="text-neutral-400">Cardio Conditioning & Dedicated Floor Coaching</div>
										</div>
									</div>
								</div>

								{/* Evening */}
								<div className="rounded-2xl border border-white/[0.08] bg-neutral-900/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
									<div className="flex items-center gap-2.5 mb-3">
										<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
											<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
											</svg>
										</div>
										<h3 className="text-base font-bold text-white tracking-tight">Evening Sessions</h3>
										<span className="ml-auto rounded bg-amber-400/10 text-amber-400 px-2 py-0.5 text-[10px] font-bold">
											04:30 PM – 10:30 PM
										</span>
									</div>
									<div className="space-y-3 text-xs text-neutral-300">
										<div className="border-l-2 border-amber-400 pl-3">
											<div className="font-bold text-white">04:30 PM – 06:30 PM</div>
											<div className="text-white/60">Student & Athletic Hypertrophy Batch</div>
										</div>
										<div className="border-l-2 border-white/20 pl-3">
											<div className="font-bold text-white">06:30 PM – 08:30 PM</div>
											<div className="text-white/60">Prime Rush Hour (All Platforms Active)</div>
										</div>
										<div className="border-l-2 border-white/20 pl-3">
											<div className="font-bold text-white">08:30 PM – 10:30 PM</div>
											<div className="text-white/60">Night Owls & Focused Heavy Iron Sessions</div>
										</div>
									</div>
								</div>
							</div>

							{/* Sunday & Coach Note */}
							<div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
								<div>
									<span className="font-bold text-amber-400 uppercase tracking-wide">Sunday Open Platform:</span>
									<span className="ml-2 text-white/80">06:00 AM – 01:00 PM (Recovery & Deadlift focus)</span>
								</div>
								<div className="text-white/60">
									Direct Trainer Hotline: <span className="text-white font-mono font-bold">+91 98765 43210</span>
								</div>
							</div>
						</div>
					)}

					{/* 6. ATHLETE ROSTER & MEMBERS PORTAL */}
					{activeModal === 'members' && (
						<div className="font-sans">
							<MemberTrackerView showToast={showToast} onClose={closeModal} />
						</div>
					)}

					{/* 5. LIA COMMAND (EXECUTIVE MANAGEMENT SUITE) */}
					{activeModal === 'owner' && (
						!isOwner ? (
							<div className="rounded-3xl border border-amber-400/30 bg-neutral-900/90 p-8 text-center max-w-md mx-auto my-12 space-y-4">
								<div className="size-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 mx-auto">
									<svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
									</svg>
								</div>
								<div>
									<h3 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
										LIA Command Restricted
									</h3>
									<p className="text-xs text-white/60 mt-1.5">
										LIA Command contains financial targets, revenue ledger, and member management. Only authenticated gym founders can access this suite.
									</p>
								</div>
								<div className="pt-2">
									<button
										onClick={() => openModal('auth')}
										className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
									>
										<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
											<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
											<path d="M7 11V7a5 5 0 0 1 10 0v4" />
										</svg>
										<span>Authenticate LIA Command</span>
									</button>
								</div>
							</div>
						) : (
							<div className="font-sans space-y-5">
								{/* 1. Sleek Mobile-First Header */}
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-white/10 pb-4">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
												LIA Executive Command
											</h2>
											<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
												<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
												Admin Verified
											</span>
										</div>
										<p className="text-xs text-neutral-400">
											Turnstile operations, financial ledger & athlete management suite.
										</p>
									</div>

									{/* Action Pills: Single-line, never breaks text on mobile! */}
									<div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
										<button
											onClick={() => {
												setCheckInCount((c) => {
													const next = c + 1
													saveOwnerProfileData({ ...ownerProfile, todayCheckins: next })
													return next
												})
												showToast(`Turnstile entry logged! Total today: ${checkInCount + 1}`)
											}}
											className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-2.5 sm:px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
										>
											<span>⚡ Check-in</span>
											<span className="rounded-full bg-black/25 px-1.5 py-0.2 text-[10px] font-mono">+{checkInCount}</span>
										</button>

										<button
											type="button"
											onClick={() => {
												exportMembersToCsv(membersList, ownerProfile)
												showToast('Roster & Revenue Ledger exported to CSV!')
											}}
											className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/90 px-2.5 sm:px-3.5 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap shadow-sm cursor-pointer"
										>
											<svg className="size-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
												<polyline points="7 10 12 15 17 10" />
												<line x1="12" x2="12" y1="15" y2="3" />
											</svg>
											<span>Export</span>
										</button>

										<button
											type="button"
											onClick={() => {
												logout()
												showToast('Signed out of LIA Command')
												closeModal()
											}}
											className="rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-2.5 sm:px-3.5 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap shadow-sm cursor-pointer"
										>
											<svg className="size-3.5 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
											</svg>
											<span>Sign Out</span>
										</button>
									</div>
								</div>

								{/* 2. Founder & Financial Profile Card (No messy floating bullets) */}
								<div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-white/[0.04] via-black/40 to-transparent p-4 sm:p-5 shadow-xl space-y-3.5">
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-3 min-w-0">
											<div className="size-11 sm:size-12 rounded-2xl border border-amber-400/40 bg-amber-400/10 flex items-center justify-center text-amber-300 shrink-0 text-xl shadow-inner">
												👑
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<h3 className="font-bold text-sm sm:text-base text-white truncate">{ownerProfile.ownerName}</h3>
													<span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[9px] font-bold text-amber-300 uppercase shrink-0">
														Founder
													</span>
												</div>
												<div className="text-xs text-neutral-400 truncate mt-0.5">{ownerProfile.gymName} • Master Operational Command</div>
											</div>
										</div>

										<div className="flex items-center gap-2 shrink-0">
											<span
												className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
													cloudSyncActive
														? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
														: 'bg-white/5 text-white/50 border border-white/10'
												}`}
											>
												<span className={`size-1.5 rounded-full ${cloudSyncActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
												{cloudSyncActive ? 'Cloud Active' : 'Local Storage'}
											</span>
											<button
												type="button"
												onClick={() => setIsEditingProfile(!isEditingProfile)}
												className="rounded-xl border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
											>
												<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
													<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
												</svg>
												<span>{isEditingProfile ? 'Close' : 'Edit Credentials'}</span>
											</button>
										</div>
									</div>

									{/* Clean Info Capsules (No ugly floating bullets) */}
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
										<div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/50 px-3 py-2">
											<span className="text-[10px] uppercase font-semibold text-neutral-400">Email</span>
											<span className="font-medium text-white truncate max-w-[190px]">{ownerProfile.email}</span>
										</div>
										<div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/50 px-3 py-2">
											<span className="text-[10px] uppercase font-semibold text-neutral-400">Phone</span>
											<span className="font-medium text-white font-mono">{ownerProfile.phone}</span>
										</div>
										<button
											onClick={() => {
												navigator.clipboard?.writeText(ownerProfile.upiId)
												showToast(`Copied UPI ID "${ownerProfile.upiId}" to clipboard!`)
											}}
											className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-black/50 hover:bg-white/5 px-3 py-2 transition-all group text-left cursor-pointer"
											title="Click to copy UPI ID"
										>
											<span className="text-[10px] uppercase font-semibold text-amber-300/80">UPI Fee ID</span>
											<span className="font-mono text-amber-300 font-semibold flex items-center gap-1 truncate">
												<span>{ownerProfile.upiId}</span>
												<svg className="size-3 text-amber-400/70 group-hover:text-amber-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
													<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
													<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
												</svg>
											</span>
										</button>
									</div>
								</div>

								{/* 3. Owner Profile Editor Drawer (When Open) */}
								{isEditingProfile && (
									<div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.04] p-4 sm:p-5 space-y-4">
										<div className="flex items-center justify-between border-b border-white/10 pb-3">
											<div>
												<h4 className="text-sm font-bold text-white uppercase tracking-wider">
													Edit Owner Profile & Credentials
												</h4>
												<p className="text-[11px] text-neutral-400">Change your login email, master password, UPI ID and gym targets.</p>
											</div>
											<span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
												Instant Cloud Sync
											</span>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
											<div>
												<label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">Owner Name</label>
												<input
													type="text"
													value={ownerProfile.ownerName}
													onChange={(e) => setOwnerProfile({ ...ownerProfile, ownerName: e.target.value })}
													className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3.5 py-2 text-white focus:border-amber-400 focus:outline-none"
												/>
											</div>
											<div>
												<label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">Gym Name</label>
												<input
													type="text"
													value={ownerProfile.gymName}
													onChange={(e) => setOwnerProfile({ ...ownerProfile, gymName: e.target.value })}
													className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3.5 py-2 text-white focus:border-amber-400 focus:outline-none"
												/>
											</div>
											<div>
												<label className="text-[10px] uppercase font-semibold text-amber-300 block mb-1">Owner Login Email</label>
												<input
													type="email"
													value={ownerProfile.email}
													onChange={(e) => setOwnerProfile({ ...ownerProfile, email: e.target.value.trim().toLowerCase() })}
													className="w-full rounded-xl border border-amber-400/40 bg-neutral-900 px-3.5 py-2 text-white focus:border-amber-400 focus:outline-none"
												/>
											</div>
											<div>
												<label className="text-[10px] uppercase font-semibold text-amber-300 block mb-1">Change Master Password</label>
												<input
													type="text"
													placeholder="Leave blank to keep current"
													value={ownerPasswordInput}
													onChange={(e) => setOwnerPasswordInput(e.target.value)}
													className="w-full rounded-xl border border-amber-400/40 bg-neutral-900 px-3.5 py-2 text-white placeholder-white/30 focus:border-amber-400 focus:outline-none font-mono"
												/>
											</div>
											<div>
												<label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">Phone / WhatsApp</label>
												<input
													type="tel"
													value={ownerProfile.phone}
													onChange={(e) => setOwnerProfile({ ...ownerProfile, phone: e.target.value })}
													className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3.5 py-2 text-white focus:border-amber-400 focus:outline-none"
												/>
											</div>
											<div>
												<label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">UPI ID (For Fees)</label>
												<input
													type="text"
													value={ownerProfile.upiId}
													onChange={(e) => setOwnerProfile({ ...ownerProfile, upiId: e.target.value })}
													className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3.5 py-2 text-white focus:border-amber-400 focus:outline-none"
												/>
											</div>
											<div>
												<label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">Monthly Target (₹)</label>
												<input
													type="number"
													value={ownerProfile.monthlyTarget}
													onChange={(e) => setOwnerProfile({ ...ownerProfile, monthlyTarget: Number(e.target.value) })}
													className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3.5 py-2 text-white focus:border-amber-400 focus:outline-none"
												/>
											</div>
										</div>

										{/* Payment QR Code Uploader */}
										<div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col sm:flex-row items-center gap-4">
											<div className="relative size-32 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-white p-2 shadow-xl flex items-center justify-center">
												{ownerProfile.qrCodeUrl ? (
													<img src={ownerProfile.qrCodeUrl} alt="Owner Custom QR" className="size-full object-contain" />
												) : autoQrDataUrl ? (
													<img src={autoQrDataUrl} alt="Auto UPI Vector QR" className="size-full object-contain" />
												) : (
													<div className="text-center text-[10px] text-black/50">Generating QR...</div>
												)}
											</div>
											<div className="flex-1 space-y-2 text-center sm:text-left">
												<div className="font-bold text-white text-xs">Gym Payment QR Code (PhonePe / GPay / Paytm)</div>
												<p className="text-[11px] text-neutral-400">
													Upload your gym&apos;s official standee QR image. Athletes scanning to pay fees or receiving WhatsApp reminders will see this official QR code.
												</p>
												<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
													<button
														type="button"
														onClick={() => qrFileInputRef.current?.click()}
														className="rounded-xl border border-amber-400 bg-amber-400/20 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/30 transition-all cursor-pointer"
													>
														{ownerProfile.qrCodeUrl ? 'Change QR Image' : 'Upload Standee QR'}
													</button>
													{ownerProfile.qrCodeUrl && (
														<button
															type="button"
															onClick={() => {
																setOwnerProfile((prev) => ({ ...prev, qrCodeUrl: '' }))
																showToast('Reset to Auto-Generated UPI QR code.')
															}}
															className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white transition-all cursor-pointer"
														>
															Reset to Auto UPI QR
														</button>
													)}
												</div>
											</div>
										</div>

										<div className="flex justify-end gap-2 pt-2 border-t border-white/10">
											<button
												type="button"
												onClick={() => {
													const updatedProfile = { ...ownerProfile }
													saveOwnerProfileData(updatedProfile)
													setOwnerProfile(updatedProfile)
													if (user) {
														updateSessionUser({
															...user,
															email: updatedProfile.email,
															name: updatedProfile.ownerName
														})
													}
													setOwnerPasswordInput('')
													setIsEditingProfile(false)
													showToast('Owner credentials & profile saved successfully!')
												}}
												className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 text-xs font-bold text-black uppercase tracking-wider hover:brightness-105 transition-all shadow-md cursor-pointer"
											>
												Save Profile & Credentials
											</button>
										</div>
									</div>
								)}

								{/* 4. Interactive Equal-Height KPI Grid with Click Handlers */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									{/* Active Athletes Card */}
									<div
										onClick={() => setViewingKpiModal('active')}
										className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-emerald-500/50 hover:bg-emerald-500/[0.05] p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] shadow-sm group"
										title="Click to view Active Athletes List"
									>
										<div>
											<div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
												<span>Active Members</span>
												<span className="text-[10px] text-emerald-400 group-hover:translate-x-0.5 transition-transform">→</span>
											</div>
											<div className="text-2xl font-black text-white font-mono">{activeMembersCount}</div>
										</div>
										<div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
											<span className="size-1.5 rounded-full bg-emerald-400" />
											<span>Tap to view roster</span>
										</div>
									</div>

									{/* Month Revenue Card */}
									<div
										onClick={() => setViewingKpiModal('revenue')}
										className="rounded-2xl border border-amber-400/30 bg-white/[0.03] hover:border-amber-400 hover:bg-amber-400/[0.05] p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] shadow-sm group"
										title="Click to view Revenue Target & Financial Ledger"
									>
										<div>
											<div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
												<span>Month Revenue</span>
												<span className="text-[10px] text-amber-300 group-hover:translate-x-0.5 transition-transform">→</span>
											</div>
											<div className="text-2xl font-black text-amber-300 font-mono">
												₹{monthRevenue.toLocaleString('en-IN')}
											</div>
										</div>
										<div className="text-[10px] text-neutral-400 mt-2 truncate font-medium">
											Target: ₹{ownerProfile.monthlyTarget.toLocaleString('en-IN')} • Ledger
										</div>
									</div>

									{/* Pending Dues Card */}
									<div
										onClick={() => setViewingKpiModal('dues')}
										className="rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:border-rose-400 hover:bg-rose-500/15 p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] shadow-sm group"
										title="Click to view Pending Dues & Send WhatsApp Alerts"
									>
										<div>
											<div className="flex items-center justify-between text-[10px] font-semibold text-rose-300 uppercase tracking-wider mb-1">
												<span>Pending Dues</span>
												<span className="text-[10px] text-rose-300 group-hover:translate-x-0.5 transition-transform">→</span>
											</div>
											<div className="text-2xl font-black text-rose-400 font-mono">
												₹{pendingDues.toLocaleString('en-IN')}
											</div>
										</div>
										<div className="text-[10px] text-rose-300/80 mt-2 truncate font-medium">
											{expiredMembers.length === 0 ? 'All dues cleared' : `${expiredMembers.length} due • Send WhatsApp`}
										</div>
									</div>

									{/* Today's Check-ins Card */}
									<div
										onClick={() => {
											setCheckInCount((c) => {
												const next = c + 1
												saveOwnerProfileData({ ...ownerProfile, todayCheckins: next })
												return next
											})
											showToast(`Turnstile entry logged! Total today: ${checkInCount + 1}`)
										}}
										className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-400/50 hover:bg-amber-400/[0.05] p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] shadow-sm group"
										title="Click to log +1 check-in"
									>
										<div>
											<div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
												<span>Today&apos;s Check-ins</span>
												<span className="text-[10px] text-amber-400 group-hover:translate-x-0.5 transition-transform">+1</span>
											</div>
											<div className="text-2xl font-black text-white font-mono">{checkInCount}</div>
										</div>
										<div className="text-[10px] text-emerald-400 mt-2 font-medium">
											{checkInCount === 0 ? 'Gate open • Tap to log' : `${checkInCount} check-in(s) • Tap to +1`}
										</div>
									</div>
								</div>

								{/* 5. Compact Floor Maintenance Log */}
								<div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
									<div className="flex items-center justify-between">
										<h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
											<span>Floor Maintenance Status</span>
											<span className="size-1.5 rounded-full bg-emerald-400" />
										</h3>
										<button
											onClick={() => {
												setMaintenanceLogged(true)
												showToast('Daily equipment checklist verified!')
											}}
											disabled={maintenanceLogged}
											className="rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold text-white/80 transition-all cursor-pointer disabled:opacity-50"
										>
											{maintenanceLogged ? '✓ Verified Today' : 'Mark Inspected'}
										</button>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
										<div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
											<span className="text-neutral-300">Cable Jungle & Pulleys</span>
											<span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Good</span>
										</div>
										<div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
											<span className="text-neutral-300">Benches & Heavy Pins</span>
											<span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Certified</span>
										</div>
										<div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
											<span className="text-neutral-300">HVAC Air Circulation</span>
											<span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
										</div>
									</div>
								</div>

								{/* 6. Embedded Full Athlete Management Suite */}
								<div className="pt-2">
									<MemberTrackerView showToast={showToast} />
								</div>

								{/* 7. MODAL: Active Athletes Details */}
								{viewingKpiModal === 'active' && (
									<div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 font-sans">
										<div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setViewingKpiModal(null)} />
										<div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-emerald-500/30 bg-neutral-950 p-5 sm:p-6 shadow-2xl flex flex-col text-white">
											<div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
												<div>
													<h3 className="text-lg font-bold text-white flex items-center gap-2">
														<span>Active Athletes on Floor</span>
														<span className="rounded-full bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 font-bold font-mono">
															{activeMembersList.length} Active
														</span>
													</h3>
													<p className="text-xs text-neutral-400">Lifters with valid, paid gym memberships authorized for entry.</p>
												</div>
												<button onClick={() => setViewingKpiModal(null)} className="size-8 rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer">
													✕
												</button>
											</div>

											<div className="flex-1 overflow-y-auto py-4 space-y-2.5">
												{activeMembersList.length === 0 ? (
													<div className="text-center py-12 text-neutral-400 text-xs">
														No active lifters enrolled yet. Click &quot;+ Add Athlete&quot; to onboard your first member.
													</div>
												) : (
													activeMembersList.map((m) => {
														const diff = new Date(m.expiryDate).getTime() - new Date().setHours(0, 0, 0, 0)
														const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
														return (
															<div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-emerald-500/30 transition-all">
																<div className="flex items-center gap-3 min-w-0">
																	<div className="size-10 rounded-xl overflow-hidden border border-white/15 bg-neutral-800 shrink-0">
																		<img src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} alt={m.name} className="size-full object-cover" />
																	</div>
																	<div className="min-w-0">
																		<div className="font-bold text-sm text-white truncate">{m.name}</div>
																		<div className="text-xs text-neutral-400 truncate">{m.plan}</div>
																		<div className="text-[11px] text-emerald-400 font-mono mt-0.5">{m.phone}</div>
																	</div>
																</div>
																<div className="text-right shrink-0">
																	<span className="inline-block rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 font-mono">
																		{daysLeft}d left
																	</span>
																	<div className="text-[10px] text-neutral-500 mt-1">Exp: {m.expiryDate}</div>
																</div>
															</div>
														)
													})
												)}
											</div>

											<div className="border-t border-white/10 pt-3 flex justify-between items-center shrink-0">
												<span className="text-xs text-neutral-400">Total Active: {activeMembersList.length}</span>
												<button
													onClick={() => setViewingKpiModal(null)}
													className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
												>
													Close Roster
												</button>
											</div>
										</div>
									</div>
								)}

								{/* 8. MODAL: Monthly Revenue Ledger */}
								{viewingKpiModal === 'revenue' && (
									<div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 font-sans">
										<div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setViewingKpiModal(null)} />
										<div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-amber-400/30 bg-neutral-950 p-5 sm:p-6 shadow-2xl flex flex-col text-white">
											<div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
												<div>
													<h3 className="text-lg font-bold text-white flex items-center gap-2">
														<span>Monthly Revenue & Financial Ledger</span>
														<span className="rounded-full bg-amber-400/20 text-amber-300 text-xs px-2 py-0.5 font-bold font-mono">
															₹{monthRevenue.toLocaleString('en-IN')}
														</span>
													</h3>
													<p className="text-xs text-neutral-400">Real-time collections, plan breakdown and targets.</p>
												</div>
												<button onClick={() => setViewingKpiModal(null)} className="size-8 rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer">
													✕
												</button>
											</div>

											<div className="flex-1 overflow-y-auto py-4 space-y-4">
												{/* Big Target Bar */}
												<div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.04] p-4 space-y-2">
													<div className="flex items-center justify-between text-xs">
														<span className="text-neutral-400">Target Progress</span>
														<span className="font-bold text-amber-300 font-mono">
															₹{monthRevenue.toLocaleString('en-IN')} / ₹{ownerProfile.monthlyTarget.toLocaleString('en-IN')} ({Math.min(100, Math.round((monthRevenue / (ownerProfile.monthlyTarget || 1)) * 100))}%)
														</span>
													</div>
													<div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
														<div
															className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
															style={{ width: `${Math.min(100, Math.max(5, (monthRevenue / (ownerProfile.monthlyTarget || 1)) * 100))}%` }}
														/>
													</div>
												</div>

												{/* Plan Breakdown Chips */}
												<div>
													<div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Revenue by Plan Duration</div>
													<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
														{[
															{ name: '1 Month', price: 1500 },
															{ name: '3 Months', price: 4000 },
															{ name: '6 Months', price: 7000 },
															{ name: '1 Year', price: 12000 },
															{ name: 'Personal Training', price: 6000 }
														].map((tier) => {
															const count = membersList.filter((m) => m.plan.includes(tier.name)).length
															const rev = count * tier.price
															return (
																<div key={tier.name} className="p-3 rounded-xl border border-white/10 bg-white/[0.03]">
																	<div className="text-[11px] text-neutral-300 font-medium truncate">{tier.name}</div>
																	<div className="text-base font-bold text-white mt-1 font-mono">₹{rev.toLocaleString('en-IN')}</div>
																	<div className="text-[10px] text-neutral-500">{count} enrolled (₹{tier.price.toLocaleString('en-IN')}/ea)</div>
																</div>
															)
														})}
													</div>
												</div>

												{/* Athlete Contribution List */}
												<div>
													<div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Member Contributions ({membersList.length})</div>
													<div className="space-y-1.5 max-h-48 overflow-y-auto">
														{membersList.length === 0 ? (
															<div className="text-center py-6 text-neutral-500 text-xs">No ledger entries recorded yet.</div>
														) : (
															membersList.map((m) => (
																<div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/40 text-xs">
																	<div>
																		<div className="font-semibold text-white">{m.name}</div>
																		<div className="text-[10px] text-neutral-400">{m.plan}</div>
																	</div>
																	<div className="font-mono font-bold text-amber-300">
																		+₹{getPlanPrice(m.plan).toLocaleString('en-IN')}
																	</div>
																</div>
															))
														)}
													</div>
												</div>
											</div>

											<div className="border-t border-white/10 pt-3 flex justify-between items-center shrink-0">
												<button
													onClick={() => {
														exportMembersToCsv(membersList, ownerProfile)
														showToast('Revenue Ledger exported to CSV!')
													}}
													className="rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 px-3.5 py-2 text-xs font-bold text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer"
												>
													<span>Export CSV Ledger</span>
												</button>
												<button
													onClick={() => setViewingKpiModal(null)}
													className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
												>
													Close Ledger
												</button>
											</div>
										</div>
									</div>
								)}

								{/* 9. MODAL: Pending Dues & Recovery Radar */}
								{viewingKpiModal === 'dues' && (
									<div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 font-sans">
										<div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setViewingKpiModal(null)} />
										<div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-rose-500/30 bg-neutral-950 p-5 sm:p-6 shadow-2xl flex flex-col text-white">
											<div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
												<div>
													<h3 className="text-lg font-bold text-white flex items-center gap-2">
														<span>Pending Dues & Recovery Radar</span>
														<span className="rounded-full bg-rose-500/20 text-rose-300 text-xs px-2 py-0.5 font-bold font-mono">
															₹{pendingDues.toLocaleString('en-IN')} Due
														</span>
													</h3>
													<p className="text-xs text-neutral-400">Members with expired passes or concluding in ≤3 days.</p>
												</div>
												<button onClick={() => setViewingKpiModal(null)} className="size-8 rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer">
													✕
												</button>
											</div>

											<div className="flex-1 overflow-y-auto py-4 space-y-2.5">
												{dueAndExpiringMembers.length === 0 ? (
													<div className="text-center py-12 text-emerald-400 text-xs">
														🎉 All athlete passes are currently valid! Zero pending fee dues.
													</div>
												) : (
													dueAndExpiringMembers.map((m) => {
														const diff = new Date(m.expiryDate).getTime() - new Date().setHours(0, 0, 0, 0)
														const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
														const isExpired = daysLeft < 0
														const feeAmount = getPlanPrice(m.plan)

														return (
															<div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04]">
																<div className="flex items-center gap-3 min-w-0">
																	<div className="size-10 rounded-xl overflow-hidden border border-rose-500/30 bg-neutral-800 shrink-0">
																		<img src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} alt={m.name} className="size-full object-cover" />
																	</div>
																	<div className="min-w-0">
																		<div className="font-bold text-sm text-white truncate">{m.name}</div>
																		<div className="text-xs text-neutral-400">{m.plan} • <span className="text-rose-400 font-mono font-bold">₹{feeAmount.toLocaleString('en-IN')} Due</span></div>
																		<div className="text-[11px] text-neutral-500 font-mono">{m.phone}</div>
																	</div>
																</div>

																<div className="flex items-center gap-2 justify-end">
																	<span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono ${isExpired ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-400/20 text-amber-300'}`}>
																		{isExpired ? 'Expired' : `${daysLeft}d left`}
																	</span>
																	{/* 1-Click WhatsApp Alert button */}
																	<button
																		onClick={() => {
																			const message = formatWhatsAppReminder({
																				memberName: m.name,
																				planName: m.plan,
																				expiryDate: m.expiryDate,
																				daysLeft,
																				amount: feeAmount,
																				upiId: ownerProfile.upiId,
																				ownerName: ownerProfile.ownerName,
																				ownerPhone: ownerProfile.phone,
																				gymName: ownerProfile.gymName
																			})
																			const waUrl = getWhatsAppUrl(m.phone, message)
																			window.open(waUrl, '_blank')
																			showToast(`WhatsApp due alert dispatched to ${m.name}!`)
																		}}
																		className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
																	>
																		<svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
																			<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
																		</svg>
																		<span>WhatsApp</span>
																	</button>
																</div>
															</div>
														)
													})
												)}
											</div>

											<div className="border-t border-white/10 pt-3 flex justify-between items-center shrink-0">
												<span className="text-xs text-neutral-400">Total Dues: ₹{pendingDues.toLocaleString('en-IN')}</span>
												<button
													onClick={() => setViewingKpiModal(null)}
													className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
												>
													Close Radar
												</button>
											</div>
										</div>
									</div>
								)}
							</div>
						)
					)}

				</div>

			</div>
		</div>
	)
}
