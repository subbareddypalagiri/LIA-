'use client'

import { useState } from 'react'
import DesktopStudioPopover from './DesktopStudioPopover'
import { FONT_OPTIONS, useFontTheme, setFontTheme, type FontOption } from '@/store/fontTheme'
import { BG_THEMES, useBgTheme, setBgTheme, type BgTheme } from '@/store/bgTheme'
import { useLiaColor, setLiaColor } from '@/store/liaColor'
import { openGymModal } from '@/store/gymHub'
import { useAuth } from '@/store/authStore'

const PRESET_COLORS = [
	{ name: 'White', hex: '#ffffff' },
	{ name: 'Gold', hex: '#ffb700' },
	{ name: 'Cyan', hex: '#00e5ff' },
	{ name: 'Red', hex: '#ff0055' },
	{ name: 'Green', hex: '#00ff66' },
	{ name: 'Purple', hex: '#b537f2' }
]

export default function MobileStudioControls() {
	const [isOpen, setIsOpen] = useState(false)
	const currentFont = useFontTheme()
	const currentTheme = useBgTheme()
	const currentColor = useLiaColor()
	const { user, isOwner, isMember } = useAuth()

	return (
		<>
			{/* DESKTOP VIEW (>= 768px): Apple-style Glass Studio Bento Popover */}
			<div className="hidden md:flex items-center">
				<DesktopStudioPopover />
			</div>

			{/* MOBILE VIEW (< 768px): Compact Pill Trigger Button */}
			<div className="flex md:hidden items-center">
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/10 active:scale-95"
				>
					<svg
						className="size-3.5 text-amber-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
						/>
					</svg>
					<span>Studio</span>
				</button>
			</div>

			{/* MOBILE BOTTOM SHEET DRAWER */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
						onClick={() => setIsOpen(false)}
					/>

					{/* Drawer Card */}
					<div className="relative w-full max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-white/20 bg-neutral-950/98 p-5 pb-8 shadow-2xl backdrop-blur-2xl">
						{/* Pull handle */}
						<div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />

						{/* Header */}
						<div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
							<div className="flex items-center gap-2">
								<h3 className="font-heading text-lg font-bold tracking-wide uppercase text-white">
									Studio Customizer
								</h3>
								<span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 uppercase">
									Live 3D
								</span>
							</div>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="rounded-full border border-white/10 p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
							>
								<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Gym Features & Owner Tools */}
						<div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/[0.05] p-3">
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[11px] font-bold tracking-wider uppercase text-amber-300">
									Gym Hub & Management
								</span>
								<span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-400 uppercase">
									Interactive
								</span>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<button
									type="button"
									onClick={() => {
										setIsOpen(false)
										openGymModal('exercises')
									}}
									className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2 text-left hover:border-amber-400 transition-colors"
								>
									<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-amber-400 border border-white/10">
										<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white">Exercises</div>
										<div className="text-[9px] text-white/50">Form cues & cues</div>
									</div>
								</button>
								<button
									type="button"
									onClick={() => {
										setIsOpen(false)
										openGymModal('splits')
									}}
									className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2 text-left hover:border-amber-400 transition-colors"
								>
									<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-amber-400 border border-white/10">
										<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
											<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
											<path d="M9 14l2 2 4-4" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white">Workout Splits</div>
										<div className="text-[9px] text-white/50">PPL & Arnold</div>
									</div>
								</button>
								<button
									type="button"
									onClick={() => {
										setIsOpen(false)
										openGymModal('equipment')
									}}
									className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2 text-left hover:border-amber-400 transition-colors"
								>
									<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-amber-400 border border-white/10">
										<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white">Equipment</div>
										<div className="text-[9px] text-white/50">Heavy dumbbells</div>
									</div>
								</button>
								<button
									type="button"
									onClick={() => {
										setIsOpen(false)
										openGymModal('timings')
									}}
									className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2 text-left hover:border-amber-400 transition-colors"
								>
									<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-amber-400 border border-white/10">
										<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<circle cx="12" cy="12" r="10" />
											<polyline points="12 6 12 12 16 14" />
										</svg>
									</div>
									<div>
										<div className="text-xs font-bold text-white">Timings</div>
										<div className="text-[9px] text-white/50">Morning / Evening</div>
									</div>
								</button>
								<button
									type="button"
									onClick={() => {
										setIsOpen(false)
										openGymModal('nutrition')
									}}
									className="col-span-2 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-left hover:border-amber-400 hover:bg-amber-500/15 transition-colors"
								>
									<div className="flex items-center gap-2.5">
										<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
											<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
											</svg>
										</div>
										<div>
											<div className="text-xs font-bold text-amber-300">Macro & Nutrition Engine</div>
											<div className="text-[10px] text-white/70">Calories, protein targets & hypertrophy diet</div>
										</div>
									</div>
									<span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
										Calc →
									</span>
								</button>
								{isOwner && (
									<button
										type="button"
										onClick={() => {
											setIsOpen(false)
											openGymModal('owner')
										}}
										className="col-span-2 flex items-center justify-between rounded-xl border border-amber-400/50 bg-amber-400/20 p-2.5 text-left hover:bg-amber-400/30 transition-colors"
									>
										<div className="flex items-center gap-2.5">
											<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
												<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
												</svg>
											</div>
											<div>
												<div className="text-xs font-bold text-amber-200">Owner Desk</div>
												<div className="text-[10px] text-white/70">Revenue, pending fees & attendance</div>
											</div>
										</div>
										<span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
											Admin →
										</span>
									</button>
								)}

								{isMember && (
									<button
										type="button"
										onClick={() => {
											setIsOpen(false)
											openGymModal('my-membership')
										}}
										className="col-span-2 flex items-center justify-between rounded-xl border border-emerald-400/50 bg-emerald-400/20 p-2.5 text-left hover:bg-emerald-400/30 transition-colors"
									>
										<div className="flex items-center gap-2.5">
											<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
												<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<rect width="18" height="18" x="3" y="3" rx="2" />
													<circle cx="12" cy="10" r="3" />
													<path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
												</svg>
											</div>
											<div>
												<div className="text-xs font-bold text-emerald-200">My Athlete Pass ({user?.name.split(' ')[0]})</div>
												<div className="text-[10px] text-white/70">Membership card, days left & checkin</div>
											</div>
										</div>
										<span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
											Pass →
										</span>
									</button>
								)}

								{!user && (
									<button
										type="button"
										onClick={() => {
											setIsOpen(false)
											openGymModal('auth')
										}}
										className="col-span-2 flex items-center justify-between rounded-xl border border-amber-400/50 bg-amber-400/10 p-2.5 text-left hover:bg-amber-400/20 transition-colors"
									>
										<div className="flex items-center gap-2.5">
											<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300 border border-amber-400/20">
												<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
													<path d="M7 11V7a5 5 0 0 1 10 0v4" />
												</svg>
											</div>
											<div>
												<div className="text-xs font-bold text-amber-300">Member & Owner Login</div>
												<div className="text-[10px] text-white/70">Access athlete pass or owner admin</div>
											</div>
										</div>
										<span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
											Login →
										</span>
									</button>
								)}
							</div>
						</div>

						{/* Section 1: Typography */}
						<div className="mb-5">
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[11px] font-semibold tracking-wider uppercase text-white/50">
									Typography Style
								</span>
								<span className="text-xs font-bold text-amber-400">{currentFont.name}</span>
							</div>
							<div className="grid grid-cols-2 gap-2">
								{FONT_OPTIONS.map((font: FontOption) => (
									<button
										key={font.id}
										type="button"
										onClick={() => setFontTheme(font.id)}
										className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
											currentFont.id === font.id
												? 'border-amber-400 bg-amber-400/15 text-white'
												: 'border-white/10 bg-white/5 text-white/70 hover:border-white/25'
										}`}
									>
										<span className="text-sm font-bold text-white">{font.name}</span>
										<span className="text-[10px] text-white/50">{font.category}</span>
									</button>
								))}
							</div>
						</div>

						{/* Section 2: Lighting & BG Themes */}
						<div className="mb-5">
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[11px] font-semibold tracking-wider uppercase text-white/50">
									Lighting & Ambience ({BG_THEMES.length})
								</span>
								<span className="text-xs font-bold text-amber-400">{currentTheme.name}</span>
							</div>
							<div className="grid grid-cols-3 gap-2">
								{BG_THEMES.map((theme: BgTheme) => {
									const isSelected = currentTheme.id === theme.id
									return (
										<button
											key={theme.id}
											type="button"
											onClick={() => setBgTheme(theme.id)}
											className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all ${
												isSelected
													? 'border-amber-400 bg-amber-400/15 ring-1 ring-amber-400'
													: 'border-white/10 bg-white/5 hover:border-white/25'
											}`}
										>
											<div className="flex size-6 items-center justify-center rounded-full border border-white/20 p-0.5">
												<div
													className="size-full rounded-full"
													style={{
														background: `radial-gradient(circle, ${theme.colors[0]}, ${theme.colors[1]})`
													}}
												/>
											</div>
											<span className="line-clamp-1 text-[10px] font-medium text-white/80">
												{theme.name.split(' ')[0]}
											</span>
										</button>
									)
								})}
							</div>
						</div>

						{/* Section 3: 3D "LIA" Glow Color */}
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[11px] font-semibold tracking-wider uppercase text-white/50">
									3D LIA Neon Accent
								</span>
								<span className="font-mono text-xs text-amber-400">{currentColor}</span>
							</div>
							<div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
								{PRESET_COLORS.map((color) => {
									const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase()
									return (
										<button
											key={color.name}
											type="button"
											onClick={() => setLiaColor(color.hex)}
											className={`size-7 rounded-full border-2 transition-all ${
												isSelected ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-80'
											}`}
											style={{ backgroundColor: color.hex }}
											title={color.name}
										/>
									)
								})}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
