'use client'
'use no memo'
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useMemo } from 'react'

export interface BiomechanicsExercise {
	id: string
	name: string
	category: string
	primaryMuscle: string
	recruitment: number // e.g. 92%
	secondaryMuscles: string[]
	equipment: string
	tempo: string
	motionType: 'lat_pulldown' | 'incline_press' | 'barbell_squat' | 'shoulder_press' | 'bicep_curl' | 'tricep_pushdown'
	imageSrc: string
	machineSetup: {
		seat: string
		pin: string
		grip: string
	}
	hotspots: Array<{
		id: string
		x: number
		y: number
		label: string
		tip: string
	}>
	commonMistakes: string[]
	proCues: string[]
}

export const BIOMECHANICS_EXERCISES: BiomechanicsExercise[] = [
	{
		id: 'lat-pulldown',
		name: 'Heavy Cable Lat Pulldown',
		category: 'Back / Lats Hypertrophy',
		primaryMuscle: 'Latissimus Dorsi (Lats)',
		recruitment: 92,
		secondaryMuscles: ['Teres Major', 'Rhomboids', 'Biceps Brachii', 'Rear Delts'],
		equipment: 'Dual-Pulley Lat Tower + Wide Lat Bar',
		tempo: '3-1-1-0 (3s Stretch, 1s Squeeze)',
		motionType: 'lat_pulldown',
		imageSrc: '/exercises/lat-pulldown.jpg',
		machineSetup: {
			seat: 'Adjust thigh roller pads snug against thighs with feet flat on platform.',
			pin: 'Select weight allowing strict clavicle pull without swinging lower back.',
			grip: 'Pronated grip approximately 2 to 3 inches wider than shoulder width.'
		},
		hotspots: [
			{
				id: 'hs-1',
				x: 50,
				y: 16,
				label: 'Cable & Pulley Path',
				tip: 'Grip slightly outside shoulders with thumbs wrapped. Pull through elbows, not forearms.'
			},
			{
				id: 'hs-2',
				x: 48,
				y: 50,
				label: 'Target: Latissimus Dorsi',
				tip: 'Volumetric gold glow highlights peak lat contraction. Drive elbows down towards your back pockets.'
			},
			{
				id: 'hs-3',
				x: 52,
				y: 74,
				label: 'Thigh Roller Pad Anchor',
				tip: 'Lock knees and thighs firmly underneath the pad to eliminate upward momentum and torso sway.'
			}
		],
		commonMistakes: [
			'Swinging torso backwards 45° to use momentum',
			'Pulling bar behind the neck (strains cervical spine & rotator cuff)',
			'Letting weight stack slam up without controlling the 3-second negative'
		],
		proCues: [
			'Initiate movement by depressing scapula before bending elbows',
			'Drive elbows downward and backward into your back pockets',
			'Hold peak contraction for a full 1-second squeeze at collarbone'
		]
	},
	{
		id: 'incline-press',
		name: '30° Incline Dumbbell Press',
		category: 'Chest / Upper Pecs',
		primaryMuscle: 'Clavicular Head (Upper Pecs)',
		recruitment: 89,
		secondaryMuscles: ['Anterior Deltoids', 'Triceps Brachii', 'Serratus Anterior'],
		equipment: 'Adjustable Incline Bench (30°) + Heavy Dumbbells',
		tempo: '3-0-1-0 (3s Lower, Explosive Press)',
		motionType: 'incline_press',
		imageSrc: '/exercises/incline-press.jpg',
		machineSetup: {
			seat: 'Angle bench backrest strictly to 30° (higher shifts load to shoulders).',
			pin: 'Angle seat pad slightly upward to prevent sliding forward during heavy drive.',
			grip: 'Semi-pronated 45° arrow grip to protect rotator cuffs.'
		},
		hotspots: [
			{
				id: 'hs-1',
				x: 49,
				y: 22,
				label: 'Dumbbell Track & Apex',
				tip: 'Press in a gentle natural pyramid arc above the upper chest without clacking dumbbells together.'
			},
			{
				id: 'hs-2',
				x: 49,
				y: 43,
				label: 'Target: Clavicular Upper Pecs',
				tip: 'Glowing gold fibers indicate maximum recruitment of the upper pectoral motor units.'
			},
			{
				id: 'hs-3',
				x: 35,
				y: 56,
				label: '30° Bench Support',
				tip: 'Pin shoulder blades deep into the pad and maintain an arch in the thoracic spine.'
			}
		],
		commonMistakes: [
			'Setting bench angle at 45°–60° (turns into a front shoulder press)',
			'Bouncing dumbbells off upper chest at the bottom of the rep',
			'Flaring elbows 90° outward which causes shoulder impingement'
		],
		proCues: [
			'Lower dumbbells until you feel a deep stretch in the upper clavicular pecs',
			'Press upward and slightly inward along the natural muscle fibers',
			'Do not forcefully lock elbows at the top; keep constant tension on pecs'
		]
	},
	{
		id: 'barbell-squat',
		name: 'Olympic Barbell Back Squat',
		category: 'Lower Body / Quads & Glutes',
		primaryMuscle: 'Quadriceps Femoris & Gluteus Maximus',
		recruitment: 95,
		secondaryMuscles: ['Hamstrings', 'Adductors', 'Spinal Erectors', 'Core'],
		equipment: 'Power Cage + Olympic Barbell + Calibrated Plates',
		tempo: '3-1-1-0 (3s Controlled Descent, 1s Parallel Hole Drive)',
		motionType: 'barbell_squat',
		imageSrc: '/exercises/barbell-squat.jpg',
		machineSetup: {
			seat: 'Set J-Hooks at mid-chest height so bar unracks without tip-toeing.',
			pin: 'Set safety spotter arms 2 inches below your lowest parallel depth.',
			grip: 'Slightly outside shoulders, pulling bar firmly down into upper traps/rear delts.'
		},
		hotspots: [
			{
				id: 'hs-1',
				x: 52,
				y: 28,
				label: 'Bar Shelf Placement',
				tip: 'Bar rests securely across the upper traps shelf. Keep elbows pulled down to brace the upper back.'
			},
			{
				id: 'hs-2',
				x: 58,
				y: 62,
				label: 'Target: Gluteus Maximus & Hamstrings',
				tip: 'Glutes and hamstrings fully engaged at parallel depth to generate massive upward drive.'
			},
			{
				id: 'hs-3',
				x: 44,
				y: 68,
				label: 'Target: Quadriceps Femoris Sweep',
				tip: 'Vastus lateralis and rectus femoris recruit maximum motor units during the concentric drive.'
			}
		],
		commonMistakes: [
			'Quarter-squatting above parallel (fails to recruit full quad sweep & glutes)',
			'Knees collapsing inward during ascent (weak glute medius)',
			'Heels lifting off floor due to tight ankles or poor weight distribution'
		],
		proCues: [
			'Take a deep 360° diaphragmatic breath into the core and brace hard before descent',
			'Break at hips and knees simultaneously, spreading the floor with feet',
			'Drive forcefully upward through mid-foot, maintaining proud chest angle'
		]
	},
	{
		id: 'shoulder-press',
		name: 'Seated Dumbbell Overhead Press',
		category: 'Shoulders / 3D Deltoids',
		primaryMuscle: 'Anterior & Lateral Deltoids',
		recruitment: 88,
		secondaryMuscles: ['Triceps Brachii', 'Upper Trapezius', 'Serratus Anterior'],
		equipment: 'Vertical/75° Utility Bench + Heavy Dumbbells',
		tempo: '2-1-1-0 (2s Controlled Drop, Explosive Lockout)',
		motionType: 'shoulder_press',
		imageSrc: '/exercises/shoulder-press.jpg',
		machineSetup: {
			seat: 'Set bench to 75°–80° upright (not purely 90° vertical to avoid impingement).',
			pin: 'Seat base tilted up slightly to prevent tailbone slippage.',
			grip: 'Slightly angled thumbs inward (scapular plane, 30° forward).'
		},
		hotspots: [
			{
				id: 'hs-1',
				x: 50,
				y: 18,
				label: 'Overhead Apex',
				tip: 'Press overhead until dumbbells meet directly over crown of head without clacking.'
			},
			{
				id: 'hs-2',
				x: 41,
				y: 38,
				label: 'Target: 3D Deltoids Caps',
				tip: 'Glowing gold deltoids showcase peak motor unit recruitment across anterior and lateral heads.'
			},
			{
				id: 'hs-3',
				x: 42,
				y: 56,
				label: '75° Bench Support',
				tip: 'Lumbar support firmly anchored into the backrest. Keep abdominal wall braced.'
			}
		],
		commonMistakes: [
			'Arching lower back excessively to turn the lift into an incline bench press',
			'Clacking dumbbells together aggressively at top, dropping muscle tension',
			'Dropping dumbbells too low below ear level with flared elbows'
		],
		proCues: [
			'Lower dumbbells smoothly to ear level, feeling 3D deltoids loaded with tension',
			'Press powerfully along a gentle arc meeting above the crown',
			'Keep ribs clamped down and glutes anchored into the seat'
		]
	},
	{
		id: 'bicep-curl',
		name: 'Preacher Bench Bicep Curl',
		category: 'Arms / Biceps Hypertrophy',
		primaryMuscle: 'Biceps Brachii (Short & Long Heads)',
		recruitment: 94,
		secondaryMuscles: ['Brachialis', 'Brachioradialis'],
		equipment: 'Preacher Bench + EZ-Curl Bar / Dumbbells',
		tempo: '3-0-1-1 (3s Negative, 1s Peak Contraction)',
		motionType: 'bicep_curl',
		imageSrc: '/exercises/bicep-curl.jpg',
		machineSetup: {
			seat: 'Adjust seat so armpits sit comfortably on top edge of slanted pad.',
			pin: 'Lock seat pin securely so torso does not rock back and forth.',
			grip: 'Underhand supinated grip on inner EZ bar bends for peak bicep activation.'
		},
		hotspots: [
			{
				id: 'hs-1',
				x: 50,
				y: 32,
				label: 'EZ-Bar Supinated Grip',
				tip: 'Slight supinated angle relieves wrist strain and drives direct tension to the bicep peak.'
			},
			{
				id: 'hs-2',
				x: 42,
				y: 50,
				label: 'Target: Biceps Brachii Peak',
				tip: 'Golden glowing bicep muscle belly contracted at top of repetition for maximum hypertrophy.'
			},
			{
				id: 'hs-3',
				x: 52,
				y: 65,
				label: 'Preacher Armpit Pad Anchor',
				tip: 'Triceps glued flat against pad to completely eliminate momentum and shoulder cheating.'
			}
		],
		commonMistakes: [
			'Lifting elbows off the pad to use shoulder momentum',
			'Dropping weight rapidly and hyperextending elbows at bottom (risk of bicep tear)',
			'Leaning torso backward away from the bench during the concentric curl'
		],
		proCues: [
			'Keep chest flat against the upper rim of the preacher pad',
			'Supinate wrists slightly outward at peak contraction to maximize the bicep peak',
			'Resist the negative weight deliberately for a deep muscular burn'
		]
	},
	{
		id: 'tricep-pushdown',
		name: 'Cable Tricep Rope Pushdown',
		category: 'Arms / Triceps Horseshoe',
		primaryMuscle: 'Triceps Brachii (Lateral & Long Heads)',
		recruitment: 91,
		secondaryMuscles: ['Anconeus', 'Forearm Extensors'],
		equipment: 'High Cable Pulley Tower + Dual-Knot Rope Attachment',
		tempo: '3-0-1-1 (3s Negative, 1s Flared Lockout)',
		motionType: 'tricep_pushdown',
		imageSrc: '/exercises/tricep-pushdown.jpg',
		machineSetup: {
			seat: 'Standing position: set pulley height to maximum top slot.',
			pin: 'Pin weight stack for strict form without hunching over the cable.',
			grip: 'Grip rope with neutral palms, thumbs resting near top plastic knots.'
		},
		hotspots: [
			{
				id: 'hs-1',
				x: 41,
				y: 34,
				label: 'High Cable Angle',
				tip: 'Stand 1 foot back from cable stack, slight 15° forward torso hinge for consistent line of force.'
			},
			{
				id: 'hs-2',
				x: 55,
				y: 36,
				label: 'Target: Triceps Horseshoe',
				tip: 'Glowing golden fibers show extreme recruitment of lateral and medial heads at full lockout.'
			},
			{
				id: 'hs-3',
				x: 45,
				y: 55,
				label: 'Rope Flare Spread',
				tip: 'Spread rope ends apart outward past hips at the bottom to peak contract the lateral tricep head.'
			}
		],
		commonMistakes: [
			'Allowing elbows to swing forward and backward like a pendulum',
			'Using body weight to press down instead of pure tricep extension',
			'Failing to spread rope ends apart at bottom of repetition'
		],
		proCues: [
			'Lock elbows directly beside ribcage and keep them motionless throughout set',
			'Drive downward and flare the rope ends outward past thighs at full extension',
			'Squeeze triceps for a full 1-second peak squeeze before controlled negative'
		]
	}
]

