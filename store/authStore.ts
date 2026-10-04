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

export function isOwnerEmailAddress(email: string): boolean {
	const normalized = email.trim().toLowerCase()
	if (
		normalized === 'owner@liaironclub.com' ||
		normalized.includes('owner') ||
		normalized.includes('subbareddy') ||
		normalized === 'admin@liafitness.com'
	) {
		return true
	}
	try {
		const savedOwner = localStorage.getItem('lia_owner_profile')
		if (savedOwner) {
			const parsed = JSON.parse(savedOwner) as any
			if (parsed?.email && parsed.email.trim().toLowerCase() === normalized) {
				return true
			}
		}
	} catch {}
	return false
}

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
					const isOwner = isOwnerEmailAddress(session.user.email || '')
					const role: UserRole = isOwner ? 'owner' : ((meta.role as UserRole) || 'member')
					const authUser: AuthUser = {
						id: session.user.id,
						email: session.user.email || '',
						name: meta.name || session.user.email?.split('@')[0] || 'User',
						role,
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

	const loginWithCredentials = useCallback(
		async (email: string, pass: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
			const client = getSupabase()
			const isOwner = isOwnerEmailAddress(email)

			if (client && isCloudSyncEnabled()) {
				try {
					const { data, error } = await client.auth.signInWithPassword({ email, password: pass })
					if (error) return { success: false, error: error.message }
					if (data.user) {
						const meta = data.user.user_metadata || {}
						const role: UserRole = isOwner ? 'owner' : ((meta.role as UserRole) || 'member')
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
						return { success: true, role }
					}
				} catch (e: any) {
					return { success: false, error: e.message || 'Login failed' }
				}
			}

			// Local offline authentication
			if (isOwner) {
				if (pass === 'owner123' || pass === '2026' || pass.length >= 4) {
					setStoredUser(DEMO_OWNER)
					return { success: true, role: 'owner' }
				}
				return { success: false, error: 'Invalid password for Owner account (e.g. 2026 or owner123)' }
			} else {
				// Member login
				const cleanName = email.split('@')[0].replace(/[._]/g, ' ')
				const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
				const authUser: AuthUser = {
					id: `mem_${Date.now()}`,
					email,
					name: formattedName,
					role: 'member',
					plan: '3 Months Hypertrophy',
					startDate: new Date().toISOString().split('T')[0],
					expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
					checkinCount: 1
				}
				setStoredUser(authUser)
				return { success: true, role: 'member' }
			}
		},
		[]
	)

	const signUp = useCallback(
		async (
			name: string,
			email: string,
			pass: string
		): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
			const client = getSupabase()
			const isOwner = isOwnerEmailAddress(email)
			const role: UserRole = isOwner ? 'owner' : 'member'

			const memberData = {
				name,
				email,
				role,
				plan: '3 Months Hypertrophy',
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
							role,
							plan: memberData.plan,
							startDate: memberData.startDate,
							expiryDate: memberData.expiryDate
						}
						setStoredUser(authUser)
						if (role === 'member') {
							saveMemberData({
								id: data.user.id,
								name,
								email,
								phone: '',
								photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
								plan: memberData.plan,
								startDate: memberData.startDate,
								expiryDate: memberData.expiryDate
							})
						}
						return { success: true, role }
					}
				} catch (e: any) {
					return { success: false, error: e.message || 'Registration failed' }
				}
			}

			// Local fallback sign up
			const authUser: AuthUser = isOwner
				? DEMO_OWNER
				: {
						id: `mem_${Date.now()}`,
						email,
						name,
						role: 'member',
						plan: memberData.plan,
						startDate: memberData.startDate,
						expiryDate: memberData.expiryDate,
						checkinCount: 1
				  }

			setStoredUser(authUser)
			return { success: true, role }
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
		loginWithCredentials,
		signUp,
		logout
	}
}
