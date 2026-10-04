'use client'
'use no memo'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useGymModal, openGymModal } from '@/store/gymHub'
import { useAuth } from '@/store/authStore'
import DesktopStudioPopover from '@/components/DesktopStudioPopover'
import MemberTrackerModal from '@/components/MemberTrackerModal'
import PwaNavInstallButton from '@/components/PwaNavInstallButton'

export default function DynamicPillHeader() {
	const [isVisible, setIsVisible] = useState(true)
	const [isHovered, setIsHovered] = useState(false)
	const [lastScrollY, setLastScrollY] = useState(0)
	const { activeModal } = useGymModal()
	const { user, isOwner, isMember } = useAuth()

	// Gentle auto-hide scroll listener
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY

			// Always visible near top of page
			if (currentScrollY < 30) {
				setIsVisible(true)
			} else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 8) {
				// Scrolling down -> gently glide upwards out of view
				setIsVisible(false)
			} else if (lastScrollY - currentScrollY > 8) {
				// Scrolling up -> gently glide back in
				setIsVisible(true)
			}
			setLastScrollY(currentScrollY)
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [lastScrollY])

	return (
		<header
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={`fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 max-w-[96vw] sm:max-w-fit transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
				isVisible
					? 'translate-y-0 opacity-100 scale-100'
					: '-translate-y-28 opacity-0 scale-95 pointer-events-none'
			}`}
		>
			<nav
				className={`relative flex items-center justify-between gap-2 sm:gap-5 rounded-full px-2 py-1.5 sm:px-2.5 sm:py-2 select-none transition-all duration-300 ease-out ${
					isHovered
						? 'bg-neutral-950/95 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-white/10'
						: 'bg-neutral-950/30 border border-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]'
				}`}
			>
				{/* 1. LEFT: Circular White Emblem Disc (Matching Reference Image) */}
				<Link
					href="/"
					title="LIA Iron Club Home"
					className="group relative flex size-9 sm:size-10 items-center justify-center rounded-full bg-white text-black shadow-md transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
				>
					{/* Bespoke Saturn / Planet with Rings Vector Icon (from reference) */}
					<svg
						className="size-5 sm:size-5.5 text-neutral-900 transition-transform duration-300 group-hover:rotate-12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						{/* Planet Sphere */}
						<circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.1" />
						<circle cx="12" cy="12" r="5" />
						{/* Saturn Ring */}
						<ellipse
							cx="12"
							cy="12"
							rx="9.5"
							ry="3.5"
							transform="rotate(-25 12 12)"
							strokeWidth="1.8"
						/>
					</svg>
				</Link>

				{/* 2. CENTER: Minimalist Navigation Links (Desktop) */}
				<div className="hidden md:flex items-center gap-1 text-xs font-semibold tracking-wide font-sans">
					<button
						type="button"
						onClick={() => openGymModal('exercises')}
						className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
							activeModal === 'exercises'
								? 'bg-white/15 text-white font-bold'
								: 'text-neutral-300 hover:text-white hover:bg-white/10'
						}`}
					>
						Exercises
					</button>

					<button
						type="button"
						onClick={() => openGymModal('splits')}
						className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
							activeModal === 'splits'
								? 'bg-white/15 text-white font-bold'
								: 'text-neutral-300 hover:text-white hover:bg-white/10'
						}`}
					>
						Splits
					</button>

					<button
						type="button"
						onClick={() => openGymModal('equipment')}
						className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
							activeModal === 'equipment'
								? 'bg-white/15 text-white font-bold'
								: 'text-neutral-300 hover:text-white hover:bg-white/10'
						}`}
					>
						Equipment
					</button>

					<button
						type="button"
						onClick={() => openGymModal('nutrition')}
						className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1 cursor-pointer ${
							activeModal === 'nutrition'
								? 'bg-white/15 text-amber-300 font-bold'
								: 'text-neutral-300 hover:text-amber-300 hover:bg-white/10'
						}`}
					>
						<span>Nutrition</span>
						<span className="rounded bg-amber-400/20 px-1 py-0.2 text-[8px] font-mono font-bold text-amber-300">
							PRO
						</span>
					</button>

					<button
						type="button"
						onClick={() => openGymModal('timings')}
						className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
							activeModal === 'timings'
								? 'bg-white/15 text-white font-bold'
								: 'text-neutral-300 hover:text-white hover:bg-white/10'
						}`}
					>
						Timings
					</button>
				</div>

				{/* 3. RIGHT: Contrast Capsule Action Button & Controls */}
				<div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
					{/* PWA Install Button (if applicable) */}
					<PwaNavInstallButton />

					{/* 3D Studio Popover Trigger */}
					<DesktopStudioPopover />

					{/* High-Contrast White Capsule Button (Matching Reference Image) */}
					{isMember ? (
						<button
							type="button"
							onClick={() => openGymModal('my-membership')}
							className="rounded-full bg-white text-black font-bold text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-md hover:bg-neutral-200 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 font-sans"
						>
							<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span>Pass: {user?.name.split(' ')[0]}</span>
						</button>
					) : isOwner ? (
						<button
							type="button"
							onClick={() => openGymModal('owner')}
							className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-md hover:from-amber-300 hover:to-amber-400 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 font-sans"
						>
							<span>Owner Desk</span>
						</button>
					) : (
						<button
							type="button"
							onClick={() => openGymModal('auth')}
							className="rounded-full bg-white text-black font-bold text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-md hover:bg-neutral-200 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 font-sans"
						>
							<span>Member Pass</span>
							<svg className="size-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
							</svg>
						</button>
					)}

					{/* Athlete Roster / Tracker Drawer */}
					<MemberTrackerModal />
				</div>
			</nav>
		</header>
	)
}
