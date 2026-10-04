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
}

export default function AuthModal({ onSuccess }: AuthModalProps) {
	const { closeModal, openModal } = useGymModal()
	const { loginWithCredentials, signUp } = useAuth()

	const [isSignUp, setIsSignUp] = useState(false)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

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
			// Instant local fallback for Google sign-in demo
			await loginWithCredentials('athlete.google@gmail.com', 'google_auth_demo')
			closeModal()
			if (onSuccess) onSuccess()
			openModal('my-membership')
		}
	}

	return (
		<div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
			{/* Backdrop click to close */}
			<div className="fixed inset-0" onClick={closeModal} />

			{/* Centered Glass Card */}
			<div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-md border border-white/10 shadow-2xl p-7 sm:p-8 flex flex-col items-center">
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

				{/* Logo Icon */}
				<div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-5 shadow-lg border border-white/20">
					<svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
					</svg>
				</div>

				{/* Title */}
				<h2 className="text-2xl font-semibold text-white mb-1 text-center tracking-tight">
					LIA Fitness
				</h2>
				<p className="text-xs text-gray-400 mb-6 text-center">
					{isSignUp ? 'Create your athlete account' : 'Enter your email to continue'}
				</p>

				{/* Form */}
				<div className="flex flex-col w-full gap-4">
					<div className="w-full flex flex-col gap-3">
						{isSignUp && (
							<input
								placeholder="Full Name"
								type="text"
								value={name}
								className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 border border-white/5 transition"
								onChange={(e) => setName(e.target.value)}
							/>
						)}

						<input
							placeholder="Email"
							type="email"
							value={email}
							className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 border border-white/5 transition"
							onChange={(e) => setEmail(e.target.value)}
						/>

						<input
							placeholder="Password"
							type="password"
							value={password}
							className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 border border-white/5 transition"
							onChange={(e) => setPassword(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleSubmit()
							}}
						/>

						{error && (
							<div className="text-xs text-red-400 text-left px-1">
								{error}
							</div>
						)}
					</div>

					<hr className="opacity-10 my-1" />

					<div>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={loading}
							className="w-full bg-white/15 hover:bg-white/25 active:scale-[0.99] text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm disabled:opacity-50"
						>
							{loading ? 'Please wait...' : isSignUp ? 'Sign up' : 'Sign in'}
						</button>

						{/* Google Sign In */}
						<button
							type="button"
							onClick={handleGoogleSignIn}
							className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-b from-[#232526] to-[#2d2e30] rounded-full px-5 py-3 font-medium text-white shadow hover:brightness-110 transition mb-2 text-sm border border-white/10"
						>
							<svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
								<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
								<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
								<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
								<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
							</svg>
							<span>Continue with Google</span>
						</button>

						<div className="w-full text-center mt-2">
							<span className="text-xs text-gray-400">
								{isSignUp ? 'Already have an account? ' : "Don't have an account? "}
								<button
									type="button"
									onClick={() => {
										setIsSignUp(!isSignUp)
										setError('')
									}}
									className="underline text-white/80 hover:text-white font-medium ml-1 transition"
								>
									{isSignUp ? 'Sign in' : "Sign up, it's free!"}
								</button>
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* User count and avatars */}
			<div className="relative z-10 mt-8 sm:mt-10 flex flex-col items-center text-center">
				<p className="text-gray-400 text-xs sm:text-sm mb-2.5">
					Join <span className="font-medium text-white">thousands</span> of athletes who are already training with LIA.
				</p>
				<div className="flex -space-x-2">
					<img
						src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
						alt="athlete"
						className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
					/>
					<img
						src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
						alt="athlete"
						className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
					/>
					<img
						src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
						alt="athlete"
						className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
					/>
					<img
						src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80"
						alt="athlete"
						className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
					/>
				</div>
			</div>
		</div>
	)
}
