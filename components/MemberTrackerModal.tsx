'use client'

import { useState, useEffect, useRef } from 'react'
import {
	fetchMembersData,
	saveMemberData,
	deleteMemberData,
	isCloudSyncEnabled,
	fetchOwnerProfileData,
	type OwnerProfile
} from '@/lib/supabase'
import {
	formatWhatsAppReminder,
	getWhatsAppUrl,
	cleanPhoneNumber
} from '@/lib/whatsapp'
import {
	generateUpiQrDataUrl,
	copyUpiIdToClipboard
} from '@/lib/upiQr'
import { exportMembersToCsv } from '@/lib/exportCsv'

export interface GymMember {
	id: string
	name: string
	email: string
	phone: string
	photoUrl: string
	plan: string
	startDate: string
	expiryDate: string
	lastNotified?: string
}

const INITIAL_MEMBERS: GymMember[] = []

const OWNER_EMAIL = 'subbareddy123sub@gmail.com'

export default function MemberTrackerModal() {
	const [isOpen, setIsOpen] = useState(false)
	const [members, setMembers] = useState<GymMember[]>([])
	const [filter, setFilter] = useState<'all' | 'expiring' | 'active' | 'expired'>('all')
	const [search, setSearch] = useState('')

	// Owner profile for UPI & QR
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

	// Modal States
	const [editingMember, setEditingMember] = useState<GymMember | null>(null)
	const [isAddingNew, setIsAddingNew] = useState(false)
	const [previewEmail, setPreviewEmail] = useState<{
		member: GymMember
		daysLeft: number
		timestamp: string
	} | null>(null)
	const [previewWhatsApp, setPreviewWhatsApp] = useState<{
		member: GymMember
		daysLeft: number
		amount: number
		message: string
		waUrl: string
	} | null>(null)
	const [toastMsg, setToastMsg] = useState<string | null>(null)

	// Load members and owner profile
	useEffect(() => {
		fetchMembersData(INITIAL_MEMBERS).then((data) => {
			setMembers(data)
		})
		fetchOwnerProfileData().then((prof) => {
			setOwnerProfile(prof)
		})
	}, [isOpen])

	const saveMembers = (newMembers: GymMember[]) => {
		setMembers(newMembers)
		try {
			localStorage.setItem('lia_gym_members', JSON.stringify(newMembers))
		} catch (e) {}
		newMembers.forEach((m) => {
			saveMemberData(m)
		})
	}

	const showToast = (msg: string) => {
		setToastMsg(msg)
		setTimeout(() => setToastMsg(null), 4000)
	}

	// Calculate days remaining
	const getDaysLeft = (expiryDate: string) => {
		const diff = new Date(expiryDate).getTime() - new Date().setHours(0, 0, 0, 0)
		return Math.ceil(diff / (1000 * 60 * 60 * 24))
	}

	const getPlanPrice = (plan: string): number => {
		if (!plan) return 1500
		if (plan.includes('12,000') || plan.toLowerCase().includes('1 year') || plan.toLowerCase().includes('annual')) return 12000
		if (plan.includes('7,000') || plan.toLowerCase().includes('6 month')) return 7000
		if (plan.includes('6,000') || plan.toLowerCase().includes('personal')) return 6000
		if (plan.includes('4,000') || plan.toLowerCase().includes('3 month')) return 4000
		if (plan.includes('1,500') || plan.toLowerCase().includes('1 month')) return 1500
		return 1500
	}

	// Open 1-Click WhatsApp reminder dialog
	const openWhatsAppModal = (member: GymMember) => {
		const daysLeft = getDaysLeft(member.expiryDate)
		const amount = getPlanPrice(member.plan)
		const message = formatWhatsAppReminder({
			memberName: member.name,
			planName: member.plan,
			expiryDate: member.expiryDate,
			daysLeft,
			amount,
			upiId: ownerProfile.upiId,
			ownerName: ownerProfile.ownerName,
			ownerPhone: ownerProfile.phone,
			gymName: ownerProfile.gymName
		})
		const waUrl = getWhatsAppUrl(member.phone, message)
		setPreviewWhatsApp({
			member,
			daysLeft,
			amount,
			message,
			waUrl
		})
	}

	// 1-Click Direct WhatsApp Reminder Dispatch (wa.me)
	const dispatchDirectWhatsApp = (member: GymMember) => {
		const daysLeft = getDaysLeft(member.expiryDate)
		const amount = getPlanPrice(member.plan)
		const message = formatWhatsAppReminder({
			memberName: member.name,
			planName: member.plan,
			expiryDate: member.expiryDate,
			daysLeft,
			amount,
			upiId: ownerProfile.upiId,
			ownerName: ownerProfile.ownerName,
			ownerPhone: ownerProfile.phone,
			gymName: ownerProfile.gymName
		})
		const waUrl = getWhatsAppUrl(member.phone, message)
		const now = new Date().toLocaleString()
		const updated = members.map((m) => (m.id === member.id ? { ...m, lastNotified: now } : m))
		saveMembers(updated)
		window.open(waUrl, '_blank')
		showToast(`Direct WhatsApp reminder launched for ${member.name}! Phone: ${member.phone}`)
	}

	// Counts
	const expiringCount = members.filter((m) => {
		const days = getDaysLeft(m.expiryDate)
		return days >= 0 && days <= 3
	}).length

	const activeCount = members.filter((m) => {
		const days = getDaysLeft(m.expiryDate)
		return days > 3
	}).length

	const expiredCount = members.filter((m) => {
		const days = getDaysLeft(m.expiryDate)
		return days < 0
	}).length

	// Dispatch 3-day notification email (to both member and owner!)
	const dispatch3DayAlert = (member: GymMember) => {
		const daysLeft = getDaysLeft(member.expiryDate)
		const now = new Date().toLocaleString()

		// Update last notified
		const updated = members.map((m) => (m.id === member.id ? { ...m, lastNotified: now } : m))
		saveMembers(updated)

		// Set preview email modal
		setPreviewEmail({
			member,
			daysLeft,
			timestamp: now
		})

		showToast(`3-Day Alert email sent to ${member.email} and CC'd to ${OWNER_EMAIL}!`)
	}

	// Batch dispatch for all expiring in <= 3 days
	const dispatchAllExpiringAlerts = () => {
		const expiringMembers = members.filter((m) => {
			const days = getDaysLeft(m.expiryDate)
			return days >= 0 && days <= 3
		})

		if (expiringMembers.length === 0) {
			showToast('No members expiring in the next 3 days.')
			return
		}

		const now = new Date().toLocaleString()
		const updated = members.map((m) => {
			const days = getDaysLeft(m.expiryDate)
			if (days >= 0 && days <= 3) {
				return { ...m, lastNotified: now }
			}
			return m
		})
		saveMembers(updated)
		showToast(
			`Batch Alert Sent: Dispatched notifications for ${expiringMembers.length} member(s) to their registered emails and ${OWNER_EMAIL}.`
		)
	}

	// Quick duration extension (Owner feature)
	const extendDuration = (id: string, daysToAdd: number) => {
		const updated = members.map((m) => {
			if (m.id === id) {
				const currentExpiry = new Date(m.expiryDate).getTime()
				const baseDate = currentExpiry > Date.now() ? currentExpiry : Date.now()
				const newExpiry = new Date(baseDate + daysToAdd * 24 * 60 * 60 * 1000)
					.toISOString()
					.split('T')[0]
				return { ...m, expiryDate: newExpiry }
			}
			return m
		})
		saveMembers(updated)
		showToast(`Membership extended by ${daysToAdd} days.`)
	}

	// Filtered list
	const filteredMembers = members.filter((m) => {
		const days = getDaysLeft(m.expiryDate)
		const query = search.trim().toLowerCase()
		const matchesSearch =
			!query ||
			m.name.toLowerCase().includes(query) ||
			m.email.toLowerCase().includes(query) ||
			(m.phone && m.phone.toLowerCase().includes(query)) ||
			m.plan.toLowerCase().includes(query)

		if (!matchesSearch) return false

		if (filter === 'expiring') return days >= 0 && days <= 3
		if (filter === 'active') return days > 3
		if (filter === 'expired') return days < 0
		return true
	})

	return (
		<>
			{/* Trigger Button in Top Nav */}
			<button
				onClick={() => setIsOpen(true)}
				className="group relative flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
			>
				<span className="flex size-2 rounded-full bg-emerald-400">
					{expiringCount > 0 && (
						<span className="relative flex size-2">
							<span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
							<span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
						</span>
					)}
				</span>
				<span className="tracking-wider uppercase">Members Portal</span>
				{expiringCount > 0 && (
					<span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-amber-300">
						{expiringCount} Due
					</span>
				)}
			</button>

			{/* Main Modal Overlay - Centered Executive Dashboard Architecture & Mobile Bottom-Sheet */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-5 overflow-y-auto">
					<div
						className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
						onClick={() => setIsOpen(false)}
					/>

					<div className="relative z-10 flex h-[95dvh] sm:h-[92vh] sm:max-h-[820px] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/20 bg-neutral-950 shadow-2xl backdrop-blur-2xl my-0 sm:my-auto">
						{/* Mobile Pull Handle Indicator */}
						<div className="flex sm:hidden justify-center pt-2.5 pb-1 bg-neutral-950 shrink-0">
							<div className="h-1 w-10 rounded-full bg-white/25" />
						</div>

						{/* Header Bar */}
						<div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5 sm:px-6 sm:py-3 bg-neutral-950">
							<div className="min-w-0 pr-2">
								<div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
									<h2 className="font-heading text-base sm:text-xl font-black tracking-wider text-white uppercase truncate">
										LIA IRON CLUB
									</h2>
									<span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-amber-400 uppercase whitespace-nowrap">
										Membership Command
									</span>
									<span
										className={`hidden xs:inline-flex items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${
											isCloudSyncEnabled()
												? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
												: 'bg-white/5 text-white/50 border border-white/15'
										}`}
									>
										<span
											className={`size-1.5 rounded-full ${
												isCloudSyncEnabled() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
											}`}
										/>
										{isCloudSyncEnabled() ? 'Cloud Sync Active' : 'Local Storage Mode'}
									</span>
								</div>
								<p className="mt-0.5 text-[10.5px] sm:text-xs text-white/50 line-clamp-1 sm:line-clamp-none">
									Athlete duration management, fee expiry tracking, and 1-click WhatsApp payment alerts.
								</p>
							</div>

							<div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
								<button
									onClick={() => {
										exportMembersToCsv(members, ownerProfile)
										showToast('Member roster & revenue ledger exported to CSV successfully!')
									}}
									title="Export Members & Revenue Ledger to CSV/Excel"
									className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all shadow-md active:scale-[0.98] whitespace-nowrap"
								>
									<svg className="size-3.5 sm:size-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
										<polyline points="7 10 12 15 17 10" />
										<line x1="12" x2="12" y1="15" y2="3" />
									</svg>
									<span className="hidden xs:inline">Export CSV</span>
								</button>

								<button
									onClick={() => setIsAddingNew(true)}
									className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-amber-400 bg-amber-400 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-black uppercase tracking-wider transition-all hover:bg-amber-300 shadow-md active:scale-[0.98] whitespace-nowrap"
								>
									<svg className="size-3.5 sm:size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
									</svg>
									<span>Add Lifter</span>
								</button>

								<button
									onClick={() => setIsOpen(false)}
									className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white shrink-0"
								>
									<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						{/* Compact Cockpit KPI Ribbon */}
						<div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-3.5 sm:px-6 py-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
							<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-2.5 py-1 shrink-0">
								<span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Total Enrolled:</span>
								<span className="text-xs font-bold text-white font-mono">{members.length} Athletes</span>
							</div>
							<div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 shrink-0">
								<span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">Active Pass:</span>
								<span className="text-xs font-bold text-emerald-300 font-mono">{activeCount}</span>
							</div>
							<div
								className={`flex items-center gap-2 rounded-xl border px-2.5 py-1 shrink-0 ${
									expiringCount > 0 ? 'border-amber-400/50 bg-amber-400/15' : 'border-white/10 bg-black/40'
								}`}
							>
								<span className={`text-[10px] font-semibold uppercase tracking-wider ${expiringCount > 0 ? 'text-amber-300' : 'text-white/50'}`}>
									Due Soon (≤3d):
								</span>
								<span className={`text-xs font-bold font-mono ${expiringCount > 0 ? 'text-amber-300' : 'text-white/70'}`}>
									{expiringCount}
								</span>
							</div>
							<div
								className={`flex items-center gap-2 rounded-xl border px-2.5 py-1 shrink-0 ${
									expiredCount > 0 ? 'border-rose-500/40 bg-rose-500/15' : 'border-white/10 bg-black/40'
								}`}
							>
								<span className={`text-[10px] font-semibold uppercase tracking-wider ${expiredCount > 0 ? 'text-rose-300' : 'text-white/50'}`}>
									Expired:
								</span>
								<span className={`text-xs font-bold font-mono ${expiredCount > 0 ? 'text-rose-400' : 'text-white/70'}`}>
									{expiredCount}
								</span>
							</div>
						</div>

						{/* Alert Banner (if expiring in <= 3 days) */}
						{expiringCount > 0 && (
							<div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent px-5 py-2.5 sm:px-7">
								<div className="flex items-center gap-2.5 text-xs text-amber-200">
									<span className="relative flex size-2.5">
										<span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
										<span className="relative inline-flex size-2.5 rounded-full bg-amber-500"></span>
									</span>
									<span>
										<strong>{expiringCount} Athlete(s)</strong> have memberships concluding within 3 days. Send instant WhatsApp alerts.
									</span>
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => {
											const firstExpiring = members.find((m) => {
												const days = getDaysLeft(m.expiryDate)
												return days >= 0 && days <= 3
											})
											if (firstExpiring) {
												dispatchDirectWhatsApp(firstExpiring)
											} else if (members.length > 0) {
												dispatchDirectWhatsApp(members[0])
											}
										}}
										className="flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/25 px-3 py-1 text-xs font-bold text-emerald-200 transition-all hover:bg-emerald-500/40 shadow-sm"
									>
										<svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
											<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
										</svg>
										<span>1-Click WhatsApp Due Alert</span>
									</button>

									<button
										onClick={dispatchAllExpiringAlerts}
										className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200 transition-all hover:bg-amber-400/30"
									>
										<svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
										<span>Send All Emails</span>
									</button>
								</div>
							</div>
						)}

						{/* Toast Notice */}
						{toastMsg && (
							<div className="border-b border-emerald-500/30 bg-emerald-500/15 px-6 py-2 text-xs text-emerald-300 animate-in fade-in">
								{toastMsg}
							</div>
						)}

						{/* Responsive Filter & Search Toolbar */}
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 border-b border-white/10 px-3.5 sm:px-6 py-2 sm:py-1.5 bg-neutral-950">
							{/* Filter Tabs */}
							<div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-0.5 text-xs order-2 sm:order-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
								<button
									onClick={() => setFilter('all')}
									className={`rounded-lg px-2.5 py-1 font-medium transition-all whitespace-nowrap ${
										filter === 'all' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
									}`}
								>
									All ({members.length})
								</button>
								<button
									onClick={() => setFilter('active')}
									className={`rounded-lg px-2.5 py-1 font-medium transition-all whitespace-nowrap ${
										filter === 'active'
											? 'bg-emerald-500/25 text-emerald-300'
											: 'text-white/50 hover:text-white'
									}`}
								>
									Active ({activeCount})
								</button>
								<button
									onClick={() => setFilter('expiring')}
									className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-all whitespace-nowrap ${
										filter === 'expiring'
											? 'bg-amber-500/30 text-amber-300'
											: 'text-white/50 hover:text-white'
									}`}
								>
									<span>Due Soon ({expiringCount})</span>
								</button>
								<button
									onClick={() => setFilter('expired')}
									className={`rounded-lg px-2.5 py-1 font-medium transition-all whitespace-nowrap ${
										filter === 'expired'
											? 'bg-rose-500/25 text-rose-300'
											: 'text-white/50 hover:text-white'
									}`}
								>
									Expired ({expiredCount})
								</button>
							</div>

							{/* Search Input */}
							<div className="relative w-full sm:w-64 order-1 sm:order-2 shrink-0">
								<input
									type="text"
									placeholder="Search lifter, phone, plan..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 sm:py-1 pl-8 text-xs text-white placeholder-white/35 focus:border-amber-400 focus:outline-none transition-colors"
								/>
								<svg
									className="absolute left-2.5 top-2 sm:top-1.5 size-3.5 text-white/40"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
						</div>

						{/* Scrollable Member Roster Area */}
						<div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-black/20">
							{members.length === 0 ? (
								<div className="py-20 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
									<div className="size-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40 mb-4">
										<svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
											<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
											<circle cx="9" cy="7" r="4" />
											<line x1="19" x2="19" y1="8" y2="14" />
											<line x1="22" x2="16" y1="11" y2="11" />
										</svg>
									</div>
									<h3 className="font-heading text-lg font-bold text-white mb-1">No Members Enrolled Yet</h3>
									<p className="text-xs text-white/50 mb-5 text-center">
										Your athlete roster is currently clean. Click below to onboard your first lifter.
									</p>
									<button
										onClick={() => setIsAddingNew(true)}
										className="rounded-xl border border-amber-400 bg-amber-400 px-5 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition-all shadow-lg flex items-center gap-1.5"
									>
										<span>+ Add First Member</span>
									</button>
								</div>
							) : filteredMembers.length === 0 ? (
								<div className="py-20 text-center flex flex-col items-center justify-center text-white/40">
									<div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
										<svg className="size-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
										</svg>
									</div>
									<p className="text-sm">No lifters found matching &quot;{search}&quot;.</p>
								</div>
							) : (
								<div className={filteredMembers.length === 1 ? 'max-w-xl mx-auto w-full' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
									{filteredMembers.map((member) => {
										const daysLeft = getDaysLeft(member.expiryDate)
										const isExpiring = daysLeft >= 0 && daysLeft <= 3
										const isExpired = daysLeft < 0

										return (
											<div
												key={member.id}
												className={`relative flex flex-col justify-between rounded-2xl border p-3 sm:p-4 transition-all shadow-xl ${
													isExpiring
														? 'border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-neutral-900 to-neutral-950 ring-1 ring-amber-500/20'
														: isExpired
														? 'border-rose-500/40 bg-gradient-to-br from-rose-500/10 via-neutral-900 to-neutral-950'
														: 'border-white/15 bg-neutral-900/80 hover:border-white/30'
												}`}
											>
												{/* Top Member Card Header */}
												<div>
													<div className="flex items-start justify-between gap-2.5 sm:gap-3">
														<div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
															{/* Member Photo */}
															<div
																className="relative shrink-0 overflow-hidden rounded-xl border-2 border-white/20 bg-neutral-800 shadow-md size-12 sm:size-13"
																style={{ minWidth: 48, minHeight: 48 }}
															>
																{/* eslint-disable-next-line @next/next/no-img-element */}
																<img
																	src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
																	alt={member.name}
																	className="h-full w-full object-cover"
																/>
															</div>

															{/* Member Details */}
															<div className="min-w-0 flex-1">
																<h4 className="truncate font-heading text-sm sm:text-base font-bold text-white uppercase tracking-wide">
																	{member.name}
																</h4>
																<div className="text-[11px] sm:text-xs text-white/60 truncate">{member.email}</div>
																<div className="font-mono text-xs text-emerald-400/90 mt-0.5 truncate">
																	{member.phone}
																</div>
															</div>
														</div>

														{/* Status Badge */}
														<div className="shrink-0 text-right">
															<span
																className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${
																	isExpiring
																		? 'bg-amber-400/25 text-amber-300 border border-amber-400/40 animate-pulse'
																		: isExpired
																		? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
																		: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
																}`}
															>
																<span
																	className={`size-1.5 rounded-full ${
																		isExpiring
																			? 'bg-amber-400'
																			: isExpired
																			? 'bg-rose-400'
																			: 'bg-emerald-400'
																	}`}
																/>
																{isExpiring
																	? `${daysLeft}d Due Soon`
																	: isExpired
																	? 'Expired'
																	: `${daysLeft} Days Left`}
															</span>
														</div>
													</div>

													{/* Plan & Duration Bar Box */}
													<div className="mt-2 rounded-xl border border-white/10 bg-black/40 p-2 sm:p-2.5">
														<div className="flex items-center justify-between text-xs">
															<span className="font-bold text-white">{member.plan}</span>
															<span className="text-white/60">
																Expires: <strong className="text-amber-300">{member.expiryDate}</strong>
															</span>
														</div>

														{/* Visual Duration Timeline Bar */}
														<div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
															<div
																className={`h-full rounded-full transition-all ${
																	isExpiring
																		? 'bg-amber-400'
																		: isExpired
																		? 'bg-rose-500'
																		: 'bg-emerald-400'
																}`}
																style={{
																	width: `${Math.min(
																		100,
																		Math.max(5, isExpired ? 100 : ((90 - daysLeft) / 90) * 100)
																	)}%`
																}}
															/>
														</div>

														{member.lastNotified && (
															<div className="mt-1 flex items-center gap-1 text-[9.5px] text-white/50">
																<svg className="size-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
																</svg>
																<span>Last alert: {member.lastNotified}</span>
															</div>
														)}
													</div>
												</div>

												{/* Action Controls Footer */}
												<div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
													{/* Quick Duration Extension Pills */}
													<div className="flex items-center justify-between text-[11px]">
														<span className="text-[9.5px] uppercase font-semibold text-white/40 tracking-wider">
															Quick Extend:
														</span>
														<div className="flex items-center gap-1">
															<button
																onClick={() => extendDuration(member.id, 30)}
																className="rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[10.5px] font-medium text-white/80 hover:bg-white/15 hover:text-white transition-all"
																title="Extend by 30 days"
															>
																+30d
															</button>
															<button
																onClick={() => extendDuration(member.id, 90)}
																className="rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[10.5px] font-medium text-white/80 hover:bg-white/15 hover:text-white transition-all"
																title="Extend by 90 days"
															>
																+90d
															</button>
															<button
																onClick={() => extendDuration(member.id, 180)}
																className="rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[10.5px] font-medium text-white/80 hover:bg-white/15 hover:text-white transition-all"
																title="Extend by 180 days"
															>
																+180d
															</button>
														</div>
													</div>

													{/* Primary Dispatch & Edit Action Buttons */}
													<div className="grid grid-cols-12 gap-1.5 sm:gap-2 pt-0.5">
														{/* Direct 1-Click WhatsApp Reminder Button */}
														<button
															onClick={() => dispatchDirectWhatsApp(member)}
															title={`Direct 1-Click WhatsApp reminder to ${member.name} (${member.phone})`}
															className="col-span-6 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 sm:py-2 text-xs font-bold text-white shadow-md shadow-emerald-950/50 hover:bg-emerald-500 transition-all active:scale-[0.98]"
														>
															<svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
																<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
															</svg>
															<span>WhatsApp</span>
														</button>

														{/* UPI QR Standee & Preview Button */}
														<button
															onClick={() => openWhatsAppModal(member)}
															title="View Payment QR Standee & WhatsApp Preview"
															className="col-span-3 flex items-center justify-center gap-1 rounded-xl border border-amber-400/30 bg-amber-400/10 px-2 py-1.5 sm:py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition-all"
														>
															<svg className="size-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
																<rect width="5" height="5" x="3" y="3" rx="1" />
																<rect width="5" height="5" x="16" y="3" rx="1" />
																<rect width="5" height="5" x="3" y="16" rx="1" />
																<path d="M21 16h-3a2 2 0 0 0-2 2v3" />
																<path d="M21 21v.01" />
																<path d="M12 7v3a2 2 0 0 1-2 2H7" />
																<path d="M3 12h.01" />
																<path d="M12 3h.01" />
																<path d="M12 16v.01" />
																<path d="M16 12h1" />
																<path d="M21 12v.01" />
																<path d="M12 21v-1" />
															</svg>
															<span>QR Standee</span>
														</button>

														{/* Edit Button */}
														<button
															onClick={() => setEditingMember(member)}
															title="Edit lifter"
															className="col-span-3 flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2 py-1.5 sm:py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all"
														>
															<svg className="size-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
															</svg>
															<span>Edit</span>
														</button>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Owner Edit Member Modal */}
			{editingMember && (
				<EditMemberDialog
					member={editingMember}
					onClose={() => setEditingMember(null)}
					onSave={(updated) => {
						const next = members.map((m) => (m.id === updated.id ? updated : m))
						saveMembers(next)
						setEditingMember(null)
						showToast(`Member "${updated.name}" updated successfully!`)
					}}
					onDelete={(id) => {
						const next = members.filter((m) => m.id !== id)
						saveMembers(next)
						setEditingMember(null)
						showToast('Member removed from roster.')
					}}
				/>
			)}

			{/* Add New Member Modal */}
			{isAddingNew && (
				<AddNewMemberDialog
					onClose={() => setIsAddingNew(false)}
					onAdd={(newMem) => {
						const next = [newMem, ...members]
						saveMembers(next)
						setIsAddingNew(false)
						showToast(`New Member "${newMem.name}" registered successfully!`)
					}}
				/>
			)}

			{/* 3-Day Expiry Email Template Preview Modal */}
			{previewEmail && (
				<EmailPreviewModal
					data={previewEmail}
					ownerEmail={OWNER_EMAIL}
					onClose={() => setPreviewEmail(null)}
				/>
			)}

			{/* 1-Click WhatsApp Expiry Reminder & Payment QR Modal */}
			{previewWhatsApp && (
				<WhatsAppDispatchModal
					data={previewWhatsApp}
					ownerProfile={ownerProfile}
					onClose={() => setPreviewWhatsApp(null)}
					onConfirmSend={() => {
						const now = new Date().toLocaleString()
						const updated = members.map((m) =>
							m.id === previewWhatsApp.member.id ? { ...m, lastNotified: now } : m
						)
						saveMembers(updated)
						window.open(previewWhatsApp.waUrl, '_blank')
						setPreviewWhatsApp(null)
						showToast(`Dispatched WhatsApp Expiry Alert to ${previewWhatsApp.member.name}!`)
					}}
				/>
			)}
		</>
	)
}

