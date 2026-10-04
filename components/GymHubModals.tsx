'use client'
'use no memo'
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from 'react'
import { useGymModal, type GymModalType } from '@/store/gymHub'
import ExerciseBiomechanicsEngine from './ExerciseBiomechanicsEngine'

// --- DATA STRUCTURES ---

interface Exercise {
	id: string
	name: string
	muscle: 'Biceps' | 'Triceps' | 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core'
	target: string
	setsReps: string
	equipment: string
	cue: string
	level: 'Heavy Mass' | 'Isolation' | 'Compound'
	image: string
	biomechanicsId: string
}

const EXERCISES_DATA: Exercise[] = [
	{
		id: 'ex-bicep-1',
		name: 'Dumbbell Biceps Curl',
		muscle: 'Biceps',
		target: 'Biceps Brachii (Short & Long Heads)',
		setsReps: '4 Sets × 10–12 Reps',
		equipment: 'Standing Free Weights / Dumbbells',
		cue: 'Keep elbows tucked to ribs, curl smoothly without swinging torso, squeeze at top.',
		level: 'Isolation',
		image: '/exercises/dumbbell-bicep-curl.jpg',
		biomechanicsId: 'bicep-curl'
	},
	{
		id: 'ex-bicep-2',
		name: 'Dumbbell Seated Curl',
		muscle: 'Biceps',
		target: 'Biceps Brachii Peak & Brachialis',
		setsReps: '4 Sets × 10–12 Reps',
		equipment: 'Utility Flat Bench + Heavy Dumbbells',
		cue: 'Seated posture eliminates cheat momentum. Supinate wrists as you reach peak contraction.',
		level: 'Isolation',
		image: '/exercises/dumbbell-seated-curl.jpg',
		biomechanicsId: 'bicep-curl'
	},
	{
		id: 'ex-tricep-1',
		name: 'Cable Single Arm Triceps Pushdown',
		muscle: 'Triceps',
		target: 'Triceps Brachii (Lateral & Medial Heads)',
		setsReps: '4 Sets × 12–15 Reps',
		equipment: 'Single Cable Pulley + Ergonomic Grip',
		cue: 'Pin elbow firmly beside torso, drive handle downward to complete elbow extension.',
		level: 'Isolation',
		image: '/exercises/cable-tricep-pushdown.jpg',
		biomechanicsId: 'tricep-pushdown'
	},
	{
		id: 'ex-bicep-3',
		name: 'Alternate Biceps Curl',
		muscle: 'Biceps',
		target: 'Biceps Brachii Hypertrophy',
		setsReps: '4 Sets × 8–10 Reps',
		equipment: 'Standing Dumbbells',
		cue: 'Alternate arms deliberately, giving 100% focus and mind-muscle connection per side.',
		level: 'Isolation',
		image: '/exercises/alternate-bicep-curl.jpg',
		biomechanicsId: 'bicep-curl'
	},
	{
		id: 'ex-chest-1',
		name: 'Incline Dumbbell Press',
		muscle: 'Chest',
		target: 'Clavicular Upper Pecs',
		setsReps: '4 Sets × 8–10 Reps',
		equipment: '30° Incline Bench, Heavy DBs',
		cue: 'Retract scapula, keep elbows angled at 45°, feel deep eccentric stretch without bouncing.',
		level: 'Heavy Mass',
		image: '/exercises/card-incline-press.jpg',
		biomechanicsId: 'incline-press'
	},
	{
		id: 'ex-back-1',
		name: 'Heavy Cable Lat Pulldown',
		muscle: 'Back',
		target: 'Latissimus Dorsi Width & V-Taper',
		setsReps: '4 Sets × 10–12 Reps',
		equipment: 'Cable Lat Tower + Wide Lat Bar',
		cue: 'Drive elbows down into back pockets, arch sternum to bar, avoid backwards swing.',
		level: 'Compound',
		image: '/exercises/card-lat-pulldown.jpg',
		biomechanicsId: 'lat-pulldown'
	},
	{
		id: 'ex-legs-1',
		name: 'Olympic Barbell Back Squat',
		muscle: 'Legs',
		target: 'Quadriceps, Glutes & Adductors',
		setsReps: '5 Sets × 5–8 Reps',
		equipment: 'Power Cage + Olympic Barbell',
		cue: 'Brace core, break at hips and knees together, hit parallel depth, drive through mid-foot.',
		level: 'Compound',
		image: '/exercises/card-barbell-squat.jpg',
		biomechanicsId: 'barbell-squat'
	},
	{
		id: 'ex-shoulder-1',
		name: 'Seated Dumbbell Overhead Press',
		muscle: 'Shoulders',
		target: '3D Anterior & Lateral Deltoids',
		setsReps: '4 Sets × 8–10 Reps',
		equipment: '75° Utility Bench + Heavy DBs',
		cue: 'Press in scapular plane 30° forward, avoid flaring elbows 90° to protect rotator cuff.',
		level: 'Heavy Mass',
		image: '/exercises/card-shoulder-press.jpg',
		biomechanicsId: 'shoulder-press'
	},
	{
		id: 'ex-chest-2',
		name: 'Barbell Flat Bench Press',
		muscle: 'Chest',
		target: 'Sternal Mid & Lower Pecs',
		setsReps: '4 Sets × 6–8 Reps',
		equipment: 'Olympic Barbell & Bench',
		cue: 'Drive feet into platform, touch lower sternum and press explosively.',
		level: 'Compound',
		image: '/exercises/card-incline-press.jpg',
		biomechanicsId: 'incline-press'
	},
	{
		id: 'ex-tricep-2',
		name: 'Cable Tricep Rope Pushdown',
		muscle: 'Triceps',
		target: 'Triceps Horseshoe Lateral Head',
		setsReps: '4 Sets × 12–15 Reps',
		equipment: 'Cable Pulley Tower + Dual Knot Rope',
		cue: 'Flare rope ends outward at bottom lockout for intense lateral head squeeze.',
		level: 'Isolation',
		image: '/exercises/cable-tricep-pushdown.jpg',
		biomechanicsId: 'tricep-pushdown'
	},
	{
		id: 'ex-back-2',
		name: 'Chest-Supported T-Bar Row',
		muscle: 'Back',
		target: 'Mid-Back & Rhomboid Thickness',
		setsReps: '3 Sets × 10–12 Reps',
		equipment: 'Plate-Loaded T-Bar Machine',
		cue: 'Isolates back without lower back fatigue. Full stretch at bottom, squeeze traps at top.',
		level: 'Heavy Mass',
		image: '/exercises/card-lat-pulldown.jpg',
		biomechanicsId: 'lat-pulldown'
	},
	{
		id: 'ex-legs-2',
		name: 'Linear 45° Leg Press',
		muscle: 'Legs',
		target: 'Quad Hypertrophy Volume',
		setsReps: '4 Sets × 12–15 Reps',
		equipment: 'Plate-Loaded Leg Press',
		cue: 'Feet shoulder-width on platform, control 3-second descent, do not lock knees at lockout.',
		level: 'Compound',
		image: '/exercises/card-barbell-squat.jpg',
		biomechanicsId: 'barbell-squat'
	}
]

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

	// Modals internal states
	const [selectedMuscle, setSelectedMuscle] = useState<string>('All')
	const [exerciseSearch, setExerciseSearch] = useState('')
	const [activeSplitId, setActiveSplitId] = useState('ppl')
	const [toastText, setToastText] = useState<string | null>(null)

	// Owner desk mock state
	const [checkInCount, setCheckInCount] = useState(38)
	const [newMemberName, setNewMemberName] = useState('')
	const [newMemberPhone, setNewMemberPhone] = useState('')
	const [newMemberPlan, setNewMemberPlan] = useState('3 Months Hypertrophy')
	const [maintenanceLogged, setMaintenanceLogged] = useState(false)

	// Exercises view mode & inspected item (default to Library grid matching reference app)
	const [exerciseSubView, setExerciseSubView] = useState<'studio' | 'list'>('list')
	const [inspectedExerciseId, setInspectedExerciseId] = useState<string>('bicep-curl')
	const [savedIds, setSavedIds] = useState<string[]>(['ex-bicep-1', 'ex-tricep-1'])

	const showToast = (msg: string) => {
		setToastText(msg)
		setTimeout(() => setToastText(null), 3000)
	}

	const toggleSave = (id: string, e: React.MouseEvent) => {
		e.stopPropagation()
		setSavedIds((prev) => {
			const exists = prev.includes(id)
			const next = exists ? prev.filter((x) => x !== id) : [...prev, id]
			showToast(exists ? 'Removed from saved' : 'Saved to favorites 🔖')
			return next
		})
	}

	const filteredExercises = useMemo(() => {
		return EXERCISES_DATA.filter((ex) => {
			const matchesMuscle =
				selectedMuscle === 'All'
					? true
					: selectedMuscle === 'Saved 🔖'
					? savedIds.includes(ex.id)
					: ex.muscle === selectedMuscle
			const matchesSearch =
				ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
				ex.target.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
				ex.equipment.toLowerCase().includes(exerciseSearch.toLowerCase())
			return matchesMuscle && matchesSearch
		})
	}, [selectedMuscle, exerciseSearch, savedIds])

	if (!activeModal) return null

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
				<div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 bg-white/[0.02]">
					<div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
						<button
							onClick={() => openModal('exercises')}
							className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
								activeModal === 'exercises'
									? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
									: 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
							}`}
						>
							🏋️ Exercises
						</button>
						<button
							onClick={() => openModal('splits')}
							className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
								activeModal === 'splits'
									? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
									: 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
							}`}
						>
							📋 Workout Splits
						</button>
						<button
							onClick={() => openModal('equipment')}
							className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
								activeModal === 'equipment'
									? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
									: 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
							}`}
						>
							⚡ Equipment
						</button>
						<button
							onClick={() => openModal('timings')}
							className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
								activeModal === 'timings'
									? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
									: 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
							}`}
						>
							⏰ Timings
						</button>
						<button
							onClick={() => openModal('owner')}
							className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
								activeModal === 'owner'
									? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
									: 'border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
							}`}
						>
							<span>👑 Owner Desk</span>
							<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
						</button>
					</div>

					<button
						onClick={closeModal}
						className="ml-3 rounded-full border border-white/10 p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
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
							{/* Sub-View Switcher: 3D Biomechanics Studio vs Catalog */}
							<div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
								<div className="flex items-center gap-2">
									<button
										onClick={() => setExerciseSubView('studio')}
										className={`rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
											exerciseSubView === 'studio'
												? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
												: 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
										}`}
									>
										<span>🎚️ 3D Biomechanics Studio</span>
										<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
									</button>
									<button
										onClick={() => setExerciseSubView('list')}
										className={`rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
											exerciseSubView === 'list'
												? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
												: 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
										}`}
									>
										📋 Exercise Library ({EXERCISES_DATA.length})
									</button>
								</div>
								<div className="text-[11px] text-white/50">
									{exerciseSubView === 'studio'
										? 'Interactive rep scrubber, muscle heatmap & joint angles'
										: 'Browse all exercise protocols'}
								</div>
							</div>

							{exerciseSubView === 'studio' ? (
								<ExerciseBiomechanicsEngine
									initialExerciseId={inspectedExerciseId}
									onBack={() => setExerciseSubView('list')}
								/>
							) : (
								<div>
									<div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
										<div>
											<h2 className="font-heading text-2xl font-black uppercase tracking-wide text-white">
												Hypertrophy Exercise Vault
											</h2>
											<p className="text-xs text-white/60">
												Golden Era form cues, motor-unit recruitment angles, and evidence-based progressive overload.
											</p>
										</div>
										{/* Search */}
										<div className="relative min-w-[240px]">
											<input
												type="text"
												value={exerciseSearch}
												onChange={(e) => setExerciseSearch(e.target.value)}
												placeholder="Search exercises, muscles..."
												className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
											/>
											{exerciseSearch && (
												<button
													onClick={() => setExerciseSearch('')}
													className="absolute right-2.5 top-2.5 text-xs text-white/40 hover:text-white"
												>
													✕
												</button>
											)}
										</div>
									</div>

									{/* Muscle Category Filter Pills */}
									<div className="mb-5 flex flex-wrap gap-2">
										{['All', 'Biceps', 'Triceps', 'Chest', 'Back', 'Legs', 'Shoulders', 'Saved 🔖'].map((muscle) => (
											<button
												key={muscle}
												onClick={() => setSelectedMuscle(muscle)}
												className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-all ${
													selectedMuscle === muscle
														? 'bg-amber-400 text-black shadow-md font-bold'
														: 'border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
												}`}
											>
												{muscle}
											</button>
										))}
									</div>

									{/* 2-Column Responsive Exercise Library Grid (Matching Phone Reference App) */}
									<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
										{filteredExercises.map((ex) => {
											const isSaved = savedIds.includes(ex.id)

											return (
												<div
													key={ex.id}
													className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] p-2.5 sm:p-3 transition-all hover:border-amber-400/60 hover:bg-white/[0.08] cursor-pointer shadow-lg hover:shadow-amber-400/10"
													onClick={() => {
														setInspectedExerciseId(ex.biomechanicsId)
														setExerciseSubView('studio')
													}}
												>
													<div>
														{/* Card Top Action Bar: Bookmark & Level Tag */}
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

															<span className="rounded bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
																{ex.level}
															</span>
														</div>

														{/* Centered Anatomical Muscular Body Illustration */}
														<div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-white flex items-center justify-center p-2 mb-2.5 shadow-sm">
															<img
																src={ex.image}
																alt={ex.name}
																className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
															/>
														</div>

														{/* Exercise Name & Muscle Category */}
														<div className="space-y-0.5 mb-2">
															<h4 className="font-heading text-xs sm:text-sm font-bold tracking-wide text-white group-hover:text-amber-300 transition-colors line-clamp-2">
																{ex.name}
															</h4>
															<span className="text-[11px] font-semibold text-white/50 block">
																{ex.muscle}
															</span>
														</div>
													</div>

													{/* Card Footer: Sets & Tap Cue */}
													<div className="border-t border-white/10 pt-2 flex items-center justify-between text-[10px] text-white/60">
														<span className="font-medium text-white/80">{ex.setsReps}</span>
														<span className="text-amber-400 font-semibold group-hover:underline">
															View Form →
														</span>
													</div>
												</div>
											)
										})}
									</div>
								</div>
							)}
						</div>
					)}

					{/* 2. WORKOUT SPLITS */}
					{activeModal === 'splits' && (
						<div>
							<div className="mb-6">
								<h2 className="font-heading text-2xl font-black uppercase tracking-wide text-white">
									Battle-Tested Training Splits
								</h2>
								<p className="text-xs text-white/60">
									Select your preferred training frequency and execution blueprint.
								</p>
							</div>

							{/* Split Selector Tabs */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
								{SPLIT_PROGRAMS.map((prog) => (
									<button
										key={prog.id}
										onClick={() => setActiveSplitId(prog.id)}
										className={`rounded-2xl border p-4 text-left transition-all ${
											activeSplitId === prog.id
												? 'border-amber-400 bg-amber-400/10 shadow-lg'
												: 'border-white/10 bg-white/5 hover:border-white/20'
										}`}
									>
										<div className="flex items-center justify-between mb-1">
											<span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
												{prog.daysPerWeek}
											</span>
											<span className="text-[10px] text-white/40">{prog.difficulty}</span>
										</div>
										<h3 className="font-heading text-base font-bold text-white mb-1">
											{prog.name}
										</h3>
										<p className="text-[11px] text-white/60 line-clamp-2">{prog.tagline}</p>
									</button>
								))}
							</div>

							{/* Active Split Day-by-Day View */}
							{(() => {
								const currentProg = SPLIT_PROGRAMS.find((p) => p.id === activeSplitId)!
								return (
									<div className="space-y-4">
										<div className="flex items-center justify-between border-b border-white/10 pb-3">
											<div>
												<h3 className="text-base font-bold text-white">{currentProg.name} Schedule</h3>
												<p className="text-xs text-white/60">{currentProg.tagline}</p>
											</div>
											<button
												onClick={() => {
													const routineText = `${currentProg.name}\n${currentProg.days
														.map((d) => `${d.day} (${d.focus}):\n- ${d.exercises.join('\n- ')}`)
														.join('\n\n')}`
													navigator.clipboard?.writeText(routineText)
													showToast(`Copied ${currentProg.name} Routine to Clipboard!`)
												}}
												className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition-all flex items-center gap-1.5"
											>
												<svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
												</svg>
												<span>Copy Routine</span>
											</button>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											{currentProg.days.map((d, i) => (
												<div
													key={i}
													className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 transition-all"
												>
													<div className="flex items-center justify-between mb-2">
														<span className="font-heading text-sm font-bold text-white tracking-wide">
															{d.day}
														</span>
														<span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-amber-300 font-medium">
															{d.focus}
														</span>
													</div>
													<ul className="space-y-1.5 text-xs text-white/70">
														{d.exercises.map((ex, eIdx) => (
															<li key={eIdx} className="flex items-center gap-2">
																<span className="size-1 rounded-full bg-amber-400 shrink-0" />
																<span>{ex}</span>
															</li>
														))}
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
						<div>
							<div className="mb-6">
								<h2 className="font-heading text-2xl font-black uppercase tracking-wide text-white">
									Heavy Iron & Biomechanical Gear
								</h2>
								<p className="text-xs text-white/60">
									Every barbell, cable stack, and plate-loaded station is calibrated for zero joint shearing and optimal resistance curves.
								</p>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{EQUIPMENT_DATA.map((eq, i) => (
									<div
										key={i}
										className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-amber-400/40 transition-all"
									>
										<div className="flex items-start justify-between gap-2 mb-2">
											<div>
												<span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
													{eq.category}
												</span>
												<h3 className="font-heading text-lg font-bold text-white">{eq.name}</h3>
											</div>
											<span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 shrink-0">
												{eq.status}
											</span>
										</div>
										<p className="text-xs text-white/70 mb-3">{eq.specs}</p>
										<div className="rounded-xl bg-black/40 p-2.5 text-[11px] font-mono text-white/80 border border-white/5 flex items-center gap-2">
											<span className="text-amber-400">Inventory:</span>
											<span>{eq.quantity}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* 4. TIMINGS & BATCHES */}
					{activeModal === 'timings' && (
						<div>
							<div className="mb-6">
								<h2 className="font-heading text-2xl font-black uppercase tracking-wide text-white">
									Training Batches & Operating Hours
								</h2>
								<p className="text-xs text-white/60">
									Structured training slots with dedicated floor coaches and biomechanics guidance.
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
								{/* Morning */}
								<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
									<div className="flex items-center gap-2 mb-3">
										<span className="text-xl">🌅</span>
										<h3 className="font-heading text-lg font-bold text-white">Morning Sessions</h3>
										<span className="ml-auto rounded bg-amber-400/10 text-amber-400 px-2 py-0.5 text-[10px] font-bold">
											05:30 AM – 11:30 AM
										</span>
									</div>
									<div className="space-y-3 text-xs text-white/80">
										<div className="border-l-2 border-amber-400 pl-3">
											<div className="font-bold text-white">05:30 AM – 07:30 AM</div>
											<div className="text-white/60">Early Bird Powerlifters & Heavy Compounds</div>
										</div>
										<div className="border-l-2 border-white/20 pl-3">
											<div className="font-bold text-white">07:30 AM – 09:30 AM</div>
											<div className="text-white/60">Executive & Professional Hypertrophy</div>
										</div>
										<div className="border-l-2 border-white/20 pl-3">
											<div className="font-bold text-white">09:30 AM – 11:30 AM</div>
											<div className="text-white/60">Cardio Conditioning & Dedicated Floor Coaching</div>
										</div>
									</div>
								</div>

								{/* Evening */}
								<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
									<div className="flex items-center gap-2 mb-3">
										<span className="text-xl">🌙</span>
										<h3 className="font-heading text-lg font-bold text-white">Evening Sessions</h3>
										<span className="ml-auto rounded bg-amber-400/10 text-amber-400 px-2 py-0.5 text-[10px] font-bold">
											04:30 PM – 10:30 PM
										</span>
									</div>
									<div className="space-y-3 text-xs text-white/80">
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

					{/* 5. OWNER DESK (OWNER KI USE AYYE OPTIONS) */}
					{activeModal === 'owner' && (
						<div>
							<div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
								<div>
									<div className="flex items-center gap-2 mb-1">
										<h2 className="font-heading text-2xl font-black uppercase tracking-wide text-white">
											LIA Iron Club — Owner Desk
										</h2>
										<span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
											Admin Verified
										</span>
									</div>
									<p className="text-xs text-white/60">
										Gym operational metrics, revenue ledger, daily attendance, and new member onboarding.
									</p>
								</div>
								{/* Quick Entry Logger */}
								<button
									onClick={() => {
										setCheckInCount((c) => c + 1)
										showToast(`Logged member entry! Total today: ${checkInCount + 1}`)
									}}
									className="rounded-xl border border-amber-400 bg-amber-400 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-amber-300 transition-all flex items-center gap-1.5 self-start sm:self-center"
								>
									<span>⚡ Quick Check-in</span>
									<span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px]">+{checkInCount}</span>
								</button>
							</div>

							{/* 4 Financial & Operational KPI Cards */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
								<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
									<div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
										Active Members
									</div>
									<div className="font-heading text-2xl font-black text-white">142</div>
									<div className="text-[10px] text-emerald-400 mt-1">↑ 12 enrolled this month</div>
								</div>

								<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
									<div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
										Month Revenue
									</div>
									<div className="font-heading text-2xl font-black text-amber-300">₹1,48,500</div>
									<div className="text-[10px] text-white/40 mt-1">Target: ₹1,80,000</div>
								</div>

								<div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
									<div className="text-[10px] font-semibold text-rose-300 uppercase tracking-wider mb-1">
										Pending Dues
									</div>
									<div className="font-heading text-2xl font-black text-rose-400">₹18,500</div>
									<div className="text-[10px] text-rose-300/80 mt-1">4 lifters pending fee</div>
								</div>

								<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
									<div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
										Today&apos;s Check-ins
									</div>
									<div className="font-heading text-2xl font-black text-white">{checkInCount}</div>
									<div className="text-[10px] text-emerald-400 mt-1">Peak evening batch active</div>
								</div>
							</div>

							{/* 2-Column: Quick Add Member & Equipment Maintenance */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
								
								{/* Quick Admission Form */}
								<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
									<div className="flex items-center justify-between mb-3">
										<h3 className="font-heading text-base font-bold text-white tracking-wide">
											New Member Admission
										</h3>
										<span className="text-[10px] text-amber-400 font-bold uppercase">Instant Setup</span>
									</div>
									<form
										onSubmit={(e) => {
											e.preventDefault()
											if (!newMemberName.trim()) {
												showToast('Please enter member name!')
												return
											}
											showToast(`Added ${newMemberName} (${newMemberPlan}) successfully!`)
											setNewMemberName('')
											setNewMemberPhone('')
										}}
										className="space-y-3"
									>
										<div>
											<label className="text-[10px] uppercase font-semibold text-white/60 block mb-1">
												Member Full Name
											</label>
											<input
												type="text"
												value={newMemberName}
												onChange={(e) => setNewMemberName(e.target.value)}
												placeholder="e.g. Rajesh Kumar"
												className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
											/>
										</div>

										<div>
											<label className="text-[10px] uppercase font-semibold text-white/60 block mb-1">
												Phone Number (WhatsApp)
											</label>
											<input
												type="tel"
												value={newMemberPhone}
												onChange={(e) => setNewMemberPhone(e.target.value)}
												placeholder="+91 98765 43210"
												className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
											/>
										</div>

										<div>
											<label className="text-[10px] uppercase font-semibold text-white/60 block mb-1">
												Select Membership Plan
											</label>
											<select
												value={newMemberPlan}
												onChange={(e) => setNewMemberPlan(e.target.value)}
												className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
											>
												<option value="1 Month Kickstart (₹1,500)">1 Month Kickstart (₹1,500)</option>
												<option value="3 Months Hypertrophy (₹4,000)">3 Months Hypertrophy (₹4,000)</option>
												<option value="6 Months Classic Iron (₹7,000)">6 Months Classic Iron (₹7,000)</option>
												<option value="1 Year Elite Athlete (₹12,000)">1 Year Elite Athlete (₹12,000)</option>
												<option value="Personal Training 1-on-1 (₹6,000/mo)">Personal Training (₹6,000/mo)</option>
											</select>
										</div>

										<button
											type="submit"
											className="w-full rounded-xl border border-amber-400 bg-amber-400/20 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-400/30 transition-all flex items-center justify-center gap-1.5"
										>
											<span>+ Register Lifter & Send Receipt</span>
										</button>
									</form>
								</div>

								{/* Equipment Maintenance & Audit Log */}
								<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col justify-between">
									<div>
										<div className="flex items-center justify-between mb-3">
											<h3 className="font-heading text-base font-bold text-white tracking-wide">
												Floor Maintenance Status
											</h3>
											<span className="text-[10px] text-emerald-400 font-bold uppercase">All Clean</span>
										</div>
										<div className="space-y-2.5 text-xs">
											<div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
												<div>
													<div className="font-semibold text-white">Cable Jungle Pulley Wires</div>
													<div className="text-[10px] text-white/50">Next inspection in 18 days</div>
												</div>
												<span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
													Good
												</span>
											</div>

											<div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
												<div>
													<div className="font-semibold text-white">Adjustable Benches & Pins</div>
													<div className="text-[10px] text-white/50">Tightened yesterday</div>
												</div>
												<span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
													Certified
												</span>
											</div>

											<div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
												<div>
													<div className="font-semibold text-white">HVAC & Floor Air Circulation</div>
													<div className="text-[10px] text-white/50">Filters cleaned on 1st</div>
												</div>
												<span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
													Active
												</span>
											</div>
										</div>
									</div>

									<button
										onClick={() => {
											setMaintenanceLogged(true)
											showToast('Routine maintenance checklist marked as complete!')
										}}
										disabled={maintenanceLogged}
										className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all"
									>
										{maintenanceLogged ? '✓ Maintenance Verified Today' : 'Mark Daily Floor Inspection Done'}
									</button>
								</div>
							</div>

							{/* Callout to Full Subscriptions Modal */}
							<div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
								<div className="flex items-center gap-2.5">
									<span className="text-xl">📲</span>
									<div>
										<div className="font-bold text-white">Need to send WhatsApp Fee Expiry Alerts?</div>
										<div className="text-white/60">
											Use the Members Portal to send automatic 3-day WhatsApp payment reminders.
										</div>
									</div>
								</div>
								<button
									onClick={() => {
										closeModal()
										// Open Member Tracker button in header
										const btn = document.querySelector('header button[title*="Members"], header button:has(span)') as HTMLButtonElement
										btn?.click()
									}}
									className="rounded-xl border border-amber-400 bg-amber-400 px-4 py-2 text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition-all shrink-0"
								>
									Open Members Portal →
								</button>
							</div>

						</div>
					)}

				</div>

			</div>
		</div>
	)
}
