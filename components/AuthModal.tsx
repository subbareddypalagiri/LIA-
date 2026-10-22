'use client'
'use no memo'
/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/store/authStore'
import { useGymModal } from '@/store/gymHub'
import { getSupabase, isCloudSyncEnabled } from '@/lib/supabase'

const GOOGLE_CLIENT_ID =
	process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
	'409698882769-f0la0fsvesg6m4h6uliafm8j8fldaq9n.apps.googleusercontent.com'

interface AuthModalProps {
	onSuccess?: () => void
}

export default function AuthModal({ onSuccess }: AuthModalProps) {
	const { closeModal, openModal } = useGymModal()
	const { loginWithCredentials, signUp, loginWithGoogle } = useAuth()

	const [isSignUp, setIsSignUp] = useState(false)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [googleLoading, setGoogleLoading] = useState(false)

	// Preload Google Identity Services SDK
	useEffect(() => {
		if (typeof window !== 'undefined' && !(window as any).google?.accounts?.oauth2) {
			const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
			if (!existing) {
				const script = document.createElement('script')
				script.src = 'https://accounts.google.com/gsi/client'
				script.async = true
				script.defer = true
				document.head.appendChild(script)
			}
		}
	}, [])

	const validateEmail = (val: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
	}

	const handleSubmit = async () => {
		setError('')

		if (isSignUp && !name.trim()) {
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
			if (isSignUp) {
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
				// Automatically route Owner to Owner Desk, and Athletes to Member Pass!
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

	const handleGoogleSignIn = async () => {
		setError('')
		setGoogleLoading(true)

		try {
			// Ensure Google GSI script is loaded
			if (typeof window !== 'undefined' && !(window as any).google?.accounts?.oauth2) {
				await new Promise<void>((resolve, reject) => {
					if ((window as any).google?.accounts?.oauth2) return resolve()
					const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
					if (!existing) {
						const script = document.createElement('script')
						script.src = 'https://accounts.google.com/gsi/client'
						script.async = true
						script.defer = true
						script.onload = () => resolve()
						script.onerror = () => reject(new Error('Failed to load Google Sign-In SDK'))
						document.head.appendChild(script)
					} else {
						existing.addEventListener('load', () => resolve())
					}
					setTimeout(() => {
						if ((window as any).google?.accounts?.oauth2) resolve()
						else reject(new Error('Google Sign-In initialization timed out. Please check your internet.'))
					}, 4000)
				})
			}

			const google = (window as any).google
			if (!google?.accounts?.oauth2) {
				throw new Error('Google Sign-In is unavailable. Please try again.')
			}

			const tokenClient = google.accounts.oauth2.initTokenClient({
				client_id: GOOGLE_CLIENT_ID,
				scope: 'email profile openid',
				callback: async (tokenResponse: any) => {
					if (tokenResponse.error) {
						setError(tokenResponse.error_description || tokenResponse.error || 'Google Sign-In was cancelled')
						setGoogleLoading(false)
						return
					}
					if (tokenResponse.access_token) {
						try {
							const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
								headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
							})
							if (!res.ok) throw new Error('Could not fetch Google profile')
							const profile = (await res.json()) as any

							const loginRes = await loginWithGoogle({
								email: profile.email,
								name: profile.name || profile.given_name,
								avatar: profile.picture
							})

							if (loginRes.success) {
								closeModal()
								if (onSuccess) onSuccess()
								if (loginRes.role === 'owner') {
									openModal('owner')
								} else {
									openModal('my-membership')
								}
							} else {
								setError(loginRes.error || 'Google Sign-In failed')
							}
						} catch (fetchErr: any) {
							setError(fetchErr.message || 'Failed to retrieve Google user profile')
						} finally {
							setGoogleLoading(false)
						}
					}
				},
				error_callback: (err: any) => {
					setError(err?.message || 'Google Sign-In window closed')
					setGoogleLoading(false)
				}
			})

			tokenClient.requestAccessToken({ prompt: 'select_account' })
		} catch (e: any) {
			setError(e.message || 'Google Sign-In failed')
			setGoogleLoading(false)
		}
	}

	return (
		<div className="fixed inset-0 z-[60] flex flex-col items-center justify-start sm:justify-center p-4 py-8 sm:py-6 overflow-y-auto bg-black/85 backdrop-blur-md min-h-[100dvh] pb-[max(2rem,env(safe-area-inset-bottom))]">
			{/* Backdrop click to close */}
			<div className="fixed inset-0" onClick={closeModal} />

			{/* Centered Glass Card */}
			<div className="relative z-10 my-auto shrink-0 w-full max-w-sm rounded-3xl bg-neutral-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-white animate-in fade-in zoom-in-95 duration-200">
				{/* Dismiss Button */}
				<button
					type="button"
					onClick={closeModal}
					className="absolute top-2.5 right-2.5 text-white/60 hover:text-white transition p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full active:scale-95"
					aria-label="Close"
				>
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				{/* Logo Icon */}
				<div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 mb-4 shadow-lg text-white">
					<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
					</svg>
				</div>

				{/* Title & Subtitle */}
				<h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight font-heading uppercase">
					LIA Iron Club
				</h2>
				<p className="text-xs text-neutral-300 mb-6 text-center">
					{isSignUp ? 'Create your athlete account' : 'Enter your email & password to continue'}
				</p>

				{/* Form */}
				<div className="flex flex-col w-full gap-3.5">
					<div className="w-full flex flex-col gap-3">
						{isSignUp && (
							<input
								placeholder="Full Name"
								type="text"
								value={name}
								className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 border border-white/10 transition"
								onChange={(e) => setName(e.target.value)}
							/>
						)}

						<input
							placeholder="Email Address"
							type="email"
							value={email}
							className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 border border-white/10 transition"
							onChange={(e) => setEmail(e.target.value)}
						/>

						<input
							placeholder="Password"
							type="password"
							value={password}
							className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 border border-white/10 transition"
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
					</div>

					<hr className="border-white/10 my-0.5" />

					<div>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={loading}
							className="w-full bg-white hover:bg-neutral-200 text-black font-bold px-5 py-3 rounded-full shadow transition mb-2.5 text-xs uppercase tracking-wider active:scale-[0.99] disabled:opacity-50"
						>
							{loading ? 'Verifying...' : isSignUp ? 'Sign up' : 'Sign in'}
						</button>

						{/* Google Sign In */}
						<button
							type="button"
							onClick={handleGoogleSignIn}
							disabled={googleLoading || loading}
							className="w-full flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-full px-5 py-2.5 font-medium text-white shadow transition mb-2 text-xs active:scale-[0.99]"
						>
							{googleLoading ? (
								<svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
								</svg>
							) : (
								<svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
									<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
									<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
									<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
									<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
								</svg>
							)}
							<span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
						</button>

						<div className="w-full text-center mt-2">
							<span className="text-xs text-white/50">
								{isSignUp ? 'Already an athlete? ' : "New athlete? "}
								<button
									type="button"
									onClick={() => {
										setIsSignUp(!isSignUp)
										setError('')
									}}
									className="underline text-white font-semibold ml-1 transition"
								>
									{isSignUp ? 'Sign in' : "Sign up, it's free!"}
								</button>
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* User count and athlete avatar cluster */}
			<div className="relative z-10 mt-6 sm:mt-8 flex flex-col items-center text-center">
				<p className="text-neutral-300 text-xs mb-2">
					Join <span className="font-semibold text-white">hundreds</span> of athletes training with LIA.
				</p>
				<div className="flex -space-x-2">
					<img
						src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
						alt="athlete"
						className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover"
					/>
					<img
						src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
						alt="athlete"
						className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover"
					/>
					<img
						src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
						alt="athlete"
						className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover"
					/>
					<img
						src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80"
						alt="athlete"
						className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover"
					/>
				</div>
			</div>
		</div>
	)
}