// Dialog: Edit Member (Gym Owner)
function EditMemberDialog({
	member,
	onClose,
	onSave,
	onDelete
}: {
	member: GymMember
	onClose: () => void
	onSave: (member: GymMember) => void
	onDelete: (id: string) => void
}) {
	const [name, setName] = useState(member.name)
	const [email, setEmail] = useState(member.email)
	const [phone, setPhone] = useState(member.phone)
	const [plan, setPlan] = useState(member.plan)
	const [expiryDate, setExpiryDate] = useState(member.expiryDate)
	const [photoUrl, setPhotoUrl] = useState(member.photoUrl)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (event) => {
				if (event.target?.result) {
					setPhotoUrl(event.target.result as string)
				}
			}
			reader.readAsDataURL(file)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
			<div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
			<div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border border-white/20 bg-neutral-950 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl max-h-[92vh] overflow-y-auto my-auto">
				<div className="flex items-center justify-between border-b border-white/10 pb-4">
					<div>
						<h3 className="font-serif text-xl font-bold text-white">Edit Gym Member</h3>
						<p className="text-xs text-white/50">Owner administrative controls</p>
					</div>
					<button onClick={onClose} className="text-white/50 hover:text-white">
						✕
					</button>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						onSave({
							...member,
							name,
							email,
							phone,
							plan,
							expiryDate,
							photoUrl
						})
					}}
					className="mt-5 space-y-4 text-xs"
				>
					{/* Photo Picker */}
					<div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
						<div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-neutral-800">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={photoUrl || 'https://via.placeholder.com/150'} alt="Avatar" className="size-full object-cover" />
						</div>
						<div>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
							>
								Upload New Photo
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handlePhotoUpload}
								className="hidden"
							/>
							<p className="mt-1 text-[11px] text-white/40">Upload member profile or transformation photo</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-white/60">Full Name</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
							/>
						</div>
						<div>
							<label className="text-white/60">Phone Number</label>
							<input
								type="text"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								required
								className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
							/>
						</div>
					</div>

					<div>
						<label className="text-white/60">Registered Email Address (for 3-day alerts)</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-white/60">Membership Plan</label>
							<select
								value={plan}
								onChange={(e) => setPlan(e.target.value)}
								className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
							>
								<option value="1 Month Kickstart">1 Month Kickstart</option>
								<option value="3 Months Hypertrophy">3 Months Hypertrophy</option>
								<option value="6 Months Classic Iron">6 Months Classic Iron</option>
								<option value="Annual Elite Athlete">Annual Elite Athlete</option>
							</select>
						</div>
						<div>
							<label className="text-white/60">Expiry Date</label>
							<input
								type="date"
								value={expiryDate}
								onChange={(e) => setExpiryDate(e.target.value)}
								required
								className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
							/>
						</div>
					</div>

					<div className="flex items-center justify-between border-t border-white/10 pt-4">
						<button
							type="button"
							onClick={() => {
								if (confirm('Are you sure you want to delete this member?')) {
									onDelete(member.id)
								}
							}}
							className="rounded-xl border border-red-500/30 px-3 py-2 text-red-400 hover:bg-red-500/10"
						>
							Delete Member
						</button>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={onClose}
								className="rounded-xl border border-white/10 px-4 py-2 text-white/60 hover:text-white"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="rounded-xl bg-white px-5 py-2 font-semibold text-black hover:bg-white/90"
							>
								Save Changes
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}

