'use client'
'use no memo'
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo, useEffect } from 'react'
import {
	ALL_REP_EXERCISES,
	type RepExercise,
	MUSCLE_CATEGORIES,
	EQUIPMENT_FILTERS,
	matchesMuscleCategory,
	matchesEquipment
} from '@/lib/exerciseData'

interface ExerciseVaultViewProps {
	onOpenStudio?: (studioId: string) => void
	showToast?: (msg: string) => void
}

function getBiomechanicsStudioId(name: string): string | null {
	const n = name.toLowerCase()
	if (n.includes('lat pull') || n.includes('pulldown')) return 'lat-pulldown'
	if (n.includes('bench press') || n.includes('incline press')) return 'incline-press'
	if (n.includes('squat')) return 'barbell-squat'
	if (n.includes('overhead press') || n.includes('shoulder press') || n.includes('military')) return 'shoulder-press'
	if (n.includes('bicep') || n.includes('curl')) return 'bicep-curl'
	if (n.includes('tricep') || n.includes('pushdown')) return 'tricep-pushdown'
	return null
}

export default function ExerciseVaultView({ onOpenStudio, showToast }: ExerciseVaultViewProps) {
	const [selectedMuscle, setSelectedMuscle] = useState<string>('All')
	const [selectedEquipment, setSelectedEquipment] = useState<string>('All Equipment')
	const [exerciseSearch, setExerciseSearch] = useState('')
	const [visibleCount, setVisibleCount] = useState<number>(24)
	const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<RepExercise | null>(null)
	const [detailPhase, setDetailPhase] = useState<'start' | 'peak'>('start')
	const [savedIds, setSavedIds] = useState<string[]>([])

	// Load saved exercises from localStorage
	useEffect(() => {
		try {
			const saved = localStorage.getItem('lia_saved_exercises')
			if (saved) setSavedIds((JSON.parse(saved) as string[]) || [])
		} catch {}
	}, [])

	const toggleSave = (id: string, e?: React.MouseEvent) => {
		if (e) e.stopPropagation()
		setSavedIds((prev) => {
			const exists = prev.includes(id)
			const next = exists ? prev.filter((x) => x !== id) : [...prev, id]
			try {
				localStorage.setItem('lia_saved_exercises', JSON.stringify(next))
			} catch {}
			if (showToast) {
				showToast(exists ? 'Removed from saved' : 'Saved to favorites 🔖')
			}
			return next
		})
	}

	// Filtered list
	const filteredExercises = useMemo(() => {
		const searchLower = exerciseSearch.trim().toLowerCase()
		return ALL_REP_EXERCISES.filter((ex) => {
			// Muscle Category
			if (selectedMuscle === 'Saved') {
				if (!savedIds.includes(ex.id)) return false
			} else if (!matchesMuscleCategory(ex, selectedMuscle)) {
				return false
			}

			// Equipment Filter
			if (!matchesEquipment(ex, selectedEquipment)) {
				return false
			}

			// Search Query
			if (searchLower) {
				const matchesName = ex.name.toLowerCase().includes(searchLower)
				const matchesPrimary = ex.primaryMuscles.some((m) => m.toLowerCase().includes(searchLower))
				const matchesSecondary = ex.secondaryMuscles.some((m) => m.toLowerCase().includes(searchLower))
				const matchesEq = ex.equipment.toLowerCase().includes(searchLower)
				if (!matchesName && !matchesPrimary && !matchesSecondary && !matchesEq) return false
			}

			return true
		})
	}, [selectedMuscle, selectedEquipment, exerciseSearch, savedIds])

	// Reset pagination on filter change
	useEffect(() => {
		setVisibleCount(24)
	}, [selectedMuscle, selectedEquipment, exerciseSearch])

	const displayedExercises = useMemo(() => {
		return filteredExercises.slice(0, visibleCount)
	}, [filteredExercises, visibleCount])

	// Muscle category counts
	const muscleCounts = useMemo(() => {
		const counts: Record<string, number> = { All: ALL_REP_EXERCISES.length, Saved: savedIds.length }
		MUSCLE_CATEGORIES.forEach((cat) => {
			if (cat.value !== 'All' && cat.value !== 'Saved') {
				counts[cat.value] = ALL_REP_EXERCISES.filter((ex) => matchesMuscleCategory(ex, cat.value)).length
			}
		})
		return counts
	}, [savedIds.length])

	return (
		<div>
			{/* Header & Search */}
			<div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2.5 mb-1">
						<h2 className="font-heading text-2xl font-black uppercase tracking-wide text-white">
							Exercise Vault (600+)
						</h2>
						<span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
							609 Protocols
						</span>
					</div>
					<p className="text-xs text-white/60">
						Complete movement library with uniform 2D illustrations, dual-phase start & peak contractions, and step-by-step form cues.
					</p>
				</div>

				{/* Search Bar */}
				<div className="relative min-w-[280px]">
					<input
						type="text"
						value={exerciseSearch}
						onChange={(e) => setExerciseSearch(e.target.value)}
						placeholder="Search 600+ exercises, muscles, equipment..."
						className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-8 py-2.5 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
					/>
					<span className="absolute left-3 top-3 text-xs text-white/40">🔍</span>
					{exerciseSearch && (
						<button
							onClick={() => setExerciseSearch('')}
							className="absolute right-2.5 top-2.5 text-xs text-white/40 hover:text-white p-1"
						>
							✕
						</button>
					)}
				</div>
			</div>

			{/* Muscle Category Filter Pills (Horizontal swipe on mobile, wrap on desktop) */}
			<div className="mb-3.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar sm:flex-wrap pb-1">
				{MUSCLE_CATEGORIES.map((cat) => {
					const count = muscleCounts[cat.value] || 0
					const isActive = selectedMuscle === cat.value
					return (
						<button
							key={cat.value}
							onClick={() => setSelectedMuscle(cat.value)}
							className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
								isActive
									? 'bg-amber-400 text-black shadow-md font-bold'
									: 'border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
							}`}
						>
							<span>{cat.label}</span>
							<span
								className={`text-[10px] rounded-full px-1.5 py-0.2 ${
									isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-white/50'
								}`}
							>
								{count}
							</span>
						</button>
					)
				})}
			</div>

			{/* Equipment Filter Bar (Horizontal swipe on mobile) */}
			<div className="mb-5 flex items-center gap-1.5 text-[11px] border-b border-white/10 pb-3 overflow-x-auto no-scrollbar sm:flex-wrap">
				<span className="text-white/40 mr-1 font-semibold uppercase tracking-wider text-[10px] shrink-0">
					Equipment:
				</span>
				{EQUIPMENT_FILTERS.map((eq) => {
					const isActive = selectedEquipment === eq
					return (
						<button
							key={eq}
							onClick={() => setSelectedEquipment(eq)}
							className={`rounded-lg px-2.5 py-1 capitalize transition-all shrink-0 ${
								isActive
									? 'bg-white/20 text-amber-300 font-bold border border-amber-400/40'
									: 'text-white/60 hover:text-white hover:bg-white/5'
							}`}
						>
							{eq}
						</button>
					)
				})}
			</div>

			{/* Active Count & Feedback */}
			<div className="mb-4 flex items-center justify-between text-xs text-white/50">
				<div>
					Showing <span className="font-bold text-white">{displayedExercises.length}</span> of{' '}
					<span className="font-bold text-amber-400">{filteredExercises.length}</span> matching exercises
				</div>
				{filteredExercises.length === 0 && (
					<div className="text-amber-400/80">No exercises found. Try adjusting search or filters.</div>
				)}
			</div>

			{/* 2-to-4 Columns Responsive Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
				{displayedExercises.map((ex) => {
					const isSaved = savedIds.includes(ex.id)
					const studioId = getBiomechanicsStudioId(ex.name)

					return (
						<div
							key={ex.id}
							className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] p-2.5 sm:p-3 transition-all hover:border-amber-400/60 hover:bg-white/[0.08] cursor-pointer shadow-lg hover:shadow-amber-400/10"
							onClick={() => {
								setSelectedExerciseDetail(ex)
								setDetailPhase('start')
							}}
						>
							<div>
								{/* Card Top Action Bar: Bookmark & Difficulty Tag */}
								<div className="flex items-center justify-between mb-2">
									<button
										type="button"
										onClick={(e) => toggleSave(ex.id, e)}
										className={`flex size-7 items-center justify-center rounded-lg border transition-all ${
											isSaved
												? 'border-amber-400 bg-amber-400 text-black font-bold shadow-md'
												: 'border-white/10 bg-black/40 text-white/40 hover:text-white'
										}`}
										title={isSaved ? 'Remove bookmark' : 'Bookmark exercise'}
									>
										<svg className="size-3.5 fill-current" viewBox="0 0 24 24">
											<path d="M5 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v19.143a.5.5 0 0 1-.777.416L12 18.018l-6.223 4.541A.5.5 0 0 1 5 22.143V3z" />
										</svg>
									</button>

									<span
										className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
											ex.difficulty === 'beginner'
												? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
												: ex.difficulty === 'expert'
												? 'bg-rose-400/10 border-rose-400/30 text-rose-300'
												: 'bg-amber-400/10 border-amber-400/20 text-amber-300'
										}`}
									>
										{ex.difficulty}
									</span>
								</div>

								{/* Centered RepDB 2D Illustration with Hover Dual-Phase */}
								<div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-white flex items-center justify-center p-2 mb-2.5 shadow-sm">
									{/* Default Start Position */}
									<img
										src={ex.startImage || ex.peakImage}
										alt={ex.name}
										loading="lazy"
										className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 group-hover:opacity-0"
									/>
									{/* Hover Peak Contraction Position */}
									{ex.peakImage && (
										<img
											src={ex.peakImage}
											alt={`${ex.name} peak contraction`}
											loading="lazy"
											className="absolute inset-0 h-full w-full object-contain p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:scale-105"
										/>
									)}
									{/* Phase Indicator Badge */}
									<div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[8px] font-medium text-white/70 backdrop-blur-sm pointer-events-none">
										Start ⇄ Peak
									</div>
								</div>

								{/* Exercise Name & Primary Muscle */}
								<div className="space-y-1 mb-2">
									<h4 className="font-heading text-xs sm:text-sm font-bold tracking-wide text-white group-hover:text-amber-300 transition-colors line-clamp-2">
										{ex.name}
									</h4>
									<div className="flex flex-wrap items-center gap-1">
										<span className="rounded bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 capitalize">
											{ex.primaryMuscles[0] || ex.bodyPart}
										</span>
										<span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/60 capitalize">
											{ex.equipment}
										</span>
									</div>
								</div>
							</div>

							{/* Card Footer */}
							<div className="border-t border-white/10 pt-2 flex items-center justify-between text-[10px] text-white/60">
								<span className="capitalize">{ex.category}</span>
								<span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-0.5">
									{studioId ? '3D Studio 🎚️' : 'Details →'}
								</span>
							</div>
						</div>
					)
				})}
			</div>

			{/* Pagination / Load More Controls */}
			{filteredExercises.length > visibleCount && (
				<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-white/10 pt-6">
					<button
						onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredExercises.length))}
						className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-300 transition-all hover:bg-amber-400 hover:text-black shadow-lg"
					>
						Load More (+24 Exercises)
					</button>
					<button
						onClick={() => setVisibleCount(filteredExercises.length)}
						className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
					>
						Show All ({filteredExercises.length})
					</button>
				</div>
			)}

			{/* Footer Attribution Badge */}
			<div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-white/40">
				<div>Exercise database powered by RepDB Open Fitness Library</div>
				<div>Total 609 Movement Protocols</div>
			</div>

			{/* EXERCISE DETAIL MODAL */}
			{selectedExerciseDetail && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/80 backdrop-blur-md"
						onClick={() => setSelectedExerciseDetail(null)}
					/>

					{/* Modal Window */}
					<div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-neutral-950 p-5 sm:p-7 shadow-2xl text-white">
						{/* Header */}
						<div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-5">
							<div>
								<div className="flex flex-wrap items-center gap-2 mb-1.5">
									<span className="rounded bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
										{selectedExerciseDetail.bodyPart}
									</span>
									<span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70 capitalize">
										{selectedExerciseDetail.difficulty}
									</span>
									<span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70 capitalize">
										{selectedExerciseDetail.equipment}
									</span>
								</div>
								<h3 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
									{selectedExerciseDetail.name}
								</h3>
							</div>

							<div className="flex items-center gap-2">
								<button
									onClick={(e) => toggleSave(selectedExerciseDetail.id, e)}
									className={`flex size-8 items-center justify-center rounded-xl border transition-all ${
										savedIds.includes(selectedExerciseDetail.id)
											? 'border-amber-400 bg-amber-400 text-black font-bold'
											: 'border-white/15 bg-white/5 text-white/60 hover:text-white'
									}`}
									title="Save exercise"
								>
									<svg className="size-4 fill-current" viewBox="0 0 24 24">
										<path d="M5 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v19.143a.5.5 0 0 1-.777.416L12 18.018l-6.223 4.541A.5.5 0 0 1 5 22.143V3z" />
									</svg>
								</button>
								<button
									onClick={() => setSelectedExerciseDetail(null)}
									className="flex size-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
								>
									✕
								</button>
							</div>
						</div>

						{/* Dual-Phase Movement Illustration Viewer */}
						<div className="mb-6">
							<div className="flex items-center justify-center gap-2 mb-3">
								<button
									onClick={() => setDetailPhase('start')}
									className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
										detailPhase === 'start'
											? 'bg-amber-400 text-black shadow-md'
											: 'border border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
									}`}
								>
									1. Start Position
								</button>
								<button
									onClick={() => setDetailPhase('peak')}
									className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
										detailPhase === 'peak'
											? 'bg-amber-400 text-black shadow-md'
											: 'border border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
									}`}
								>
									2. Peak Contraction (Squeeze)
								</button>
							</div>

							<div className="relative aspect-[16/10] w-full max-h-72 rounded-2xl overflow-hidden bg-white p-4 shadow-inner flex items-center justify-center mx-auto">
								<img
									src={
										detailPhase === 'start'
											? selectedExerciseDetail.startImage || selectedExerciseDetail.peakImage
											: selectedExerciseDetail.peakImage || selectedExerciseDetail.startImage
									}
									alt={`${selectedExerciseDetail.name} ${detailPhase}`}
									className="h-full w-full object-contain"
								/>
							</div>
						</div>

						{/* Muscles Involved */}
						<div className="mb-5 space-y-2">
							<div className="text-xs font-bold uppercase tracking-wider text-white/60">
								Target Muscle Anatomy
							</div>
							<div className="flex flex-wrap gap-2">
								{selectedExerciseDetail.primaryMuscles.map((m) => (
									<span
										key={m}
										className="rounded-lg bg-emerald-400/15 border border-emerald-400/30 px-2.5 py-1 text-xs font-semibold text-emerald-300 capitalize"
									>
										Primary: {m}
									</span>
								))}
								{selectedExerciseDetail.secondaryMuscles.map((m) => (
									<span
										key={m}
										className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-white/70 capitalize"
									>
										Assisting: {m}
									</span>
								))}
							</div>
						</div>

						{/* Step-by-Step Instructions */}
						{selectedExerciseDetail.instructions.length > 0 && (
							<div className="mb-5 space-y-2.5">
								<div className="text-xs font-bold uppercase tracking-wider text-white/60">
									Execution Blueprint
								</div>
								<div className="space-y-2">
									{selectedExerciseDetail.instructions.map((step, idx) => (
										<div key={idx} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3 text-xs leading-relaxed text-white/80">
											<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-300">
												{idx + 1}
											</span>
											<span>{step}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Coach Pro Tips */}
						{selectedExerciseDetail.tips.length > 0 && (
							<div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
								<div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
									<span>💡 Coach&apos;s Form Cues & Safety Tips</span>
								</div>
								<ul className="space-y-1.5 text-xs text-amber-100/90 list-disc list-inside">
									{selectedExerciseDetail.tips.map((tip, idx) => (
										<li key={idx}>{tip}</li>
									))}
								</ul>
							</div>
						)}

						{/* Footer Actions */}
						<div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
							{getBiomechanicsStudioId(selectedExerciseDetail.name) ? (
								<button
									onClick={() => {
										const studioId = getBiomechanicsStudioId(selectedExerciseDetail.name)!
										setSelectedExerciseDetail(null)
										if (onOpenStudio) onOpenStudio(studioId)
									}}
									className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-400/20 hover:brightness-110 transition-all flex items-center gap-1.5"
								>
									<span>🎚️ Explore in 3D Biomechanics Studio</span>
									<span>→</span>
								</button>
							) : (
								<div className="text-[11px] text-white/40">RepDB Standard 2D Model</div>
							)}

							<button
								onClick={() => setSelectedExerciseDetail(null)}
								className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all ml-auto"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