export default function ExerciseBiomechanicsEngine({
	initialExerciseId = 'lat-pulldown',
	onBack
}: {
	initialExerciseId?: string
	onBack?: () => void
}) {
	const [activeId, setActiveId] = useState(initialExerciseId)
	const [isPlaying, setIsPlaying] = useState(true)
	const [progress, setProgress] = useState(0.5) // 0 to 1
	const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
	const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null)
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [viewMode, setViewMode] = useState<'athlete' | 'anatomy'>('athlete')

	const exercise = useMemo(
		() => BIOMECHANICS_EXERCISES.find((e) => e.id === activeId) ?? BIOMECHANICS_EXERCISES[0],
		[activeId]
	)

	// Animation Loop for Live Rep Motion
	useEffect(() => {
		if (!isPlaying) return

		let animId: number
		const startTime = performance.now()
		const cycleDuration = 3800 // 3.8s total rep cycle

		const loop = (currentTime: number) => {
			const elapsed = (currentTime - startTime) % cycleDuration
			const norm = elapsed / cycleDuration // 0 to 1

			// Sinusoidal ease in/out rep motion
			const currentVal = (1 - Math.cos(norm * 2 * Math.PI)) / 2
			setProgress(currentVal)
			animId = requestAnimationFrame(loop)
		}

		animId = requestAnimationFrame(loop)
		return () => cancelAnimationFrame(animId)
	}, [isPlaying])

	// Rest Timer Countdown
	useEffect(() => {
		if (!isTimerRunning || restTimerSeconds === null || restTimerSeconds <= 0) return

		const interval = setInterval(() => {
			setRestTimerSeconds((prev) => {
				if (prev === null || prev <= 1) {
					setIsTimerRunning(false)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [isTimerRunning, restTimerSeconds])

	// Breathing & Movement Phase Calculation
	const phaseInfo = useMemo(() => {
		if (progress < 0.28) {
			return {
				phase: 'Full Eccentric Stretch',
				breath: '🫁 Deep Inhale (3s)',
				color: 'text-amber-300'
			}
		} else if (progress < 0.72) {
			return {
				phase: 'Concentric Force Drive',
				breath: '💨 Powerful Exhale',
				color: 'text-yellow-400'
			}
		} else {
			return {
				phase: 'Peak Muscular Contraction',
				breath: '🔒 Peak Squeeze Hold (1s)',
				color: 'text-amber-200'
			}
		}
	}, [progress])

	// Dynamic angle calculations
	const currentJointAngle = useMemo(() => {
		if (exercise.motionType === 'lat_pulldown') {
			return Math.round(165 - progress * 100)
		} else if (exercise.motionType === 'incline_press') {
			return Math.round(75 + progress * 85)
		} else if (exercise.motionType === 'barbell_squat') {
			return Math.round(170 - progress * 85)
		} else if (exercise.motionType === 'shoulder_press') {
			return Math.round(80 + progress * 85)
		} else if (exercise.motionType === 'bicep_curl') {
			return Math.round(150 - progress * 95)
		} else {
			return Math.round(90 + progress * 85)
		}
	}, [exercise.motionType, progress])

	return (
		<div className="flex flex-col text-white w-full space-y-6">

			{/* Top Header & Exercise Selector Chips */}
			<div className="flex flex-col gap-3 border-b border-white/10 pb-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						{onBack && (
							<button
								onClick={onBack}
								className="rounded-xl border border-white/15 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
								title="Back to exercise vault"
							>
								<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
						)}
						<div>
							<div className="flex items-center gap-2">
								<span className="rounded bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
									Biomechanics 3D Studio
								</span>
								<span className="text-[11px] text-white/50">{exercise.category}</span>
							</div>
							<h1 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wide text-white mt-1">
								{exercise.name}
							</h1>
						</div>
					</div>

					{/* Right Action Bar: View Mode Switcher + Rest Timer */}
					<div className="flex flex-wrap items-center gap-2.5">
						
						{/* View Mode Toggle: Realistic Athlete vs Full Anatomy Map */}
						<div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
							<button
								onClick={() => setViewMode('athlete')}
								className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
									viewMode === 'athlete'
										? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
										: 'text-white/60 hover:text-white'
								}`}
							>
								📸 Athlete & Machine
							</button>
							<button
								onClick={() => setViewMode('anatomy')}
								className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
									viewMode === 'anatomy'
										? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
										: 'text-white/60 hover:text-white'
								}`}
							>
								🧬 Full Anatomy Map
							</button>
						</div>

						{/* Rest Timer Widget */}
						<div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md">
							<span className="text-[10px] font-bold uppercase tracking-wider text-white/50 px-1.5">
								⏱️ Rest:
							</span>
							{[60, 90, 120].map((sec) => (
								<button
									key={sec}
									onClick={() => {
										setRestTimerSeconds(sec)
										setIsTimerRunning(true)
									}}
									className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
										restTimerSeconds === sec && isTimerRunning
											? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
											: 'bg-white/5 text-white/80 hover:bg-white/10'
									}`}
								>
									{sec}s
								</button>
							))}
							{restTimerSeconds !== null && restTimerSeconds > 0 && (
								<div className="flex items-center gap-1.5 pl-2 pr-1.5 border-l border-white/10">
									<span className="font-mono text-sm font-bold text-amber-400">
										{Math.floor(restTimerSeconds / 60)}:
										{String(restTimerSeconds % 60).padStart(2, '0')}
									</span>
									<button
										onClick={() => setIsTimerRunning(!isTimerRunning)}
										className="text-xs text-white/60 hover:text-white"
									>
										{isTimerRunning ? '⏸' : '▶'}
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Quick Exercise Tabs */}
				<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
					{BIOMECHANICS_EXERCISES.map((ex) => {
						const shortLabel =
							ex.id === 'lat-pulldown'
								? 'Lat Pulldown'
								: ex.id === 'incline-press'
								? 'Incline Press'
								: ex.id === 'barbell-squat'
								? 'Barbell Squat'
								: ex.id === 'shoulder-press'
								? 'Overhead Press'
								: ex.id === 'bicep-curl'
								? 'Bicep Curl'
								: 'Tricep Pushdown'

						return (
							<button
								key={ex.id}
								data-exercise-tab={ex.id}
								onClick={() => {
									setActiveId(ex.id)
									setActiveHotspot(null)
								}}
								className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wider whitespace-nowrap transition-all ${
									activeId === ex.id
										? 'border border-amber-400 bg-amber-400/20 text-amber-300 font-bold shadow-md'
										: 'border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
								}`}
							>
								{shortLabel}
							</button>
						)
					})}
				</div>
			</div>

			{/* Main 2-Column Responsive Workspace */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

				{/* LEFT COLUMN: INTERACTIVE BIOMECHANICS VISUALIZER (7 Cols) */}
				<div className="lg:col-span-7 flex flex-col space-y-4">
					
					{/* Interactive Visualizer Canvas Screen */}
					<div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-3xl border border-white/15 bg-black p-4 shadow-2xl overflow-hidden flex flex-col justify-between group">
						
						{/* Ambient Grid Background */}
						<div
							className="absolute inset-0 opacity-15 pointer-events-none"
							style={{
								backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 224, 130, 0.15) 0%, transparent 60%), linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
								backgroundSize: '100% 100%, 24px 24px, 24px 24px'
							}}
						/>

						{/* Top Telemetry Overlay */}
						<div className="relative z-20 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
								<span className="text-[11px] font-mono tracking-wider text-white/80 uppercase bg-black/60 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-md">
									Angle: <span className="text-amber-300 font-bold">{currentJointAngle}°</span>
								</span>
							</div>

							<div className="flex items-center gap-2">
								<span className="rounded-full bg-black/60 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-md">
									{phaseInfo.breath}
								</span>
								<span className="rounded-full bg-black/60 border border-white/10 px-2 py-0.5 text-[10px] text-white/90 font-mono backdrop-blur-md">
									{Math.round(progress * 100)}% Rep
								</span>
							</div>
						</div>

						{/* CINEMATIC HIGH-DEFINITION VISUAL CONTAINER */}
						<div className="relative z-10 flex-1 flex items-center justify-center my-2 overflow-hidden rounded-2xl">
							{viewMode === 'athlete' ? (
								<div className="relative w-full h-full flex items-center justify-center">
									{/* Realistic Photographic Render with Dynamic Glow */}
									<img
										src={exercise.imageSrc}
										alt={exercise.name}
										className="w-full h-full object-contain rounded-2xl select-none transition-transform duration-700 group-hover:scale-[1.02]"
									/>

									{/* Golden Muscular Fiber Contraction Aura Overlay */}
									<div
										className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
										style={{
											boxShadow: `inset 0 0 ${40 + progress * 60}px rgba(255, 224, 130, ${0.15 + progress * 0.35})`,
											opacity: 0.8 + progress * 0.4
										}}
									/>

									{/* Target Muscle Highlighting Banner */}
									<div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-neutral-950/85 border border-amber-400/40 px-3 py-1 rounded-full backdrop-blur-md text-center max-w-[90%] shadow-lg">
										<span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
											Target: {exercise.primaryMuscle} • {Math.round(70 + progress * 30)}% Tension
										</span>
									</div>

									{/* Interactive Machine Hotspot Pins */}
									{exercise.hotspots.map((hs) => {
										const isSelected = activeHotspot === hs.id
										return (
											<button
												key={hs.id}
												onClick={() => setActiveHotspot(isSelected ? null : hs.id)}
												style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
												className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 flex size-7 items-center justify-center rounded-full transition-all hover:scale-125 focus:outline-none ${
													isSelected
														? 'bg-amber-400 text-black shadow-[0_0_20px_#ffe082]'
														: 'bg-black/80 text-amber-300 border-2 border-amber-400/80 shadow-lg'
												}`}
												title={hs.label}
											>
												<span className="text-[11px] font-black">⚙</span>
												{/* Pulsing beacon ring */}
												{!isSelected && (
													<span className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-75" />
												)}
											</button>
										)
									})}

									{/* Hotspot Info Popup Card */}
									{activeHotspot && (() => {
										const selectedHs = exercise.hotspots.find((h) => h.id === activeHotspot)
										if (!selectedHs) return null
										return (
											<div
												style={{
													left: `${Math.min(Math.max(selectedHs.x, 20), 80)}%`,
													top: `${selectedHs.y > 50 ? selectedHs.y - 18 : selectedHs.y + 18}%`
												}}
												className="absolute -translate-x-1/2 z-40 w-72 rounded-2xl border border-amber-400/60 bg-neutral-950/95 p-3.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 text-left"
											>
												<div className="flex items-center justify-between mb-1.5">
													<span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
														⚙️ {selectedHs.label}
													</span>
													<button
														onClick={() => setActiveHotspot(null)}
														className="text-white/50 hover:text-white text-xs p-1"
													>
														✕
													</button>
												</div>
												<p className="text-xs text-white/90 leading-relaxed">{selectedHs.tip}</p>
											</div>
										)
									})()}
								</div>
							) : (
								/* Full Muscular Body Anatomy Map */
								<div className="relative w-full h-full flex flex-col items-center justify-center">
									<img
										src="/exercises/anatomy-map.jpg"
										alt="Human Body Muscular Anatomy"
										className="w-full h-full object-contain rounded-2xl select-none"
									/>
									<div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-neutral-950/85 border border-amber-400/40 px-3 py-1 rounded-full backdrop-blur-md text-center max-w-[90%] shadow-lg">
										<span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
											🧬 Muscular Hypertrophy Map (Front & Back Chain)
										</span>
									</div>
								</div>
							)}
						</div>

						{/* Bottom Controller Bar: Play/Pause & Rep Scrubber Slider */}
						<div className="relative z-20 rounded-2xl border border-white/10 bg-neutral-950/90 p-3 backdrop-blur-md space-y-2">
							<div className="flex items-center justify-between text-xs">
								<div className="flex items-center gap-2">
									<button
										onClick={() => setIsPlaying(!isPlaying)}
										className={`rounded-xl px-3 py-1 font-bold text-xs flex items-center gap-1.5 transition-all ${
											isPlaying
												? 'bg-amber-400 text-black shadow-md'
												: 'bg-white/10 text-white hover:bg-white/20'
										}`}
									>
										<span>{isPlaying ? '⏸ Pause' : '▶ Auto Play'}</span>
									</button>
									<span className={`text-[11px] font-semibold ${phaseInfo.color}`}>
										{phaseInfo.phase}
									</span>
								</div>
								<span className="text-[11px] text-white/60 font-mono">
									Tempo: {exercise.tempo}
								</span>
							</div>

							{/* Rep Scrubber Slider */}
							<div className="flex items-center gap-3">
								<span className="text-[10px] font-semibold text-white/40 uppercase">Stretch 0%</span>
								<input
									type="range"
									min="0"
									max="1"
									step="0.005"
									value={progress}
									onChange={(e) => {
										setIsPlaying(false)
										setProgress(parseFloat(e.target.value))
									}}
									className="flex-1 h-2 rounded-lg bg-white/15 accent-amber-400 cursor-pointer focus:outline-none"
								/>
								<span className="text-[10px] font-semibold text-amber-400 uppercase">100% Squeeze</span>
							</div>
						</div>

					</div>

					{/* Hotspot Legend Hint */}
					<div className="flex items-center justify-between px-2 text-xs text-white/50">
						<span className="flex items-center gap-1.5">
							<span className="size-2 rounded-full bg-amber-400" />
							<span>Tap ⚙ pins on the machine to reveal pin & seat setups</span>
						</span>
						<span>Drag slider to inspect frame-by-frame</span>
					</div>

				</div>

				{/* RIGHT COLUMN: INTELLIGENCE & FORM SPECIFICATIONS (5 Cols) */}
				<div className="lg:col-span-5 flex flex-col space-y-4">

					{/* Muscle Recruitment & Primary Focus Card */}
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
						<div className="flex items-center justify-between mb-3">
							<div>
								<span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
									Primary Hypertrophy Driver
								</span>
								<h3 className="font-heading text-lg font-bold text-white">{exercise.primaryMuscle}</h3>
							</div>
							<div className="text-right">
								<span className="font-heading text-2xl font-black text-amber-300">
									{exercise.recruitment}%
								</span>
								<span className="block text-[9px] text-white/40 uppercase">EMG Activation</span>
							</div>
						</div>

						{/* Progress Bar for Muscle Recruitment */}
						<div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-3">
							<div
								className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
								style={{ width: `${exercise.recruitment}%` }}
							/>
						</div>

						{/* Secondary Stabilizers Chips */}
						<div>
							<span className="text-[10px] text-white/50 uppercase font-semibold block mb-1.5">
								Synergist & Stabilizer Muscles:
							</span>
							<div className="flex flex-wrap gap-1.5">
								{exercise.secondaryMuscles.map((sec, i) => (
									<span
										key={i}
										className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/80"
									>
										{sec}
									</span>
								))}
							</div>
						</div>
					</div>

					{/* Machine Setup 3-Point Checklist */}
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
						<h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
							<span>⚙️ Machine Configuration Blueprint</span>
						</h3>
						<div className="space-y-2.5 text-xs">
							<div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-black/40 border border-white/5">
								<span className="text-base">🪑</span>
								<div>
									<div className="font-bold text-white">Seat & Pad Height</div>
									<div className="text-white/70 leading-relaxed">{exercise.machineSetup.seat}</div>
								</div>
							</div>
							<div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-black/40 border border-white/5">
								<span className="text-base">📍</span>
								<div>
									<div className="font-bold text-white">Weight Stack & Pin</div>
									<div className="text-white/70 leading-relaxed">{exercise.machineSetup.pin}</div>
								</div>
							</div>
							<div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-black/40 border border-white/5">
								<span className="text-base">✋</span>
								<div>
									<div className="font-bold text-white">Grip Width & Wrist Alignment</div>
									<div className="text-white/70 leading-relaxed">{exercise.machineSetup.grip}</div>
								</div>
							</div>
						</div>
					</div>

					{/* Pro Cues vs Mistakes Checklist */}
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md space-y-4">
						{/* Pro Cues */}
						<div>
							<h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
								<span>✓ Golden Era Biomechanical Cues</span>
							</h4>
							<ul className="space-y-1.5 text-xs text-white/80">
								{exercise.proCues.map((cue, i) => (
									<li key={i} className="flex items-start gap-2">
										<span className="text-emerald-400 font-bold shrink-0">✓</span>
										<span>{cue}</span>
									</li>
								))}
							</ul>
						</div>

						{/* Common Mistakes */}
						<div className="border-t border-white/10 pt-3">
							<h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
								<span>✕ Costly Form Mistakes</span>
							</h4>
							<ul className="space-y-1.5 text-xs text-white/70">
								{exercise.commonMistakes.map((mis, i) => (
									<li key={i} className="flex items-start gap-2">
										<span className="text-rose-400 font-bold shrink-0">✕</span>
										<span>{mis}</span>
									</li>
								))}
							</ul>
						</div>
					</div>

				</div>

			</div>
		</div>
	)
}