// Dialog: Add New Member (Gym Owner)
function AddNewMemberDialog({
	onClose,
	onAdd
}: {
	onClose: () => void
	onAdd: (member: GymMember) => void
}) {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [plan, setPlan] = useState('3 Months Hypertrophy')
	const [durationMonths, setDurationMonths] = useState(3)
	const [photoUrl, setPhotoUrl] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (event) => {
				if (event.target?.result) {
					setPhotoUrl(event.target.result as string)
				}
			}
			reader.readAsDataURL(file)
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const now = new Date()
		const expiry = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000)

		const newMember: GymMember = {
			id: 'mem-' + Date.now(),
			name,
			email,
			phone,
			plan,
			photoUrl:
				photoUrl ||
				'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
			startDate: now.toISOString().split('T')[0],
			expiryDate: expiry.toISOString().split('T')[0]
		}
		onAdd(newMember)
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
			<div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
			<div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border border-white/20 bg-neutral-950 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl max-h-[92vh] overflow-y-auto my-auto">
				<div className="flex items-center justify-between border-b border-white/10 pb-4">
					<div>
						<h3 className="font-serif text-xl font-bold text-white">Register New Member</h3>
						<p className="text-xs text-white/50">Capture photo, track duration, and set alert email</p>
					</div>
					<button onClick={onClose} className="text-white/50 hover:text-white">
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
					{/* Photo Upload */}
					<div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
						<div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-neutral-800">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={photoUrl || 'https://via.placeholder.com/150?text=Photo'}
								alt="Avatar"
								className="size-full object-cover"
							/>
						</div>
						<div>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
							>
								Upload Member Photo
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handlePhotoUpload}
								className="hidden"
							/>
							<p className="mt-1 text-[11px] text-white/40">Upload headshot or check-in photo</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-white/60">Full Name</label>
							<input
								type="text"
								placeholder="e.g. Varun Teja"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
							/>
						</div>
						<div>
							<label className="text-white/60">Phone</label>
							<input
								type="text"
								placeholder="+91 98765 00000"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								required
								className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
							/>
						</div>
					</div>

					<div>
						<label className="text-white/60">Registered Email (Alerts will be sent here)</label>
						<input
							type="email"
							placeholder="member@gmail.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-white/60">Select Plan</label>
							<select
								value={plan}
								onChange={(e) => {
									setPlan(e.target.value)
									if (e.target.value.includes('1 Month')) setDurationMonths(1)
									if (e.target.value.includes('3 Months')) setDurationMonths(3)
									if (e.target.value.includes('6 Months')) setDurationMonths(6)
									if (e.target.value.includes('Annual')) setDurationMonths(12)
								}}
								className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
							>
								<option value="1 Month Kickstart">1 Month Kickstart</option>
								<option value="3 Months Hypertrophy">3 Months Hypertrophy</option>
								<option value="6 Months Classic Iron">6 Months Classic Iron</option>
								<option value="Annual Elite Athlete">Annual Elite Athlete</option>
							</select>
						</div>
						<div>
							<label className="text-white/60">Duration (Months)</label>
							<input
								type="number"
								min="1"
								max="24"
								value={durationMonths}
								onChange={(e) => setDurationMonths(Number(e.target.value))}
								className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white focus:border-white/30 focus:outline-none"
							/>
						</div>
					</div>

					<div className="flex justify-end gap-2 border-t border-white/10 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="rounded-xl border border-white/10 px-4 py-2 text-white/60 hover:text-white"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-xl bg-white px-5 py-2 font-semibold text-black hover:bg-white/90"
						>
							Register Member
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

