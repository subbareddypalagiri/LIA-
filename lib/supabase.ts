"use no memo"

import { createClient, SupabaseClient } from '@supabase/supabase-js'

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

export interface OwnerProfile {
	id?: string
	gymName: string
	ownerName: string
	phone: string
	email: string
	upiId: string
	monthlyTarget: number
	todayCheckins: number
}

const DEFAULT_OWNER_PROFILE: OwnerProfile = {
	gymName: 'LIA Iron Club',
	ownerName: 'Subba Reddy Palagiri',
	phone: '+91 98765 43210',
	email: 'owner@liaironclub.com',
	upiId: 'liaironclub@okhdfcbank',
	monthlyTarget: 180000,
	todayCheckins: 48
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function initSupabase(): SupabaseClient | null {
	if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('https://')) {
		return null
	}
	try {
		return createClient(supabaseUrl, supabaseAnonKey)
	} catch (e) {
		console.warn('[Supabase] Failed to initialize client:', e)
		return null
	}
}

export const supabase: SupabaseClient | null = initSupabase()

export function getSupabase(): SupabaseClient | null {
	return supabase
}

export function isCloudSyncEnabled(): boolean {
	return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'))
}

// Storage helpers
function getStorage<T>(key: string, fallback: T): T {
	if (typeof window === 'undefined') return fallback
	try {
		const val = localStorage.getItem(key)
		return val ? (JSON.parse(val) as T) : fallback
	} catch {
		return fallback
	}
}

function setStorage<T>(key: string, val: T): void {
	if (typeof window === 'undefined') return
	try {
		localStorage.setItem(key, JSON.stringify(val))
	} catch {}
}

// --- HYBRID DATA LAYER: MEMBERS ---

export async function fetchMembersData(fallbackMembers: GymMember[]): Promise<GymMember[]> {
	const client = getSupabase()

	if (client && isCloudSyncEnabled()) {
		try {
			const { data, error } = await client.from('gym_members').select('*').order('expiry_date', { ascending: true })
			if (!error && data && data.length > 0) {
				const members: GymMember[] = data.map((row) => ({
					id: row.id,
					name: row.name,
					email: row.email,
					phone: row.phone,
					photoUrl: row.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
					plan: row.plan,
					startDate: row.start_date,
					expiryDate: row.expiry_date,
					lastNotified: row.last_notified
				}))
				setStorage('lia_gym_members', members)
				return members
			}
		} catch (e) {
			console.warn('[Supabase] Members fetch failed, falling back to local storage', e)
		}
	}

	return getStorage<GymMember[]>('lia_gym_members', fallbackMembers)
}

export async function saveMemberData(member: GymMember): Promise<void> {
	const client = getSupabase()

	if (client && isCloudSyncEnabled()) {
		try {
			await client.from('gym_members').upsert({
				id: member.id,
				name: member.name,
				email: member.email,
				phone: member.phone,
				photo_url: member.photoUrl,
				plan: member.plan,
				start_date: member.startDate,
				expiry_date: member.expiryDate,
				last_notified: member.lastNotified,
				updated_at: new Date().toISOString()
			})
		} catch (e) {
			console.warn('[Supabase] Save member cloud write failed:', e)
		}
	}
}

export async function deleteMemberData(memberId: string): Promise<void> {
	const client = getSupabase()
	if (client && isCloudSyncEnabled()) {
		try {
			await client.from('gym_members').delete().eq('id', memberId)
		} catch (e) {
			console.warn('[Supabase] Delete member cloud write failed:', e)
		}
	}
}

// --- HYBRID DATA LAYER: OWNER PROFILE ---

export async function fetchOwnerProfileData(): Promise<OwnerProfile> {
	const client = getSupabase()

	if (client && isCloudSyncEnabled()) {
		try {
			const { data, error } = await client.from('owner_profile').select('*').limit(1).single()
			if (!error && data) {
				const profile: OwnerProfile = {
					id: data.id,
					gymName: data.gym_name,
					ownerName: data.owner_name,
					phone: data.phone,
					email: data.email,
					upiId: data.upi_id,
					monthlyTarget: data.monthly_target || 180000,
					todayCheckins: data.today_checkins || 48
				}
				setStorage('lia_owner_profile', profile)
				return profile
			}
		} catch (e) {
			console.warn('[Supabase] Owner profile fetch failed:', e)
		}
	}

	return getStorage<OwnerProfile>('lia_owner_profile', DEFAULT_OWNER_PROFILE)
}

export async function saveOwnerProfileData(profile: OwnerProfile): Promise<void> {
	setStorage('lia_owner_profile', profile)

	const client = getSupabase()
	if (client && isCloudSyncEnabled()) {
		try {
			await client.from('owner_profile').upsert({
				id: profile.id || 'default_owner',
				gym_name: profile.gymName,
				owner_name: profile.ownerName,
				phone: profile.phone,
				email: profile.email,
				upi_id: profile.upiId,
				monthly_target: profile.monthlyTarget,
				today_checkins: profile.todayCheckins,
				updated_at: new Date().toISOString()
			})
		} catch (e) {
			console.warn('[Supabase] Save owner profile cloud write failed:', e)
		}
	}
}
