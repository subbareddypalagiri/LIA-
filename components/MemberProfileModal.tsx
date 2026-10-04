'use client'
'use no memo'
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { useAuth } from '@/store/authStore'
import { useGymModal } from '@/store/gymHub'

interface MemberProfileModalProps {
	showToast?: (msg: string) => void
}

export default function MemberProfileModal({ showToast }: MemberProfileModalProps) {
	const { closeModal, openModal } = useGymModal()
	const { user, logout } = useAuth()
	const [checkedInToday, setCheckedInToday] = useState(false)
	const [checkinCount, setCheckinCount] = useState(user?.checkinCount || 32)

	if (!user) return null

	const handleCheckIn = () => {
		if (checkedInToday) return
		setCheckedInToday(true)
		setCheckinCount((prev) => prev + 1)
		if (showToast) {
			showToast('Check-in logged successfully! Have a brutal workout! 🔥')
		}
	}

	// Calculate days remaining
	const expiryDateObj = user.expiryDate ? new Date(user.expiryDate) : new Date(Date.now() + 45 * 86400000)
	const now = new Date()
	const diffTime = expiryDateObj.getTime() - now.getTime()
	const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5">
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={closeModal} />

			{/* Modal Dialog */}
			<div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-white">
				{/* Top Bar */}
				<div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
					<div className="flex items-center gap-2.5">
						<div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
							<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<rect width="18" height="18" x="3" y="3" rx="2" />
								<circle cx="12" cy="10" r="3" />
								<path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
							</svg>
						</div>
						<div>
							<h3 className="font-heading text-lg font-black uppercase tracking-wide text-white">
								Digital Athlete Pass
							</h3>
							<p className="text-[11px] text-white/50">LIA Iron Club Official Membership</p>
						</div>
					</div>
					<button
						onClick={closeModal}
						className="flex size-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/60 hover:text-white"
					>
						✕
					</button>
				</div>

				{/* HOLOGRAPHIC GOLD MEMBERSHIP CARD */}
				<div className="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/40 p-5 shadow-2xl mb-6">
					{/* Carbon texture & glow */}
					<div className="absolute -top-12 -right-12 size-36 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

					<div className="flex items-start justify-between gap-4 mb-4">
						<div className="flex items-center gap-3">
							<div className="size-14 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-lg bg-neutral-800 shrink-0">
								<img
									src={
										user.avatar ||
										'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
									}
									alt={user.name}
									className="size-full object-cover"
								/>
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h4 className="font-heading text-base font-black uppercase text-white tracking-wide">
										{user.name}
									</h4>
									<span className="rounded-full bg-emerald-400/20 border border-emerald-400/40 px-2 py-0.2 text-[9px] font-bold text-emerald-300 flex items-center gap-1">
										<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
										Active
									</span>
								</div>
								<div className="text-xs text-white/60">{user.email}</div>
								{user.phone && <div className="text-[11px] text-amber-300/80 font-mono">{user.phone}</div>}
							</div>
						</div>

						<div className="text-right">
							<div className="font-bebas text-lg tracking-wider text-amber-400">LIA IRON CLUB</div>
							<div className="text-[9px] uppercase tracking-widest text-white/40">Tier Membership</div>
						</div>
					</div>

					{/* Plan & Expiry Details */}
					<div className="grid grid-cols-2 gap-3 rounded-xl bg-black/40 border border-white/10 p-3 mb-4 text-xs">
						<div>
							<div className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Plan Tier</div>
							<div className="font-bold text-white mt-0.5">{user.plan || '3 Months Hypertrophy Tier'}</div>
						</div>
						<div>
							<div className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Valid Until</div>
							<div className="font-bold text-amber-300 mt-0.5">
								{user.expiryDate || 'Nov 15, 2026'} ({daysRemaining} days left)
							</div>
						</div>
					</div>

					{/* Check-In Action Button */}
					<button
						onClick={handleCheckIn}
						disabled={checkedInToday}
						className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
							checkedInToday
								? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
								: 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-400/20 hover:brightness-110'
						}`}
					>
						<span>{checkedInToday ? '✓ Checked In for Today' : '🏋️ Tap to Check In (Floor Attendance)'}</span>
						<span className="rounded bg-black/20 px-2 py-0.5 text-[10px]">
							{checkinCount} Total Sessions
						</span>
					</button>
				</div>

				{/* Quick Navigation for Athlete */}
				<div className="space-y-2 mb-6">
					<div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
						Athlete Tools & Vault
					</div>
					<div className="grid grid-cols-2 gap-2">
						<button
							onClick={() => openModal('splits')}
							className="rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:border-amber-400 transition-colors"
						>
							<div className="text-base mb-1">📋</div>
							<div className="text-xs font-bold text-white">Workout Split</div>
							<div className="text-[10px] text-white/50">Push / Pull / Legs protocol</div>
						</button>
						<button
							onClick={() => openModal('exercises')}
							className="rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:border-amber-400 transition-colors"
						>
							<div className="text-base mb-1">🏋️</div>
							<div className="text-xs font-bold text-white">600+ Exercise Vault</div>
							<div className="text-[10px] text-white/50">Start & peak form cues</div>
						</button>
					</div>
				</div>

				{/* Footer: Sign Out & Switch */}
				<div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
					<div className="text-white/40 text-[11px]">Logged in as Gym Athlete</div>
					<button
						onClick={() => {
							logout()
							closeModal()
						}}
						className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-rose-300 hover:bg-rose-500/20 transition-all font-semibold"
					>
						Sign Out
					</button>
				</div>
			</div>
		</div>
	)
}
