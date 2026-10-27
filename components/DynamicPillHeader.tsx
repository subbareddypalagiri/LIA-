'use client'
'use no memo'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGymModal, openGymModal } from '@/store/gymHub'
import { useAuth } from '@/store/authStore'
import DesktopStudioPopover from '@/components/DesktopStudioPopover'
import MemberTrackerModal from '@/components/MemberTrackerModal'
import PwaNavInstallButton from '@/components/PwaNavInstallButton'

export default function DynamicPillHeader() {
	const pathname = usePathname()
	const [isVisible, setIsVisible] = useState(true)
	const [isHovered, setIsHovered] = useState(false)
	const [lastScrollY, setLastScrollY] = useState(0)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [isMounted, setIsMounted] = useState(false)
	const { activeModal } = useGymModal()
	const { user, isOwner, isMember, logout } = useAuth()

	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [isMobileMenuOpen])

	// Gentle auto-hide scroll listener (disabled when mobile menu is open)
	useEffect(() => {
		const handleScroll = () => {
			if (isMobileMenuOpen) return
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
	}, [lastScrollY, isMobileMenuOpen])

	if (pathname?.startsWith('/background-preview')) {
		return null
	}

	const handleNavAction = (modalType: Parameters<typeof openGymModal>[0]) => {
		setIsMobileMenuOpen(false)
		openGymModal(modalType)
	}

	const handleLogout = () => {
		logout()
		setIsMobileMenuOpen(false)
	}

	return (
		<>
			<header
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className={`fixed top-3.5 sm:top-5 left-1/2 -translate-x-1/2 z-50 max-w-[96vw] sm:max-w-fit transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
					isVisible
						? 'translate-y-0 opacity-100 scale-100'
						: '-translate-y-28 opacity-0 scale-95 pointer-events-none'
				}`}
			>
				<nav
					className={`relative flex items-center justify-between gap-2 sm:gap-5 rounded-full px-2 py-1.5 sm:px-2.5 sm:py-2 select-none transition-all duration-300 ease-out ${
						isHovered || isMobileMenuOpen
							? 'bg-neutral-950/95 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-white/10'
							: 'bg-neutral-950/40 border border-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]'
					}`}
				>
					{/* 1. LEFT: Circular White Emblem Disc (Saturn Motif) */}
					<Link
						href="/"
						title="LIA Iron Club Home"
						className="group relative flex size-9 sm:size-10 items-center justify-center rounded-full bg-white text-black shadow-md transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
					>
						<svg
							className="size-5 sm:size-5.5 text-neutral-900 transition-transform duration-300 group-hover:rotate-12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.1" />
							<circle cx="12" cy="12" r="5" />
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

					{/* 2. CENTER: Desktop Minimalist Navigation Links (Hidden on mobile) */}
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

					{/* 3. RIGHT: Desktop Controls Cluster (Hidden on mobile) */}
					<div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
						<PwaNavInstallButton />
						<DesktopStudioPopover />

						{/* Role-based Capsule Action Button & Logout Control */}
						{isMember ? (
							<div className="flex items-center gap-1">
								<button
									type="button"
									onClick={() => openGymModal('my-membership')}
									className="rounded-full bg-white text-black font-bold text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-md hover:bg-neutral-200 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 font-sans"
								>
									<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
									<span>Pass: {user?.name.split(' ')[0]}</span>
								</button>
								<button
									type="button"
									onClick={handleLogout}
									title="Sign out of Athlete Account"
									className="flex size-7.5 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all cursor-pointer"
								>
									<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
								</button>
							</div>
						) : isOwner ? (
							<div className="flex items-center gap-1">
								<button
									type="button"
									onClick={() => openGymModal('owner')}
									className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-md hover:from-amber-300 hover:to-amber-400 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 font-sans"
								>
									<span className="size-1.5 rounded-full bg-black animate-pulse" />
									<span>LIA Command</span>
								</button>
								<button
									type="button"
									onClick={handleLogout}
									title="Sign out of Owner Account"
									className="flex size-7.5 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all cursor-pointer"
								>
									<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
								</button>
							</div>
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

						<MemberTrackerModal />
					</div>

					{/* 4. MOBILE CLUSTER: Clean, Compact, Professional (< 768px) */}
					<div className="flex md:hidden items-center gap-1.5 shrink-0">
						{/* Mobile High-Contrast Capsule Pass / Owner Button */}
						{isMember ? (
							<button
								type="button"
								onClick={() => openGymModal('my-membership')}
								className="rounded-full bg-white text-black font-bold text-xs px-3 py-1.5 shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
							>
								<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
								<span className="max-w-[75px] truncate">Pass: {user?.name.split(' ')[0]}</span>
							</button>
						) : isOwner ? (
							<button
								type="button"
								onClick={() => openGymModal('owner')}
								className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs px-3 py-1.5 shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
							>
								<span className="size-1.5 rounded-full bg-black animate-pulse" />
								<span>Owner</span>
							</button>
						) : (
							<button
								type="button"
								onClick={() => openGymModal('auth')}
								className="rounded-full bg-white text-black font-bold text-xs px-3 py-1.5 shadow-md active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
							>
								<span>Pass</span>
								<svg className="size-3 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
								</svg>
							</button>
						)}

						{/* Mobile Menu Pill Trigger Button */}
						<button
							type="button"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							aria-label="Toggle Navigation Menu"
							className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider flex items-center gap-1.5 transition-all duration-200 active:scale-95 border cursor-pointer ${
								isMobileMenuOpen
									? 'bg-amber-400 text-black border-amber-300 font-bold shadow-lg shadow-amber-400/25'
									: 'bg-white/10 text-white border-white/15 hover:bg-white/20'
							}`}
						>
							<span className="text-[11px] uppercase">Menu</span>
							{isMobileMenuOpen ? (
								<svg className="size-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							) : (
								<svg className="size-3.5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<line x1="4" y1="7" x2="20" y2="7" />
									<line x1="4" y1="12" x2="20" y2="12" />
									<line x1="4" y1="17" x2="20" y2="17" />
								</svg>
							)}
						</button>
					</div>
				</nav>
			</header>

			{/* 5. PORTALED MOBILE LUXURY NAVIGATION DRAWER */}
			{isMounted && isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
				<div className="fixed inset-0 z-[120] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/80 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
						onClick={() => setIsMobileMenuOpen(false)}
					/>

					{/* Glass Drawer Panel */}
					<div className="relative z-10 w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/20 bg-neutral-950/98 p-5 sm:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white animate-in slide-in-from-bottom-8 duration-300 flex flex-col gap-4">
						
						{/* Top Mobile Grab Bar */}
						<div className="flex sm:hidden justify-center -mt-2 pb-1">
							<div className="h-1 w-10 rounded-full bg-white/25" />
						</div>

						{/* Header: Brand & Close */}
						<div className="flex items-center justify-between border-b border-white/10 pb-3">
							<div className="flex items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-md">
									<svg
										className="size-5 text-neutral-950"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<circle cx="12" cy="12" r="5" />
										<ellipse cx="12" cy="12" rx="9.5" ry="3.5" transform="rotate(-25 12 12)" strokeWidth="1.8" />
									</svg>
								</div>
								<div>
									<h3 className="font-heading text-sm font-black tracking-wider uppercase text-white">
										LIA Iron Club
									</h3>
									<p className="text-[11px] text-neutral-300 tracking-wide uppercase">
										Hyper-Performance Movement System
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={() => setIsMobileMenuOpen(false)}
								className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-xs active:scale-90"
							>
								✕
							</button>
						</div>

						{/* Athlete & Owner Status Card */}
						{isOwner ? (
							<div className="rounded-3xl border border-amber-400/40 bg-gradient-to-br from-neutral-900/95 via-[#131109] to-neutral-950 p-4 shadow-[0_8px_32px_rgba(245,158,11,0.12)] space-y-3.5">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="size-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold text-base shadow-inner shrink-0">
											👑
										</div>
										<div>
											<div className="text-sm font-black text-white tracking-tight">
												{user?.name || 'Palagiri Subbareddy'}
											</div>
											<div className="text-[10px] text-amber-300 font-bold uppercase tracking-widest mt-0.5">
												Founder & Managing Director
											</div>
										</div>
									</div>
									<button
										onClick={handleLogout}
										className="rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3 py-1.5 text-xs font-semibold active:scale-95 transition-all shrink-0"
										title="Sign out of Account"
									>
										Sign Out
									</button>
								</div>

								{/* Big Executive Champagne Gold Launch Button */}
								<button
									onClick={() => handleNavAction('owner')}
									className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2"
								>
									<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
										<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
										<path d="M7 11V7a5 5 0 0 1 10 0v4" />
									</svg>
									<span>Launch LIA Command</span>
								</button>
							</div>) : isMember ? (
							<div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-3 flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<span className="relative flex size-2.5">
										<span className="inline-flex size-full rounded-full bg-emerald-400 animate-ping" />
										<span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
									</span>
									<div>
										<div className="text-xs font-bold text-white flex items-center gap-1.5">
											<span>{user?.name}</span>
											<span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 uppercase">
												Athlete
											</span>
										</div>
										<div className="text-[10px] text-white/50">{user?.plan} Membership Active</div>
									</div>
								</div>

								<div className="flex items-center gap-1.5">
									<button
										onClick={() => handleNavAction('my-membership')}
										className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-2 text-xs font-bold text-emerald-300 active:scale-95 transition-all min-h-[38px] flex items-center justify-center"
									>
										View Pass
									</button>
									<button
										onClick={handleLogout}
										className="rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3 py-2 text-xs font-semibold active:scale-95 transition-all min-h-[38px] flex items-center justify-center"
										title="Sign out of Athlete Account"
									>
										Logout
									</button>
								</div>
							</div>
						) : (
							/* GUEST LIFTER CARD (Clean & identical to reference screenshot) */
							<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<span className="size-2 rounded-full bg-white/40" />
									<div>
										<div className="text-xs font-bold text-white">Guest Lifter</div>
										<div className="text-[10px] text-white/50">Digital Pass Ready</div>
									</div>
								</div>

								<button
									onClick={() => handleNavAction('auth')}
									className="rounded-xl bg-white text-black px-4 py-2 text-xs font-bold active:scale-95 transition-all shadow-sm min-h-[38px] flex items-center justify-center"
								>
									Sign In
								</button>
							</div>
						)}

						{/* Core Navigation Items List */}
						<div className="space-y-2">
							<div className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1">
								Gym Command Navigation
							</div>

							{/* 1. Exercises */}
							<button
								onClick={() => handleNavAction('exercises')}
								className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-amber-400/50 hover:bg-neutral-900 active:scale-[0.98]"
							>
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
										<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
											<path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white flex items-center gap-1.5">
											<span>Movement Vault</span>
											<span className="rounded bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
												609 Protocols
											</span>
										</div>
										
									</div>
								</div>
								<svg className="size-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</button>

							{/* 2. Workout Splits */}
							<button
								onClick={() => handleNavAction('splits')}
								className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-amber-400/50 hover:bg-neutral-900 active:scale-[0.98]"
							>
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
										<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
											<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
											<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
											<path d="M9 14l2 2 4-4" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white flex items-center gap-1.5">
											<span>Workout Splits</span>
											<span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-semibold text-white/60">
												Hypertrophy
											</span>
										</div>
										
									</div>
								</div>
								<svg className="size-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</button>

							{/* 3. Equipment Biomechanics */}
							<button
								onClick={() => handleNavAction('equipment')}
								className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-amber-400/50 hover:bg-neutral-900 active:scale-[0.98]"
							>
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
										<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
											<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white flex items-center gap-1.5">
											<span>Equipment Biomechanics</span>
											<span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-semibold text-white/60">
												Ergonomics
											</span>
										</div>
										
									</div>
								</div>
								<svg className="size-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</button>

							{/* 4. Nutrition PRO */}
							<button
								onClick={() => handleNavAction('nutrition')}
								className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-amber-400/50 hover:bg-neutral-900 active:scale-[0.98]"
							>
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
										<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
											<path d="M18 6 6 18" />
											<path d="m20 10-4-4" />
											<path d="m4 14 4 4" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white flex items-center gap-1.5">
											<span>Athlete Nutrition</span>
											<span className="rounded bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 font-mono">
												PRO
											</span>
										</div>
										
									</div>
								</div>
								<svg className="size-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</button>

							{/* 5. Gym Hours & Timings */}
							<button
								onClick={() => handleNavAction('timings')}
								className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-amber-400/50 hover:bg-neutral-900 active:scale-[0.98]"
							>
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
										<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
											<circle cx="12" cy="12" r="10" />
											<polyline points="12 6 12 12 16 14" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white flex items-center gap-1.5">
											<span>Club Timings</span>
											<span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-300">
												5:00 AM – 10:30 PM
											</span>
										</div>
										
									</div>
								</div>
								<svg className="size-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</button>

							{/* 6. Members Portal */}
							<button
								onClick={() => handleNavAction('members')}
								className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-amber-400/50 hover:bg-neutral-900 active:scale-[0.98]"
							>
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
										<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
											<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
											<circle cx="9" cy="7" r="4" />
											<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
											<path d="M16 3.13a4 4 0 0 1 0 7.75" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white flex items-center gap-1.5">
											<span>Members Portal</span>
											<span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-300">
												Roster & Passes
											</span>
										</div>
									</div>
								</div>
								<svg className="size-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>

						{/* Secondary Utilities: Studio, Members Tracker, PWA */}
						<div className="pt-2 border-t border-white/10 space-y-2">
							<div className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1">
								Club Utilities & Command
							</div>

							<div className="grid grid-cols-2 gap-2">
								{/* 3D Studio Popover Trigger in Mobile Drawer */}
								<DesktopStudioPopover
									align="left"
									renderTrigger={(toggle, isOpen) => (
										<button
											type="button"
											onClick={toggle}
											className={`w-full flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold transition-all ${
												isOpen
													? 'border-amber-400 bg-amber-400/15 text-white'
													: 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
											}`}
										>
											<div className="flex items-center gap-2">
												<span className="size-2 rounded-full bg-amber-400" />
												<span>3D Studio</span>
											</div>
											<span className="text-[10px] text-white/40">Adjust</span>
										</button>
									)}
								/>

								{/* Lifter Roster Trigger in Mobile Drawer */}
								<MemberTrackerModal
									renderTrigger={(open, dueCount) => (
										<button
											type="button"
											onClick={() => {
												setIsMobileMenuOpen(false)
												open()
											}}
											className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all"
										>
											<div className="flex items-center gap-2">
												<span className="size-2 rounded-full bg-emerald-400" />
												<span>Lifters</span>
											</div>
											{dueCount > 0 ? (
												<span className="rounded bg-amber-400/20 text-amber-300 px-1 text-[9px] font-bold">
													{dueCount} Due
												</span>
											) : (
												<span className="text-[10px] text-emerald-400">Roster</span>
											)}
										</button>
									)}
								/>
							</div>

							{/* PWA App Install in Mobile Menu */}
							<div className="pt-1">
								<PwaNavInstallButton />
							</div>

							{/* Bottom Sign Out Button when Logged In */}
							{user && (
								<div className="pt-2">
									<button
										type="button"
										onClick={handleLogout}
										className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
									>
										<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
										</svg>
										<span>Sign Out of {isOwner ? 'LIA Command' : 'Athlete Account'}</span>
									</button>
								</div>
							)}
						</div>

						{/* Drawer Footer */}
						<div className="pt-2 border-t border-white/10 text-center text-[10px] text-white/40">
							LIA IRON CLUB • HYPER-PERFORMANCE GYM
						</div>
					</div>
				</div>,
				document.body
			)}
		</>
	)
}
