'use client'
'use no memo'
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react'
import { useAuth } from '@/store/authStore'
import { useGymModal } from '@/store/gymHub'
import { fetchOwnerProfileData, type OwnerProfile } from '@/lib/supabase'
import { generateUpiQrDataUrl, copyUpiIdToClipboard } from '@/lib/upiQr'

interface MemberProfileModalProps {
	showToast?: (msg: string) => void
}

export default function MemberProfileModal({ showToast }: MemberProfileModalProps) {
	const { closeModal, openModal } = useGymModal()
	const { user, logout } = useAuth()
	const [checkedInToday, setCheckedInToday] = useState(false)
	const [checkinCount, setCheckinCount] = useState(user?.checkinCount || 0)
	const [showPaymentQr, setShowPaymentQr] = useState(false)
	const [copiedUpi, setCopiedUpi] = useState(false)
	const [generatedQr, setGeneratedQr] = useState<string>('')
	const [isGeneratingQr, setIsGeneratingQr] = useState(false)

	const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>({
		gymName: 'LIA Iron Club',
		ownerName: 'Palagiri Subbareddy',
		phone: '+91 98765 43210',
		email: 'subbareddy123sub@gmail.com',
		upiId: 'liaironclub@okhdfcbank',
		monthlyTarget: 180000,
		todayCheckins: 0,
		qrCodeUrl: ''
	})

	useEffect(() => {
		fetchOwnerProfileData().then((prof) => {
			setOwnerProfile(prof)
		})
	}, [])

	if (!user) return null

	const hasCustomQr = Boolean(ownerProfile.qrCodeUrl && ownerProfile.qrCodeUrl.trim() !== '')

	const handleOpenPayment = () => {
		setShowPaymentQr(true)
		if (!hasCustomQr && !generatedQr) {
			setIsGeneratingQr(true)
			generateUpiQrDataUrl(
				ownerProfile.upiId,
				ownerProfile.ownerName,
				1500,
				`LIA Gym Fee - ${user.name}`
			).then((url) => {
				setGeneratedQr(url)
				setIsGeneratingQr(false)
			})
		}
	}

	const handleCopyUpi = async () => {
		const ok = await copyUpiIdToClipboard(ownerProfile.upiId)
		if (ok) {
			setCopiedUpi(true)
			setTimeout(() => setCopiedUpi(false), 2000)
			if (showToast) showToast('UPI ID copied to clipboard!')
		}
	}

	const handleCheckIn = () => {
		if (checkedInToday) return
		setCheckedInToday(true)
		setCheckinCount((prev) => prev + 1)
		if (showToast) {
			showToast('Check-in logged successfully! Have a great workout.')
		}
	}

	// Calculate days remaining
	const expiryDateObj = user.expiryDate ? new Date(user.expiryDate) : new Date(Date.now() + 45 * 86400000)
	const now = new Date()
	const diffTime = expiryDateObj.getTime() - now.getTime()
	const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

	return (
		<>
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

						{/* Quick Actions Grid: Check-In + Pay/Renew via QR */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<button
								onClick={handleCheckIn}
								disabled={checkedInToday}
								className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
									checkedInToday
										? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
										: 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-400/20 hover:brightness-110 active:scale-[0.98]'
								}`}
							>
								<svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span className="truncate">{checkedInToday ? 'Checked In' : 'Floor Check-In'}</span>
								<span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono">
									{checkinCount}
								</span>
							</button>

							<button
								onClick={handleOpenPayment}
								className="py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 active:scale-[0.98] shadow-lg shadow-emerald-950/40"
							>
								<svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
								</svg>
								<span className="truncate">Pay / Renew via QR</span>
							</button>
						</div>
					</div>

					{/* Quick Navigation for Athlete with Sleek SVGs */}
					<div className="space-y-2 mb-6">
						<div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
							Athlete Tools & Vault
						</div>
						<div className="grid grid-cols-2 gap-2">
							<button
								onClick={() => openModal('splits')}
								className="group rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:border-amber-400/50 hover:bg-white/[0.08] transition-all"
							>
								<div className="flex size-7 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300 mb-2 group-hover:scale-110 transition-transform">
									<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>
								<div className="text-xs font-bold text-white">Workout Split</div>
								<div className="text-[10px] text-white/50">Push / Pull / Legs protocol</div>
							</button>

							<button
								onClick={() => openModal('exercises')}
								className="group rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:border-amber-400/50 hover:bg-white/[0.08] transition-all"
							>
								<div className="flex size-7 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300 mb-2 group-hover:scale-110 transition-transform">
									<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
									</svg>
								</div>
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

			{/* Direct Athlete QR Payment Modal */}
			{showPaymentQr && (
				<div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5">
					<div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowPaymentQr(false)} />
					<div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/20 bg-neutral-950 p-6 shadow-2xl text-white text-center">
						<div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
							<div className="flex items-center gap-2 text-left">
								<div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
									<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
									</svg>
								</div>
								<div>
									<h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
										Gym Fee QR Code
									</h4>
									<p className="text-[10px] text-white/50">{ownerProfile.gymName}</p>
								</div>
							</div>
							<button
								onClick={() => setShowPaymentQr(false)}
								className="flex size-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white"
							>
								✕
							</button>
						</div>

						{/* QR Code Container */}
						<div className="flex flex-col items-center justify-center my-3">
							<div className="relative size-48 rounded-2xl border-2 border-white/20 bg-white p-3 shadow-2xl flex items-center justify-center overflow-hidden">
								{hasCustomQr ? (
									<img
										src={ownerProfile.qrCodeUrl}
										alt="LIA Iron Club Official QR"
										className="size-full object-contain"
									/>
								) : isGeneratingQr ? (
									<div className="flex flex-col items-center gap-2 text-neutral-500">
										<div className="size-6 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
										<span className="text-[10px]">Generating QR...</span>
									</div>
								) : generatedQr ? (
									<img
										src={generatedQr}
										alt="UPI QR Code"
										className="size-full object-contain"
									/>
								) : (
									<div className="text-xs text-neutral-500">Failed to load QR code</div>
								)}
							</div>

							<div className="mt-3">
								<span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
									{hasCustomQr ? 'Official Standee QR' : 'Instant UPI QR'}
								</span>
							</div>
						</div>

						{/* UPI ID Copy Box */}
						<div className="space-y-2 mt-4 text-left">
							<div className="flex items-center justify-between rounded-xl border border-white/15 bg-black/60 px-3 py-2">
								<div className="truncate">
									<div className="text-[9px] uppercase tracking-wider text-white/40">UPI Address</div>
									<div className="font-mono text-xs font-semibold text-emerald-400 truncate">
										{ownerProfile.upiId}
									</div>
								</div>
								<button
									onClick={handleCopyUpi}
									className="ml-2 flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-white/20 transition-all shrink-0"
								>
									{copiedUpi ? (
										<span className="text-emerald-400">Copied</span>
									) : (
										<span>Copy</span>
									)}
								</button>
							</div>

							<p className="text-[10px] text-white/50 text-center leading-relaxed">
								Scan with PhonePe, Google Pay, Paytm, or BHIM. After payment, send the screenshot to Gym Desk ({ownerProfile.phone}).
							</p>
						</div>

						<div className="mt-5 border-t border-white/10 pt-3">
							<button
								onClick={() => setShowPaymentQr(false)}
								className="w-full rounded-xl bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all"
							>
								Done
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

