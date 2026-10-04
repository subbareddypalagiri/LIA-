'use client'
'use no memo'

import { useState, useMemo, useEffect } from 'react'

export interface MacroResult {
	bmr: number
	tdee: number
	targetCalories: number
	proteinGrams: number
	carbGrams: number
	fatGrams: number
	waterLiters: number
	proteinPercent: number
	carbPercent: number
	fatPercent: number
}

interface AthleteNutritionModalProps {
	onClose: () => void
	showToast?: (msg: string) => void
}

export default function AthleteNutritionModal({ onClose, showToast }: AthleteNutritionModalProps) {
	// Inputs
	const [gender, setGender] = useState<'male' | 'female'>('male')
	const [age, setAge] = useState<number>(25)
	const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
	const [weightKg, setWeightKg] = useState<number>(75)
	const [weightLbs, setWeightLbs] = useState<number>(165)
	const [heightCm, setHeightCm] = useState<number>(178)
	const [heightFeet, setHeightFeet] = useState<number>(5)
	const [heightInches, setHeightInches] = useState<number>(10)
	const [activityLevel, setActivityLevel] = useState<number>(1.55) // Moderate 3-5 days
	const [goal, setGoal] = useState<'aggressive_cut' | 'lean_recomp' | 'maintenance' | 'lean_bulk' | 'heavy_mass'>('lean_bulk')
	const [mealCount, setMealCount] = useState<number>(4)
	const [dietPreference, setDietPreference] = useState<'all' | 'veg' | 'non_veg'>('all')
	const [copied, setCopied] = useState(false)

	// Load previously saved calculations from localStorage
	useEffect(() => {
		try {
			const saved = localStorage.getItem('lia_athlete_macros')
			if (saved) {
				const parsed = JSON.parse(saved) as Record<string, any>
				if (parsed.weightKg) setWeightKg(Number(parsed.weightKg))
				if (parsed.heightCm) setHeightCm(Number(parsed.heightCm))
				if (parsed.age) setAge(Number(parsed.age))
				if (parsed.gender) setGender(parsed.gender)
				if (parsed.goal) setGoal(parsed.goal)
				if (parsed.activityLevel) setActivityLevel(Number(parsed.activityLevel))
			}
		} catch {}
	}, [])

	// Normalized values
	const currentWeightKg = useMemo(() => {
		return unit === 'metric' ? weightKg : Number((weightLbs * 0.453592).toFixed(1))
	}, [unit, weightKg, weightLbs])

	const currentHeightCm = useMemo(() => {
		return unit === 'metric' ? heightCm : Number(((heightFeet * 12 + heightInches) * 2.54).toFixed(1))
	}, [unit, heightCm, heightFeet, heightInches])

	// Macro & Caloric Computation Engine
	const macros: MacroResult = useMemo(() => {
		// 1. Mifflin-St Jeor BMR Equation
		let bmr = 10 * currentWeightKg + 6.25 * currentHeightCm - 5 * age
		if (gender === 'male') {
			bmr += 5
		} else {
			bmr -= 161
		}

		// 2. TDEE
		const tdee = Math.round(bmr * activityLevel)

		// 3. Goal Caloric Multiplier & Protein Ratio (g/kg)
		let calorieDelta = 0
		let proteinPerKg = 2.0

		switch (goal) {
			case 'aggressive_cut':
				calorieDelta = -0.25 // -25%
				proteinPerKg = 2.4 // Muscle sparing
				break
			case 'lean_recomp':
				calorieDelta = -0.10 // -10%
				proteinPerKg = 2.2
				break
			case 'maintenance':
				calorieDelta = 0.0
				proteinPerKg = 2.0
				break
			case 'lean_bulk':
				calorieDelta = 0.10 // +10% clean hypertrophy surplus
				proteinPerKg = 2.0
				break
			case 'heavy_mass':
				calorieDelta = 0.20 // +20% mass builder
				proteinPerKg = 1.9
				break
		}

		const targetCalories = Math.round(tdee * (1 + calorieDelta))

		// 4. Protein (4 kcal/g)
		const proteinGrams = Math.round(currentWeightKg * proteinPerKg)
		const proteinKcal = proteinGrams * 4

		// 5. Fats (9 kcal/g) -> 25% of target calories
		const fatKcal = targetCalories * 0.25
		const fatGrams = Math.round(fatKcal / 9)

		// 6. Carbs (4 kcal/g) -> Remaining calories
		const remainingKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal))
		const carbGrams = Math.round(remainingKcal / 4)

		// Percentages
		const totalKcal = proteinKcal + fatKcal + remainingKcal
		const proteinPercent = Math.round((proteinKcal / totalKcal) * 100)
		const carbPercent = Math.round((remainingKcal / totalKcal) * 100)
		const fatPercent = 100 - proteinPercent - carbPercent

		// Water target: 40ml per kg + 500ml for heavy lifting
		const waterLiters = Number(((currentWeightKg * 0.04) + 0.5).toFixed(1))

		return {
			bmr: Math.round(bmr),
			tdee,
			targetCalories,
			proteinGrams,
			carbGrams,
			fatGrams,
			waterLiters,
			proteinPercent,
			carbPercent,
			fatPercent
		}
	}, [currentWeightKg, currentHeightCm, age, gender, activityLevel, goal])

	// Save calculation
	const handleSave = () => {
		try {
			localStorage.setItem(
				'lia_athlete_macros',
				JSON.stringify({
					weightKg: currentWeightKg,
					heightCm: currentHeightCm,
					age,
					gender,
					goal,
					activityLevel,
					macros,
					savedAt: new Date().toISOString()
				})
			)
			if (showToast) showToast('Nutrition & Macro protocol saved to your local athlete profile!')
		} catch {}
	}

	// Copy to clipboard formatted
	const handleCopy = async () => {
		const text = `🏆 LIA IRON CLUB — ATHLETE MACRO PROTOCOL
Target Calories: ${macros.targetCalories} kcal / day
Goal: ${goal.replace('_', ' ').toUpperCase()}

Daily Macronutrients:
🍗 Protein: ${macros.proteinGrams}g (${macros.proteinPercent}%)
🍚 Carbs: ${macros.carbGrams}g (${macros.carbPercent}%)
🥑 Healthy Fats: ${macros.fatGrams}g (${macros.fatPercent}%)
💧 Hydration Target: ${macros.waterLiters} Liters / day

Per-Meal Breakdown (${mealCount} Meals/day):
• Protein / Meal: ${Math.round(macros.proteinGrams / mealCount)}g
• Carbs / Meal: ${Math.round(macros.carbGrams / mealCount)}g
• Fats / Meal: ${Math.round(macros.fatGrams / mealCount)}g
• Calories / Meal: ${Math.round(macros.targetCalories / mealCount)} kcal`

		try {
			await navigator.clipboard.writeText(text)
			setCopied(true)
			setTimeout(() => setCopied(false), 2500)
			if (showToast) showToast('Macro protocol copied to clipboard!')
		} catch {}
	}

	// Curated high-protein athlete foods
	const FOOD_RECOMMENDATIONS = [
		{ name: 'Chicken Breast (Cooked)', portion: '100g', protein: '31g', carbs: '0g', fats: '3.6g', type: 'non_veg' },
		{ name: 'Whey Protein Isolate', portion: '1 Scoop (30g)', protein: '25g', carbs: '2g', fats: '1g', type: 'veg' },
		{ name: 'Soya Chunks (Raw)', portion: '50g', protein: '26g', carbs: '16g', fats: '0.5g', type: 'veg' },
		{ name: 'Whole Eggs (Boiled)', portion: '3 Eggs', protein: '18g', carbs: '1.5g', fats: '15g', type: 'non_veg' },
		{ name: 'Low-Fat Paneer / Cottage Cheese', portion: '100g', protein: '20g', carbs: '3g', fats: '8g', type: 'veg' },
		{ name: 'Egg Whites', portion: '5 Whites', protein: '20g', carbs: '1g', fats: '0.2g', type: 'non_veg' },
		{ name: 'Greek Yogurt (Hung Curd)', portion: '150g', protein: '15g', carbs: '6g', fats: '1g', type: 'veg' },
		{ name: 'Moong Dal / Sprouted Lentils', portion: '100g Cooked', protein: '9g', carbs: '19g', fats: '0.4g', type: 'veg' },
		{ name: 'White / Brown Rice (Cooked)', portion: '150g', protein: '4g', carbs: '42g', fats: '0.5g', type: 'veg' },
		{ name: 'Rolled Oats (Dry)', portion: '50g', protein: '6.5g', carbs: '34g', fats: '3.5g', type: 'veg' }
	]

	const filteredFoods = FOOD_RECOMMENDATIONS.filter((f) => {
		if (dietPreference === 'all') return true
		if (dietPreference === 'veg') return f.type === 'veg'
		return true
	})

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

			{/* Modal Dialog */}
			<div className="relative z-10 flex h-[95dvh] sm:h-[92vh] sm:max-h-[860px] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/20 bg-neutral-950 shadow-2xl backdrop-blur-2xl my-0 sm:my-auto text-white">
				{/* Mobile Grab Handle */}
				<div className="flex sm:hidden justify-center pt-2.5 pb-1 bg-neutral-950 shrink-0">
					<div className="h-1 w-10 rounded-full bg-white/25" />
				</div>

				{/* Header */}
				<div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-3.5 bg-neutral-950 shrink-0">
					<div className="flex items-center gap-2.5 sm:gap-3">
						<div className="flex size-9 sm:size-10 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
							<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<path d="M18 6 6 18" />
								<path d="m20 10-4-4" />
								<path d="m4 14 4 4" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h2 className="font-heading text-base sm:text-xl font-black uppercase tracking-wider text-white">
									Macro Hypertrophy Architect
								</h2>
								<span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[9px] font-bold text-amber-300 uppercase">
									Mifflin-St Jeor Engine
								</span>
							</div>
							<p className="text-[11px] sm:text-xs text-white/50">
								Calculate customized calories, protein synthesis threshold, and macro partitioning.
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={handleCopy}
							className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all hidden xs:flex items-center gap-1.5"
						>
							{copied ? (
								<>
									<svg className="size-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
									</svg>
									<span className="text-emerald-400">Copied</span>
								</>
							) : (
								<>
									<svg className="size-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
										<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
									</svg>
									<span>Copy Plan</span>
								</>
							)}
						</button>

						<button
							onClick={onClose}
							className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all shrink-0"
						>
							✕
						</button>
					</div>
				</div>

				{/* Scrollable Body */}
				<div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-black/20">
					{/* Dual Column Layout: Left = Inputs, Right = Results */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
						{/* LEFT COLUMN: Input Parameters */}
						<div className="lg:col-span-5 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
							<div className="flex items-center justify-between border-b border-white/10 pb-3">
								<span className="text-xs font-bold uppercase tracking-wider text-white/80">
									1. Athlete Biometrics
								</span>
								{/* Unit Switcher */}
								<div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5 text-[10px]">
									<button
										onClick={() => setUnit('metric')}
										className={`rounded px-2 py-0.5 font-bold transition-all ${
											unit === 'metric' ? 'bg-amber-400 text-black' : 'text-white/50'
										}`}
									>
										Metric (kg/cm)
									</button>
									<button
										onClick={() => setUnit('imperial')}
										className={`rounded px-2 py-0.5 font-bold transition-all ${
											unit === 'imperial' ? 'bg-amber-400 text-black' : 'text-white/50'
										}`}
									>
										Imperial (lbs/ft)
									</button>
								</div>
							</div>

							{/* Gender & Age */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">Gender</label>
									<div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/40 p-1 text-xs">
										<button
											onClick={() => setGender('male')}
											className={`rounded-lg py-1 text-center font-bold transition-all ${
												gender === 'male' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
											}`}
										>
											Male
										</button>
										<button
											onClick={() => setGender('female')}
											className={`rounded-lg py-1 text-center font-bold transition-all ${
												gender === 'female' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
											}`}
										>
											Female
										</button>
									</div>
								</div>

								<div>
									<label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">Age (Years)</label>
									<input
										type="number"
										min={14}
										max={85}
										value={age}
										onChange={(e) => setAge(Math.max(14, Number(e.target.value)))}
										className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
									/>
								</div>
							</div>

							{/* Weight & Height */}
							<div className="grid grid-cols-2 gap-3">
								{unit === 'metric' ? (
									<>
										<div>
											<label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">Weight (kg)</label>
											<input
												type="number"
												min={35}
												max={220}
												value={weightKg}
												onChange={(e) => setWeightKg(Number(e.target.value))}
												className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
											/>
										</div>
										<div>
											<label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">Height (cm)</label>
											<input
												type="number"
												min={120}
												max={230}
												value={heightCm}
												onChange={(e) => setHeightCm(Number(e.target.value))}
												className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
											/>
										</div>
									</>
								) : (
									<>
										<div>
											<label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">Weight (lbs)</label>
											<input
												type="number"
												min={80}
												max={450}
												value={weightLbs}
												onChange={(e) => setWeightLbs(Number(e.target.value))}
												className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
											/>
										</div>
										<div>
											<label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">Height (ft & in)</label>
											<div className="grid grid-cols-2 gap-1.5">
												<input
													type="number"
													min={4}
													max={7}
													value={heightFeet}
													onChange={(e) => setHeightFeet(Number(e.target.value))}
													className="w-full rounded-xl border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
												/>
												<input
													type="number"
													min={0}
													max={11}
													value={heightInches}
													onChange={(e) => setHeightInches(Number(e.target.value))}
													className="w-full rounded-xl border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
												/>
											</div>
										</div>
									</>
								)}
							</div>

							{/* Activity Level */}
							<div>
								<label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">
									Weekly Training Intensity
								</label>
								<select
									value={activityLevel}
									onChange={(e) => setActivityLevel(Number(e.target.value))}
									className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
								>
									<option value={1.2}>Sedentary (Desk work, no workouts)</option>
									<option value={1.375}>Lightly Active (1–2 gym sessions/week)</option>
									<option value={1.55}>Moderately Active (3–5 heavy lift days/week)</option>
									<option value={1.725}>Very Active (6–7 heavy hypertrophy days/week)</option>
									<option value={1.9}>Elite Athlete (2x training/day or competitive prep)</option>
								</select>
							</div>

							{/* Physique & Hypertrophy Goal */}
							<div>
								<label className="text-[10px] uppercase font-semibold text-amber-300 block mb-1">
									Target Physique Goal
								</label>
								<div className="grid grid-cols-1 gap-1.5">
									{[
										{ id: 'aggressive_cut', label: '🔥 Aggressive Cut', desc: '-25% kcal • Fast fat loss, 2.4g/kg protein' },
										{ id: 'lean_recomp', label: '⚡ Lean Recomposition', desc: '-10% kcal • Muscle building while dropping fat' },
										{ id: 'maintenance', label: '⚖️ Athletic Maintenance', desc: '0% kcal • Peak strength & athletic recovery' },
										{ id: 'lean_bulk', label: '💪 Lean Hypertrophy Bulk', desc: '+10% kcal • Clean muscle growth with minimal fat' },
										{ id: 'heavy_mass', label: '🦍 Heavy Mass Gainer', desc: '+20% kcal • Max powerlifting bulk & hardgainers' }
									].map((item) => (
										<button
											key={item.id}
											type="button"
											onClick={() => setGoal(item.id as any)}
											className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
												goal === item.id
													? 'border-amber-400 bg-amber-400/15 text-white ring-1 ring-amber-400/30'
													: 'border-white/10 bg-black/30 text-white/70 hover:border-white/20 hover:text-white'
											}`}
										>
											<div className="text-xs font-bold">{item.label}</div>
											<div className="text-[10px] text-white/50">{item.desc}</div>
										</button>
									))}
								</div>
							</div>
						</div>

						{/* RIGHT COLUMN: Output Dashboard & Blueprint */}
						<div className="lg:col-span-7 space-y-4">
							{/* Hero Caloric Output Banner */}
							<div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/15 via-neutral-900 to-neutral-950 p-5 shadow-xl">
								<div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
									<div>
										<div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
											Daily Hypertrophy Target
										</div>
										<div className="font-heading text-3xl sm:text-4xl font-black text-white mt-0.5">
											{macros.targetCalories.toLocaleString('en-IN')}{' '}
											<span className="text-sm font-sans font-normal text-white/60">kcal / day</span>
										</div>
									</div>
									<div className="text-right">
										<div className="text-[10px] uppercase font-semibold text-white/50">Maintenance TDEE</div>
										<div className="font-mono text-sm text-white/80 font-bold">{macros.tdee} kcal</div>
										<div className="text-[10px] text-white/40 mt-0.5">BMR: {macros.bmr} kcal</div>
									</div>
								</div>

								{/* 3 Macro Cards (Protein, Carbs, Fats) */}
								<div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-4">
									{/* Protein */}
									<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
										<div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
											Protein (4 kcal/g)
										</div>
										<div className="font-heading text-2xl sm:text-3xl font-black text-emerald-300 mt-1">
											{macros.proteinGrams}g
										</div>
										<div className="text-[10px] text-emerald-400/80 mt-0.5">
											{macros.proteinPercent}% • {macros.proteinGrams * 4} kcal
										</div>
									</div>

									{/* Carbs */}
									<div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-center">
										<div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
											Carbs (4 kcal/g)
										</div>
										<div className="font-heading text-2xl sm:text-3xl font-black text-amber-300 mt-1">
											{macros.carbGrams}g
										</div>
										<div className="text-[10px] text-amber-400/80 mt-0.5">
											{macros.carbPercent}% • {macros.carbGrams * 4} kcal
										</div>
									</div>

									{/* Fats */}
									<div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center">
										<div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
											Fats (9 kcal/g)
										</div>
										<div className="font-heading text-2xl sm:text-3xl font-black text-rose-300 mt-1">
											{macros.fatGrams}g
										</div>
										<div className="text-[10px] text-rose-400/80 mt-0.5">
											{macros.fatPercent}% • {macros.fatGrams * 9} kcal
										</div>
									</div>
								</div>

								{/* Macro Ratio Split Bar */}
								<div className="mt-4">
									<div className="flex justify-between text-[10px] text-white/50 mb-1">
										<span>Macro Caloric Distribution</span>
										<span>Protein: {macros.proteinPercent}% | Carbs: {macros.carbPercent}% | Fat: {macros.fatPercent}%</span>
									</div>
									<div className="h-2 w-full rounded-full overflow-hidden flex bg-white/10">
										<div style={{ width: `${macros.proteinPercent}%` }} className="bg-emerald-400 h-full" />
										<div style={{ width: `${macros.carbPercent}%` }} className="bg-amber-400 h-full" />
										<div style={{ width: `${macros.fatPercent}%` }} className="bg-rose-400 h-full" />
									</div>
								</div>
							</div>

							{/* Meal Distribution Breakdown */}
							<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
								<div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold uppercase tracking-wider text-white">
											Per-Meal Breakdown
										</span>
										<span className="text-[10px] text-white/40">
											(Distributed across {mealCount} meals)
										</span>
									</div>
									{/* Meal Count Selector */}
									<div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1 text-xs">
										{[3, 4, 5].map((count) => (
											<button
												key={count}
												onClick={() => setMealCount(count)}
												className={`rounded-lg px-2.5 py-0.5 font-bold transition-all ${
													mealCount === count ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
												}`}
											>
												{count} Meals
											</button>
										))}
									</div>
								</div>

								{/* Per Meal Grid */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
									<div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
										<div className="text-[10px] text-white/40 uppercase">Calories / Meal</div>
										<div className="font-heading text-lg font-bold text-white mt-0.5">
											{Math.round(macros.targetCalories / mealCount)} kcal
										</div>
									</div>
									<div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
										<div className="text-[10px] text-emerald-400/80 uppercase">Protein / Meal</div>
										<div className="font-heading text-lg font-bold text-emerald-300 mt-0.5">
											{Math.round(macros.proteinGrams / mealCount)}g
										</div>
									</div>
									<div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
										<div className="text-[10px] text-amber-400/80 uppercase">Carbs / Meal</div>
										<div className="font-heading text-lg font-bold text-amber-300 mt-0.5">
											{Math.round(macros.carbGrams / mealCount)}g
										</div>
									</div>
									<div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
										<div className="text-[10px] text-rose-400/80 uppercase">Fats / Meal</div>
										<div className="font-heading text-lg font-bold text-rose-300 mt-0.5">
											{Math.round(macros.fatGrams / mealCount)}g
										</div>
									</div>
								</div>

								{/* Water & Hydration Tip */}
								<div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-2.5 flex items-center justify-between text-xs">
									<div className="flex items-center gap-2 text-sky-200">
										<span className="text-base">💧</span>
										<span>
											Daily Hydration Target: <strong>{macros.waterLiters} Liters</strong>
										</span>
									</div>
									<span className="text-[10px] text-sky-300/80 font-mono">
										(Drink 500ml upon waking + 750ml during workout)
									</span>
								</div>
							</div>

							{/* High-Protein Superfood Arsenal */}
							<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
								<div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
									<h4 className="text-xs font-bold uppercase tracking-wider text-white">
										High-Protein Hypertrophy Staples
									</h4>
									<div className="flex items-center gap-1 text-[10px]">
										<button
											onClick={() => setDietPreference('all')}
											className={`rounded-lg px-2 py-0.5 ${dietPreference === 'all' ? 'bg-white/20 text-white' : 'text-white/40'}`}
										>
											All
										</button>
										<button
											onClick={() => setDietPreference('veg')}
											className={`rounded-lg px-2 py-0.5 ${dietPreference === 'veg' ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/40'}`}
										>
											Vegetarian
										</button>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
									{filteredFoods.slice(0, 6).map((food) => (
										<div
											key={food.name}
											className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-2.5"
										>
											<div>
												<div className="font-semibold text-white">{food.name}</div>
												<div className="text-[10px] text-white/50">{food.portion}</div>
											</div>
											<div className="text-right">
												<span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
													{food.protein} P
												</span>
												<div className="text-[9.5px] text-white/40 mt-0.5">
													{food.carbs} C • {food.fats} F
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Action Footer */}
							<div className="flex items-center justify-between pt-1">
								<button
									onClick={handleSave}
									className="rounded-xl border border-amber-400 bg-amber-400 px-4 py-2 text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition-all shadow-md active:scale-[0.98] flex items-center gap-1.5"
								>
									<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
										<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
										<polyline points="17 21 17 13 7 13 7 21" />
										<polyline points="7 3 7 8 15 8" />
									</svg>
									<span>Save to My Athlete Profile</span>
								</button>

								<button
									onClick={handleCopy}
									className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
								>
									<svg className="size-3.5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
										<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
										<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
									</svg>
									<span>{copied ? 'Copied!' : 'Share Protocol'}</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
