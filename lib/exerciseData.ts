"use no memo"

import repdbData from '../data/repdb-exercises.json'

export interface RepExercise {
	id: string
	name: string
	bodyPart: string
	category: string
	equipment: string
	difficulty: string
	primaryMuscles: string[]
	secondaryMuscles: string[]
	instructions: string[]
	tips: string[]
	startImage: string
	peakImage: string
}

export const ALL_REP_EXERCISES: RepExercise[] = repdbData as RepExercise[]

export const MUSCLE_CATEGORIES = [
	{ label: 'All', value: 'All' },
	{ label: 'Chest', value: 'Chest' },
	{ label: 'Back', value: 'Back' },
	{ label: 'Shoulders', value: 'Shoulders' },
	{ label: 'Arms', value: 'Arms' },
	{ label: 'Legs', value: 'Legs' },
	{ label: 'Core & Abs', value: 'Core' },
	{ label: 'Full Body', value: 'Full Body' },
	{ label: 'Saved 🔖', value: 'Saved' }
] as const

export const EQUIPMENT_FILTERS = [
	'All Equipment',
	'Barbell',
	'Dumbbell',
	'Cable',
	'Machine',
	'Bodyweight'
] as const

export function matchesMuscleCategory(ex: RepExercise, category: string): boolean {
	if (category === 'All') return true
	const bp = ex.bodyPart.toLowerCase()
	switch (category) {
		case 'Chest':
			return bp === 'chest'
		case 'Back':
			return bp === 'back'
		case 'Shoulders':
			return bp === 'shoulders'
		case 'Arms':
			return bp === 'upper_arms' || bp === 'lower_arms'
		case 'Legs':
			return bp === 'upper_legs' || bp === 'lower_legs'
		case 'Core':
		case 'Core & Abs':
			return bp === 'core'
		case 'Full Body':
			return bp === 'full_body' || ex.category === 'cardio' || ex.category === 'plyometrics'
		default:
			return true
	}
}

export function matchesEquipment(ex: RepExercise, eqFilter: string): boolean {
	if (eqFilter === 'All Equipment') return true
	const eq = ex.equipment.toLowerCase()
	const target = eqFilter.toLowerCase()
	if (target === 'machine') {
		return eq.includes('machine') || eq.includes('press') || eq.includes('deck') || eq.includes('smith')
	}
	return eq.includes(target)
}
