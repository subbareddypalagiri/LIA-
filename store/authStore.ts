'use client'
'use no memo'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase, isCloudSyncEnabled, saveMemberData } from '@/lib/supabase'

export type UserRole = 'owner' | 'member'

export interface AuthUser {
	id: string
	email: string
	name: string
	role: UserRole
	phone?: string
	plan?: string
	startDate?: string
	expiryDate?: string
	avatar?: string
	checkinCount?: number
}

export const DEMO_OWNER: AuthUser = {
	id: 'owner_subba_reddy',
	email: 'owner@liaironclub.com',
	name: 'Subba Reddy Palagiri',
	role: 'owner',
	phone: '+91 98765 43210',
	avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
}

export const DEMO_MEMBER: AuthUser = {
	id: 'member_rahul_v',
	email: 'rahul.verma@gmail.com',
	name: 'Rahul Verma',
	role: 'member',
	phone: '+91 98480 22334',
	plan: '6 Months Elite Hypertrophy',
	startDate: '2026-05-15',
	expiryDate: '2026-11-15',
	avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
	checkinCount: 32
}

const AUTH_STORAGE_KEY = 'lia_auth_session'
const AUTH_EVENT = 'lia-auth-change'

function getStoredUser(): AuthUser | null {
	if (typeof window === 'undefined') return null
	try {
		const saved = localStorage.getItem(AUTH_STORAGE_KEY)
		return saved ? (JSON.parse(saved) as AuthUser) : null
	} catch {
		return null
	}
}

function setStoredUser(user: AuthUser | null) {
	if (typeof window === 'undefined') return
	try {
		if (user) {
			localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
		} else {
			localStorage.removeItem(AUTH_STORAGE_KEY)
		}
		window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: user }))
	} catch {}
}

export function useAuth() {
	const [user, setUser] = useState<AuthUser | null>(getStoredUser)

	useEffect(() => {
		const handleAuth = (e: Event) => {
			const ce = e as CustomEvent<AuthUser | null>
			setUser(ce.detail)
		}
		window.addEventListener(AUTH_EVENT, handleAuth)
		return () => window.removeEventListener(AUTH_EVENT, handleAuth)
	}, [])

	// Cloud session sync on mount
	useEffect(() => {
		const client = getSupabase()
		if (client && isCloudSyncEnabled()) {
			client.auth.getSession().then(({ data: { session } }) => {
				if (session?.user) {
					const meta = session.user.user_metadata || {}
					const authUser: AuthUser = {
						id: session.user.id,
						email: session.user.email || '',
						name: meta.name || session.user.email?.split('@')[0] || 'User',
						role: (meta.role as UserRole) || 'member',
						phone: meta.phone,
						plan: meta.plan || '3 Months Hypertrophy',
						startDate: meta.startDate || new Date().toISOString().split('T')[0],
						expiryDate: meta.expiryDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
					}
					setStoredUser(authUser)
				}
			})
		}
	}, [])

	const loginWithDemo = useCallback((role: UserRole) => {
		const selected = role === 'owner' ? DEMO_OWNER : DEMO_MEMBER
		setStoredUser(selected)
		return selected
	}, [])

	const loginWithCredentials = useCallback(
		async (email: string, pass: string, expectedRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
			const client = getSupabase()

			if (client && isCloudSyncEnabled()) {
				try {
					const { data, error } = await client.auth.signInWithPassword({ email, password: pass })
					if (error) return { success: false, error: error.message }
					if (data.user) {
						const meta = data.user.user_metadata || {}
						const role: UserRole = (meta.role as UserRole) || expectedRole || 'member'
						const authUser: AuthUser = {
							id: data.user.id,
							email: data.user.email || email,
							name: meta.name || email.split('@')[0],
							role,
							phone: meta.phone,
							plan: meta.plan,
							expiryDate: meta.expiryDate
						}
						setStoredUser(authUser)
						return { success: true }
					}
				} catch (e: any) {
					return { success: false, error: e.message || 'Login failed' }
				}
			}

			// Local offline authentication
			if (expectedRole === 'owner') {
				if (pass === 'owner123' || pass === '2026' || email.includes('owner')) {
					setStoredUser(DEMO_OWNER)
					return { success: true }
				}
				return { success: false, error: 'Invalid Owner credentials (use demo password: owner123 or 2026)' }
			} else {
				// Member login
				const authUser: AuthUser = {
					id: `mem_${Date.now()}`,
					email,
					name: email.split('@')[0].replace('.', ' '),
					role: 'member',
					plan: '3 Months Hypertrophy',
					startDate: new Date().toISOString().split('T')[0],
					expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
					checkinCount: 1
				}
				setStoredUser(authUser)
				return { success: true }
			}
		},
		[]
	)

	const signUp = useCallback(
		async (
			name: string,
			email: string,
			pass: string,
			phone: string,
			plan: string
		): Promise<{ success: boolean; error?: string }> => {
			const client = getSupabase()

			const memberData = {
				name,
				email,
				phone,
				plan,
				role: 'member',
				startDate: new Date().toISOString().split('T')[0],
				expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
			}

			if (client && isCloudSyncEnabled()) {
				try {
					const { data, error } = await client.auth.signUp({
						email,
						password: pass,
						options: {
							data: memberData
						}
					})
					if (error) return { success: false, error: error.message }
					if (data.user) {
						const authUser: AuthUser = {
							id: data.user.id,
							email,
							name,
							role: 'member',
							phone,
							plan,
							startDate: memberData.startDate,
							expiryDate: memberData.expiryDate
						}
						setStoredUser(authUser)
						// Also sync to gym_members table
						saveMemberData({
							id: data.user.id,
							name,
							email,
							phone,
							photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
							plan,
							startDate: memberData.startDate,
							expiryDate: memberData.expiryDate
						})
						return { success: true }
					}
				} catch (e: any) {
					return { success: false, error: e.message || 'Registration failed' }
				}
			}

			// Local fallback sign up
			const authUser: AuthUser = {
				id: `mem_${Date.now()}`,
				email,
				name,
				role: 'member',
				phone,
				plan,
				startDate: memberData.startDate,
				expiryDate: memberData.expiryDate,
				checkinCount: 1
			}
			setStoredUser(authUser)
			return { success: true }
		},
		[]
	)

	const logout = useCallback(async () => {
		const client = getSupabase()
		if (client && isCloudSyncEnabled()) {
			try {
				await client.auth.signOut()
			} catch {}
		}
		setStoredUser(null)
	}, [])

	return {
		user,
		isOwner: user?.role === 'owner',
		isMember: user?.role === 'member',
		isAuthenticated: Boolean(user),
		loginWithDemo,
		loginWithCredentials,
		signUp,
		logout
	}
}
