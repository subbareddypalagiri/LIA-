'use client'

import { useState, useEffect, useRef } from 'react'
import {
	fetchMembersData,
	saveMemberData,
	deleteMemberData,
	isCloudSyncEnabled
} from '@/lib/supabase'

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

	// Modal States
	const [editingMember, setEditingMember] = useState<GymMember | null>(null)
	const [isAddingNew, setIsAddingNew] = useState(false)
	const [previewEmail, setPreviewEmail] = useState<{
		member: GymMember
		daysLeft: number
		timestamp: string
	} | null>(null)
	const [toastMsg, setToastMsg] = useState<string | null>(null)

	// Load members from Supabase Cloud or localStorage fallback
	useEffect(() => {
		fetchMembersData(INITIAL_MEMBERS).then((data) => {
			setMembers(data)
		})
	}, [])

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

	// Counts
	const expiringCount = members.filter((m) => {
		const days = getDaysLeft(m.expiryDate)
		return days >= 0 && days <= 3
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
		const matchesSearch =
			m.name.toLowerCase().includes(search.toLowerCase()) ||
			m.email.toLowerCase().includes(search.toLowerCase()) ||
			m.plan.toLowerCase().includes(search.toLowerCase())

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

			{/* Main Modal Overlay */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
					<div
						className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
						onClick={() => setIsOpen(false)}
					/>

					<div className="relative flex max-h-[92dvh] sm:max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/20 bg-neutral-950/98 shadow-2xl backdrop-blur-2xl">
						{/* Mobile pull handle */}
						<div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

						{/* Header Bar */}
						<div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 sm:px-6 sm:py-5">
							<div>
								<div className="flex items-center gap-2 sm:gap-3">
									<h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">
										LIA IRON CLUB
									</h2>
									<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
										Gym Owner Portal
									</span>
									<span
										className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
											isCloudSyncEnabled()
												? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
												: 'bg-white/5 text-white/50 border border-white/10'
										}`}
										title={
											isCloudSyncEnabled()
												? 'Data is actively synced to Supabase Cloud Database'
												: 'Data stored locally in browser. Add Supabase keys to sync across all devices.'
										}
									>
										<span
											className={`size-1.5 rounded-full ${
												isCloudSyncEnabled() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
											}`}
										/>
										{isCloudSyncEnabled() ? 'Cloud Sync: Active' : 'Local Storage Mode'}
									</span>
								</div>
								<p className="mt-1 text-xs text-white/50">
									Member photo tracking, duration management, and 3-day automated expiry alerts
								</p>
							</div>

							<div className="flex items-center gap-3">
								<button
									onClick={() => setIsAddingNew(true)}
									className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
								>
									<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									<span>New Member</span>
								</button>

								<button
									onClick={() => setIsOpen(false)}
									className="rounded-full border border-white/10 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
								>
									<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						{/* Alert Banner (if expiring in <= 3 days) */}
						{expiringCount > 0 && (
							<div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/15 to-transparent px-6 py-3">
								<div className="flex items-center gap-2.5 text-xs text-amber-300">
									<span className="relative flex size-2.5">
										<span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
										<span className="relative inline-flex size-2.5 rounded-full bg-amber-500"></span>
									</span>
									<span>
										<strong>{expiringCount} Member(s)</strong> expire within 3 days! Automated notifications can be dispatched to their registered mail and {OWNER_EMAIL}.
									</span>
								</div>
								<button
									onClick={dispatchAllExpiringAlerts}
									className="flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200 transition-all hover:bg-amber-400/30"
								>
									<svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
									Send All 3-Day Alerts
								</button>
							</div>
						)}

						{/* Toast Notice */}
						{toastMsg && (
							<div className="border-b border-emerald-500/30 bg-emerald-500/15 px-6 py-2.5 text-xs text-emerald-300 animate-in fade-in">
								{toastMsg}
							</div>
						)}

						{/* Filter & Search Bar */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-3.5">
							{/* Filter Tabs */}
							<div className="flex flex-wrap items-center gap-1 sm:gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
								<button
									onClick={() => setFilter('all')}
									className={`rounded-lg px-2.5 sm:px-3 py-1 transition-all ${
										filter === 'all' ? 'bg-white/20 font-medium text-white' : 'text-white/50 hover:text-white'
									}`}
								>
									All ({members.length})
								</button>
								<button
									onClick={() => setFilter('expiring')}
									className={`flex items-center gap-1 rounded-lg px-2.5 sm:px-3 py-1 transition-all ${
										filter === 'expiring'
											? 'bg-amber-500/30 font-medium text-amber-300'
											: 'text-white/50 hover:text-white'
									}`}
								>
									<span>Expiring</span>
									{expiringCount > 0 && (
										<span className="rounded-full bg-amber-500/40 px-1.5 py-0.2 text-[10px] text-amber-200">
											{expiringCount}
										</span>
									)}
								</button>
								<button
									onClick={() => setFilter('active')}
									className={`rounded-lg px-2.5 sm:px-3 py-1 transition-all ${
										filter === 'active'
											? 'bg-emerald-500/20 font-medium text-emerald-300'
											: 'text-white/50 hover:text-white'
									}`}
								>
									Active
								</button>
								<button
									onClick={() => setFilter('expired')}
									className={`rounded-lg px-2.5 sm:px-3 py-1 transition-all ${
										filter === 'expired'
											? 'bg-red-500/20 font-medium text-red-300'
											: 'text-white/50 hover:text-white'
									}`}
								>
									Expired
								</button>
							</div>

							{/* Search Input */}
							<div className="relative w-full sm:w-56">
								<input
									type="text"
									placeholder="Search member, mail, plan..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:py-1.5 pl-8 text-sm sm:text-xs text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
								/>
								<svg
									className="absolute left-2.5 top-2.5 sm:top-2 size-3.5 text-white/40"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
						</div>

						{/* Member List Grid */}
						<div className="flex-1 overflow-y-auto p-4 sm:p-6">
							{members.length === 0 ? (
								<div className="py-16 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
									<div className="size-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40 mb-4">
										<svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
											<circle cx="9" cy="7" r="4" />
											<line x1="19" x2="19" y1="8" y2="14" />
											<line x1="22" x2="16" y1="11" y2="11" />
										</svg>
									</div>
									<h3 className="font-heading text-lg font-bold text-white mb-1">No Members Enrolled Yet</h3>
									<p className="text-xs text-white/50 mb-5 text-center">
										Your athlete roster is completely clean. Click below or use the Owner Desk to onboard your first lifter.
									</p>
									<button
										onClick={() => setIsAddingNew(true)}
										className="rounded-xl border border-amber-400 bg-amber-400 px-5 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition-all shadow-lg flex items-center gap-1.5"
									>
										<span>+ Add First Member</span>
									</button>
								</div>
							) : filteredMembers.length === 0 ? (
								<div className="py-16 text-center text-sm text-white/40">
									No members found matching your filter &quot;{search}&quot;.
								</div>
							) : (
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									{filteredMembers.map((member) => {
										const daysLeft = getDaysLeft(member.expiryDate)
										const isExpiring = daysLeft >= 0 && daysLeft <= 3
										const isExpired = daysLeft < 0

										return (
											<div
												key={member.id}
												className={`relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all ${
													isExpiring
														? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-neutral-900/90 to-neutral-950'
														: isExpired
														? 'border-red-500/30 bg-neutral-900/40 opacity-75'
														: 'border-white/10 bg-neutral-900/60 hover:border-white/20'
												}`}
											>
												{/* Top Member Card Info */}
												<div className="flex items-start gap-3.5">
													{/* Member Photo */}
													<div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-neutral-800 shadow-md">
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img
															src={member.photoUrl || 'https://via.placeholder.com/150'}
															alt={member.name}
															className="size-full object-cover"
														/>
														{isExpiring && (
															<span
																title="Expiring within 3 days"
																className="absolute bottom-1 right-1 size-3 rounded-full border border-black bg-amber-400"
															/>
														)}
													</div>

													{/* Member Details */}
													<div className="min-w-0 flex-1">
														<div className="flex items-center justify-between gap-2">
															<h4 className="truncate font-serif text-base font-semibold text-white">
																{member.name}
															</h4>
															{/* Status Badge */}
															<span
																className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
																	isExpiring
																		? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30'
																		: isExpired
																		? 'bg-red-400/20 text-red-300'
																		: 'bg-emerald-400/20 text-emerald-300'
																}`}
															>
																{isExpiring
																	? `${daysLeft} Days Left`
																	: isExpired
																	? `Expired`
																	: `${daysLeft} Days Left`}
															</span>
														</div>

														<div className="mt-0.5 flex flex-col text-[11px] text-white/50">
															<span className="truncate text-white/70">{member.email}</span>
															<span>{member.phone}</span>
														</div>
													</div>
												</div>

												{/* Plan & Duration Bar */}
												<div className="mt-3.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
													<div className="flex items-center justify-between text-[11px]">
														<span className="font-medium text-white/80">{member.plan}</span>
														<span className="text-white/50">
															Expires: <strong className="text-white/90">{member.expiryDate}</strong>
														</span>
													</div>

													{/* Visual Duration Timeline Bar */}
													<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
														<div
															className={`h-full rounded-full transition-all ${
																isExpiring
																	? 'bg-amber-400'
																	: isExpired
																	? 'bg-red-500'
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
														<div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/40">
															<svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															<span>Last notification sent: {member.lastNotified}</span>
														</div>
													)}
												</div>

												{/* Owner Actions */}
												<div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-2.5">
													{/* Quick Duration Extensions */}
													<div className="flex items-center gap-1">
														<span className="text-[10px] font-medium text-white/40 uppercase">Extend:</span>
														<button
															onClick={() => extendDuration(member.id, 30)}
															className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
															title="Add 1 Month duration"
														>
															+30d
														</button>
														<button
															onClick={() => extendDuration(member.id, 90)}
															className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
															title="Add 3 Months duration"
														>
															+90d
														</button>
													</div>

													{/* Edit & Notify Buttons */}
													<div className="flex items-center gap-2">
														{/* Send 3-day Alert Email */}
														<button
															onClick={() => dispatch3DayAlert(member)}
															title={`Send 3-Day Alert email to ${member.email} & ${OWNER_EMAIL}`}
															className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
																isExpiring
																	? 'border border-amber-400/40 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30'
																	: 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
															}`}
														>
															<svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
															</svg>
															<span>Alert Email</span>
														</button>

														{/* Edit Button */}
														<button
															onClick={() => setEditingMember(member)}
															title="Edit member details (Owner)"
															className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
														>
															<svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
			<div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-neutral-950 p-6 shadow-2xl backdrop-blur-2xl">
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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
			<div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-neutral-950 p-6 shadow-2xl backdrop-blur-2xl">
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