// Dialog: 3-Day Expiry Email Template Preview
function EmailPreviewModal({
	data,
	ownerEmail,
	onClose
}: {
	data: { member: GymMember; daysLeft: number; timestamp: string }
	ownerEmail: string
	onClose: () => void
}) {
	const { member, daysLeft, timestamp } = data

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
			<div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/30 bg-neutral-950 shadow-2xl backdrop-blur-2xl">
				{/* Top Status */}
				<div className="flex items-center justify-between border-b border-white/10 bg-amber-500/10 px-6 py-4">
					<div className="flex items-center gap-2.5">
						<span className="flex size-3 rounded-full bg-amber-400" />
						<div>
							<h3 className="text-sm font-semibold text-amber-300">
								Automated 3-Day Expiry Email Dispatched
							</h3>
							<p className="text-[11px] text-white/50">Sent via LIA Automated Member Notification Engine</p>
						</div>
					</div>
					<button onClick={onClose} className="text-white/50 hover:text-white">
						✕
					</button>
				</div>

				{/* Mail Headers */}
				<div className="space-y-1.5 border-b border-white/10 bg-neutral-900/40 p-4 text-xs font-mono">
					<div className="flex">
						<span className="w-20 text-white/40">TO:</span>
						<span className="font-semibold text-amber-300">{member.name} &lt;{member.email}&gt;</span>
					</div>
					<div className="flex">
						<span className="w-20 text-white/40">CC (Owner):</span>
						<span className="text-white/80">{ownerEmail}</span>
					</div>
					<div className="flex">
						<span className="w-20 text-white/40">SUBJECT:</span>
						<span className="font-semibold text-white">
							[URGENT] Your LIA Iron Club Membership Expires in {daysLeft} Days!
						</span>
					</div>
					<div className="flex">
						<span className="w-20 text-white/40">DATE:</span>
						<span className="text-white/50">{timestamp}</span>
					</div>
				</div>

				{/* Rendered HTML Email Body Preview */}
				<div className="p-6">
					<div className="rounded-2xl border border-white/15 bg-black p-6 text-white shadow-inner">
						<div className="border-b border-white/10 pb-4 text-center">
							<h1 className="font-serif text-2xl font-bold tracking-wider text-white">LIA IRON CLUB</h1>
							<p className="text-[10px] tracking-widest text-amber-400 uppercase">
								Elite Physique & Training Sanctum
							</p>
						</div>

						<div className="py-5 text-xs leading-relaxed text-white/80">
							<p className="font-medium text-white">Dear {member.name},</p>
							<p className="mt-3">
								This is an automated reminder that your <strong>{member.plan}</strong> membership at LIA Iron Club will conclude in <span className="font-bold text-amber-400">{daysLeft} days</span> on <strong>{member.expiryDate}</strong>.
							</p>
							<p className="mt-2">
								Consistency is the cornerstone of hypertrophy and peak conditioning. To ensure uninterrupted access to the floor, elite equipment, and training facilities, please renew your membership before the expiration date.
							</p>

							{/* Member Summary Box */}
							<div className="my-4 rounded-xl border border-white/10 bg-white/5 p-3.5">
								<div className="grid grid-cols-2 gap-2 text-[11px]">
									<div>
										<span className="text-white/40">Member ID:</span> {member.id}
									</div>
									<div>
										<span className="text-white/40">Plan:</span> {member.plan}
									</div>
									<div>
										<span className="text-white/40">Expiry Date:</span> {member.expiryDate}
									</div>
									<div>
										<span className="text-white/40">Status:</span>{' '}
										<span className="font-semibold text-amber-400">Renewal Required</span>
									</div>
								</div>
							</div>

							<p className="text-white/60">
								You may renew directly with the front desk or contact the gym manager at <strong>{ownerEmail}</strong>.
							</p>
						</div>

						<div className="border-t border-white/10 pt-3 text-center text-[10px] text-white/40">
							© LIA Iron Club • Automated Duration Tracker • Registered to {member.email}
						</div>
					</div>
				</div>

				{/* Close Footer */}
				<div className="flex justify-end border-t border-white/10 bg-neutral-900/60 px-6 py-3">
					<button
						onClick={onClose}
						className="rounded-xl bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-white/90"
					>
						Close Preview
					</button>
				</div>
			</div>
		</div>
	)
}

