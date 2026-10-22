'use client'
'use no memo'
/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import { useState } from 'react'
import { useAuth } from '@/store/authStore'
import { useGymModal } from '@/store/gymHub'
import { getSupabase, isCloudSyncEnabled } from '@/lib/supabase'

interface AuthModalProps {
	onSuccess?: () => void
	initialMode?: 'athlete' | 'owner'
}

export default function AuthModal({ onSuccess, initialMode = 'athlete' }: AuthModalProps) {
	const { closeModal, openModal } = useGymModal()
	const { loginWithCredentials, signUp } = useAuth()

	const [authRole, setAuthRole] = useState<'athlete' | 'owner'>(initialMode)
	const [isSignUp, setIsSignUp] = useState(false)
	const [name, setName] = useState('')
	const [email, setEmail] = useState(initialMode === 'owner' ? 'subbareddy123sub@gmail.com' : '')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const validateEmail = (val: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
	}

	const switchRole = (role: 'athlete' | 'owner') => {
		setAuthRole(role)
		setError('')
		if (role === 'owner') {
			setIsSignUp(false)
			setEmail('subbareddy123sub@gmail.com')
			setPassword('')
		} else {
			if (email === 'subbareddy123sub@gmail.com') {
				setEmail('')
			}
			setPassword('')
		}
	}

	const handleSubmit = async () => {
		setError('')

		if (authRole === 'athlete' && isSignUp && !name.trim()) {
			setError('Please enter your full name.')
			return
		}

		if (!email.trim() || !password.trim()) {
			setError('Please enter both email and password.')
			return
		}

		if (!validateEmail(email)) {
			setError('Please enter a valid email address.')
			return
		}

		setLoading(true)

		try {
			if (authRole === 'athlete' && isSignUp) {
				const res = await signUp(name.trim(), email.trim(), password)
				if (!res.success) {
					setError(res.error || 'Sign up failed')
					setLoading(false)
					return
				}
				closeModal()
				if (onSuccess) onSuccess()
				openModal('my-membership')
			} else {
				const res = await loginWithCredentials(email.trim(), password)
				if (!res.success) {
					setError(res.error || 'Invalid email or password')
					setLoading(false)
					return
				}
				closeModal()
				if (onSuccess) onSuccess()
				if (res.role === 'owner') {
					openModal('owner')
				} else {
					openModal('my-membership')
				}
			}
		} catch (err: any) {
			setError(err.message || 'Something went wrong')
		} finally {
			setLoading(false)
		}
	}

	// Fast 1-Tap sign in for Owner (saves tedious mobile typing)
	const handleQuickOwnerSignIn = async () => {
		setLoading(true)
		setError('')
		try {
			const res = await loginWithCredentials('subbareddy123sub@gmail.com', 'Subba@LIA2026')
			if (!res.success) {
				setError(res.error || 'Owner login failed')
				setLoading(false)
				return
			}
			closeModal()
			if (onSuccess) onSuccess()
			openModal('owner')
		} catch (err: any) {
			setError(err.message || 'Something went wrong')
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleSignIn = async () => {
		setError('')
		const client = getSupabase()
		if (client && isCloudSyncEnabled()) {
			try {
				await client.auth.signInWithOAuth({
					provider: 'google',
					options: {
						redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
					}
				})
				return
			} catch (e: any) {
				setError(e.message || 'Google authentication failed')
			}
		} else {
			setError('Google Sign-In requires Supabase cloud configuration. Please enter your email and password.')
		}
	}

	return (
		<div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
			{/* Backdrop click to close */}
			<div className="fixed inset-0" onClick={closeModal} />

			{/* Centered Glass Card */}
			<div className="relative z-10 w-full max-w-sm rounded-3xl bg-neutral-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-6 sm:p-7 flex flex-col items-center text-white animate-in fade-in zoom-in-95 duration-200">
				{/* Dismiss Button */}
				<button
					type="button"
					onClick={closeModal}
					className="absolute top-4 right-4 text-white/40 hover:text-white transition p-1.5 rounded-full"
					aria-label="Close"
				>
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				{/* Role Switcher Segmented Tabs */}
				<div className="w-full grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-4 mt-1">
					<button
						type="button"
						onClick={() => switchRole('athlete')}
						className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
							authRole === 'athlete'
								? 'bg-white text-black shadow-md'
								: 'text-white/60 hover:text-white'
						}`}
					>
						<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
							<circle cx="12" cy="7" r="4" />
							<path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
						</svg>
						<span>Athlete Pass</span>
					</button>

					<button
						type="button"
						onClick={() => switchRole('owner')}
						className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
							authRole === 'owner'
								? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-400/25 font-black'
								: 'text-amber-300/80 hover:text-amber-300'
						}`}
					>
						<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
							<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
						</svg>
						<span>Club Owner ✦</span>
					</button>
				</div>

				{/* Logo Icon */}
				<div className={`flex items-center justify-center w-11 h-11 rounded-2xl mb-3 shadow-lg border transition-all ${
					authRole === 'owner'
						? 'bg-amber-400/15 border-amber-400/30 text-amber-300'
						: 'bg-white/10 border-white/20 text-white'
				}`}>
					{authRole === 'owner' ? (
						<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
							<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
						</svg>
					) : (
						<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
						</svg>
					)}
				</div>

				{/* Title & Subtitle */}
				<h2 className="text-xl font-bold text-white mb-0.5 text-center tracking-tight">
					{authRole === 'owner' ? 'LIA Owner Authority Desk' : 'LIA Iron Club Pass'}
				</h2>
				<p className="text-[11px] text-white/50 mb-4 text-center max-w-[260px]">
					{authRole === 'owner'
						? 'Administrative master access for Palagiri Subbareddy'
						: isSignUp
						? 'Create your digital athlete membership pass'
						: 'Sign in to access your workouts & digital pass'}
				</p>

				{/* Owner Quick 1-Tap Sign In Pill */}
				{authRole === 'owner' && (
					<div className="w-full mb-3.5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-2.5 flex flex-col gap-2">
						<div className="flex items-center justify-between text-[11px]">
							<span className="font-bold text-amber-300 flex items-center gap-1">
								<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
								<span>Subba Reddy (Verified Owner)</span>
							</span>
							<span className="text-[10px] text-amber-300/70 font-mono">Master Key</span>
						</div>
						<button
							type="button"
							onClick={handleQuickOwnerSignIn}
							disabled={loading}
							className="w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2 px-3 text-xs font-black uppercase tracking-wider text-black hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5"
						>
							<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
								<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
							</svg>
							<span>1-Tap Sign In as Owner</span>
						</button>
					</div>
				)}

				{/* Form Inputs */}
				<div className="flex flex-col w-full gap-3">
					{authRole === 'athlete' && isSignUp && (
						<input
							placeholder="Full Name"
							type="text"
							value={name}
							className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 border border-white/10 transition"
							onChange={(e) => setName(e.target.value)}
						/>
					)}

					<input
						placeholder={authRole === 'owner' ? 'Owner Email' : 'Email Address'}
						type="email"
						value={email}
						className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 border border-white/10 transition"
						onChange={(e) => setEmail(e.target.value)}
					/>

					<input
						placeholder={authRole === 'owner' ? 'Owner Master Password (Subba@LIA2026)' : 'Password'}
						type="password"
						value={password}
						className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 border border-white/10 transition"
						onChange={(e) => setPassword(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleSubmit()
						}}
					/>

					{error && (
						<div className="text-xs text-rose-400 text-left px-1">
							{error}
						</div>
					)}

					{/* Submit Button */}
					<button
						type="button"
						onClick={handleSubmit}
						disabled={loading}
						className={`w-full font-bold px-5 py-2.5 rounded-xl shadow transition text-xs uppercase tracking-wider active:scale-[0.98] disabled:opacity-50 mt-1 ${
							authRole === 'owner'
								? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20'
								: 'bg-white hover:bg-neutral-200 text-black'
						}`}
					>
						{loading ? 'Verifying...' : authRole === 'owner' ? 'Enter Owner Desk →' : isSignUp ? 'Sign Up' : 'Sign In'}
					</button>

					{/* Google Sign In (Athlete only) */}
					{authRole === 'athlete' && (
						<>
							<button
								type="button"
								onClick={handleGoogleSignIn}
								className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2.5 font-medium text-white shadow transition text-xs border border-white/10 active:scale-[0.98]"
							>
								<svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
									<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
									<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
									<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
									<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
								</svg>
								<span>Continue with Google</span>
							</button>

							<div className="w-full text-center mt-1">
								<span className="text-[11px] text-white/50">
									{isSignUp ? 'Already an athlete? ' : "New athlete? "}
									<button
										type="button"
										onClick={() => {
											setIsSignUp(!isSignUp)
											setError('')
										}}
										className="underline text-white font-semibold ml-1 transition"
									>
										{isSignUp ? 'Sign in' : 'Create Free Pass'}
									</button>
								</span>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