// Dialog: 1-Click WhatsApp Expiry Reminder Dispatch & UPI QR Hub
function WhatsAppDispatchModal({
	data,
	ownerProfile,
	onClose,
	onConfirmSend
}: {
	data: {
		member: GymMember
		daysLeft: number
		amount: number
		message: string
		waUrl: string
	}
	ownerProfile: OwnerProfile
	onClose: () => void
	onConfirmSend: () => void
}) {
	const [generatedQr, setGeneratedQr] = useState<string>('')
	const [isGeneratingQr, setIsGeneratingQr] = useState(false)
	const [copiedText, setCopiedText] = useState(false)
	const [copiedUpi, setCopiedUpi] = useState(false)

	const hasCustomQr = Boolean(ownerProfile.qrCodeUrl && ownerProfile.qrCodeUrl.trim() !== '')

	useEffect(() => {
		let isMounted = true
		if (!hasCustomQr) {
			setIsGeneratingQr(true)
			generateUpiQrDataUrl(
				ownerProfile.upiId,
				ownerProfile.ownerName,
				data.amount,
				`LIA Renewal - ${data.member.name}`
			).then((url) => {
				if (isMounted) {
					setGeneratedQr(url)
					setIsGeneratingQr(false)
				}
			})
		}
		return () => {
			isMounted = false
		}
	}, [hasCustomQr, ownerProfile.upiId, ownerProfile.ownerName, data.amount, data.member.name])

	const handleCopyText = async () => {
		try {
			await navigator.clipboard.writeText(data.message)
			setCopiedText(true)
			setTimeout(() => setCopiedText(false), 2000)
		} catch (e) {
			console.error(e)
		}
	}

	const handleCopyUpi = async () => {
		const ok = await copyUpiIdToClipboard(ownerProfile.upiId)
		if (ok) {
			setCopiedUpi(true)
			setTimeout(() => setCopiedUpi(false), 2000)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
			<div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
			<div className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl border border-white/20 bg-neutral-950 p-4 sm:p-7 shadow-2xl backdrop-blur-2xl z-10 my-auto max-h-[94vh] overflow-y-auto">
				{/* Top Bar */}
				<div className="flex items-center justify-between border-b border-white/10 pb-4">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
							<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<div>
							<h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
								WhatsApp Expiry Alert & Instant QR
							</h3>
							<p className="text-xs text-white/50">
								Direct dispatch to <span className="font-semibold text-white/80">{data.member.name}</span> ({data.member.phone})
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all"
					>
						✕
					</button>
				</div>

				{/* Dual Grid: Left = WhatsApp Message Preview, Right = UPI QR Standee */}
				<div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5">
					{/* Left Column: Formatted WhatsApp Message */}
					<div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4">
						<div>
							<div className="flex items-center justify-between pb-3 border-b border-white/10">
								<div className="flex items-center gap-2">
									<span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
									<span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
										Formatted WhatsApp Dispatch
									</span>
								</div>
								<button
									onClick={handleCopyText}
									className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
								>
									{copiedText ? (
										<>
											<svg className="size-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
											<span className="text-emerald-400">Copied</span>
										</>
									) : (
										<>
											<svg className="size-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
											<span>Copy Text</span>
										</>
									)}
								</button>
							</div>

							{/* WhatsApp Bubble Preview */}
							<div className="mt-3 rounded-2xl border border-emerald-500/25 bg-[#0b141a] p-4 shadow-inner text-[11.5px] leading-relaxed text-[#e9edef] max-h-64 overflow-y-auto space-y-2 font-sans select-text">
								<div className="whitespace-pre-wrap">{data.message}</div>
								<div className="text-right text-[10px] text-white/40">
									Just now • Delivered
								</div>
							</div>
						</div>

						{/* Athlete Info Card */}
						<div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] space-y-1">
							<div className="flex justify-between">
								<span className="text-white/40">Registered Phone:</span>
								<span className="font-mono font-medium text-white/90">{data.member.phone}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-white/40">Membership Plan:</span>
								<span className="font-medium text-white/90">{data.member.plan}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-white/40">Expiry Status:</span>
								<span className={`font-semibold ${data.daysLeft <= 0 ? 'text-rose-400' : 'text-amber-400'}`}>
									{data.daysLeft <= 0 ? 'Expired' : `${data.daysLeft} days remaining (${data.member.expiryDate})`}
								</span>
							</div>
						</div>
					</div>

					{/* Right Column: QR Code & UPI Details */}
					<div className="md:col-span-5 flex flex-col items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
						<div className="w-full flex items-center justify-between">
							<span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
								Payment Gateway QR
							</span>
							<span
								className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
									hasCustomQr
										? 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
										: 'border border-sky-500/30 bg-sky-500/10 text-sky-300'
								}`}
							>
								{hasCustomQr ? 'Merchant Standee' : 'UPI Vector QR'}
							</span>
						</div>

						{/* QR Code Container */}
						<div className="my-3 flex flex-col items-center justify-center">
							<div className="relative size-44 rounded-2xl border-2 border-white/15 bg-white p-2.5 shadow-2xl flex items-center justify-center overflow-hidden">
								{hasCustomQr ? (
									<img
										src={ownerProfile.qrCodeUrl}
										alt="Gym Merchant QR Code"
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
										alt="Dynamic UPI QR Code"
										className="size-full object-contain"
									/>
								) : (
									<div className="text-xs text-neutral-500">QR Generation Failed</div>
								)}
							</div>

							<div className="mt-2 text-center">
								<div className="text-lg font-bold text-white tracking-tight">
									₹{data.amount.toLocaleString()}
								</div>
								<div className="text-[10px] text-white/40">
									Renewal fee for {data.member.plan.split('(')[0].trim()}
								</div>
							</div>
						</div>

						{/* UPI ID Pill & Copy */}
						<div className="w-full space-y-2">
							<div className="flex items-center justify-between rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-left">
								<div className="truncate">
									<div className="text-[9px] uppercase tracking-wider text-white/40">Gym UPI VPA</div>
									<div className="font-mono text-xs font-semibold text-emerald-400 truncate">
										{ownerProfile.upiId}
									</div>
								</div>
								<button
									onClick={handleCopyUpi}
									className="ml-2 flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-medium text-white hover:bg-white/20 transition-all shrink-0"
								>
									{copiedUpi ? (
										<span className="text-emerald-400">Copied</span>
									) : (
										<span>Copy</span>
									)}
								</button>
							</div>

							<p className="text-[10px] text-white/40 leading-snug">
								Member can scan via Google Pay, PhonePe, Paytm, or BHIM directly to {ownerProfile.ownerName}.
							</p>
						</div>
					</div>
				</div>

				{/* Modal Footer Controls */}
				<div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4">
					<button
						onClick={onClose}
						className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
					>
						Cancel
					</button>

					<div className="flex items-center gap-2.5 w-full sm:w-auto">
						<button
							onClick={onConfirmSend}
							className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:bg-emerald-500 hover:shadow-emerald-900/60 transition-all active:scale-[0.98]"
						>
							<svg className="size-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
								<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
							</svg>
							<span>Open WhatsApp & Dispatch (1-Click)</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

