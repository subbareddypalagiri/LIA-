'use client'
'use no memo'

import { useState } from 'react'
import { useAuth } from '@/store/authStore'
import { useGymModal } from '@/store/gymHub'

interface AuthModalProps {
	onSuccess?: () => void
}

export default function AuthModal({ onSuccess }: AuthModalProps) {
	const { closeModal, openModal } = useGymModal()
	const { loginWithCredentials, loginWithDemo, signUp } = useAuth()

	const [authMode, setAuthMode] = useState<'member-login' | 'owner-login' | 'signup'>('member-login')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [plan, setPlan] = useState('3 Months Hypertrophy Tier')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			if (authMode === 'signup') {
				if (!name || !email || !password || !phone) {
					setError('Please fill in all required fields.')
					setLoading(false)
					return
				}
				const res = await signUp(name, email, password, phone, plan)
				if (!res.success) {
					setError(res.error || 'Registration failed')
					setLoading(false)
					return
				}
			} else {
				const isOwner = authMode === 'owner-login'
				const res = await loginWithCredentials(email || (isOwner ? 'owner@liaironclub.com' : 'athlete@gmail.com'), password, isOwner ? 'owner' : 'member')
				if (!res.success) {
					setError(res.error || 'Authentication failed')
					setLoading(false)
					return
				}
			}

			setLoading(false)
			if (onSuccess) onSuccess()
			closeModal()
		} catch (err: any) {
			setError(err.message || 'Something went wrong')
			setLoading(false)
		}
	}

	const handleQuickDemo = (role: 'owner' | 'member') => {
		loginWithDemo(role)
		if (role === 'owner') {
			openModal('owner')
		} else {
			openModal('my-membership')
		}
	}

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5">
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={closeModal} />

			{/* Modal Dialog */}
			<div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-white">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="text-xl">🔐</span>
							<h3 className="font-heading text-lg sm:text-xl font-black uppercase tracking-wide text-white">
								{authMode === 'owner-login'
									? 'Owner Admin Portal'
									: authMode === 'signup'
									? 'Athlete Registration'
									: 'Member Portal Login'}
							</h3>
						</div>
						<p className="text-xs text-white/50">
							{authMode === 'owner-login'
								? 'Restricted to Gym Owner & Management'
								: 'Access workout splits, personal digital pass & attendance'}
						</p>
					</div>
					<button
						onClick={closeModal}
						className="flex size-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/60 hover:text-white"
					>
						✕
					</button>
				</div>

				{/* Tab Selector */}
				<div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 text-xs font-bold uppercase tracking-wider">
					<button
						type="button"
						onClick={() => {
							setAuthMode('member-login')
							setError(null)
						}}
						className={`py-2 rounded-xl transition-all text-center ${
							authMode === 'member-login'
								? 'bg-amber-400 text-black shadow-md'
								: 'text-white/60 hover:text-white'
						}`}
					>
						Member
					</button>
					<button
						type="button"
						onClick={() => {
							setAuthMode('owner-login')
							setError(null)
						}}
						className={`py-2 rounded-xl transition-all text-center ${
							authMode === 'owner-login'
								? 'bg-amber-400 text-black shadow-md'
								: 'text-white/60 hover:text-white'
						}`}
					>
						Owner 👑
					</button>
					<button
						type="button"
						onClick={() => {
							setAuthMode('signup')
							setError(null)
						}}
						className={`py-2 rounded-xl transition-all text-center ${
							authMode === 'signup'
								? 'bg-amber-400 text-black shadow-md'
								: 'text-white/60 hover:text-white'
						}`}
					>
						Register
					</button>
				</div>

				{/* Error Box */}
				{error && (
					<div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
						{error}
					</div>
				)}

				{/* Auth Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{authMode === 'signup' && (
						<>
							<div>
								<label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
									Full Name
								</label>
								<input
									type="text"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. Rahul Verma"
									className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
									Phone Number
								</label>
								<input
									type="tel"
									required
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder="+91 98480 00000"
									className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
									Membership Tier
								</label>
								<select
									value={plan}
									onChange={(e) => setPlan(e.target.value)}
									className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
								>
									<option value="1 Month Conditioning">1 Month Conditioning (₹1,500)</option>
									<option value="3 Months Hypertrophy Tier">3 Months Hypertrophy Tier (₹3,800)</option>
									<option value="6 Months Elite Hypertrophy">6 Months Elite Hypertrophy (₹6,800)</option>
									<option value="1 Year Gold VIP Pass">1 Year Gold VIP Pass (₹11,500)</option>
								</select>
							</div>
						</>
					)}

					<div>
						<label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
							{authMode === 'owner-login' ? 'Owner Email' : 'Email Address'}
						</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={authMode === 'owner-login' ? 'owner@liaironclub.com' : 'athlete@gmail.com'}
							className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
							{authMode === 'owner-login' ? 'Owner Secret PIN / Password' : 'Password'}
						</label>
						<input
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder={authMode === 'owner-login' ? 'Enter owner PIN (e.g. 2026 or owner123)' : '••••••••'}
							className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-400/20 hover:brightness-110 transition-all disabled:opacity-50"
					>
						{loading
							? 'Authenticating...'
							: authMode === 'signup'
							? 'Create Athlete Account'
							: authMode === 'owner-login'
							? 'Unlock Owner Portal 👑'
							: 'Sign In to Member Pass'}
					</button>
				</form>

				{/* 1-Click Demo Fast-Testing Switchers */}
				<div className="mt-6 border-t border-white/10 pt-5">
					<div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2.5 text-center">
						⚡ 1-Click Demo Testing Mode
					</div>
					<div className="grid grid-cols-2 gap-2">
						<button
							type="button"
							onClick={() => handleQuickDemo('owner')}
							className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-2 text-left hover:bg-amber-400/20 transition-all"
						>
							<div className="text-[11px] font-bold text-amber-300">👑 Test as Owner</div>
							<div className="text-[9px] text-white/50">Full Admin & Revenue Desk</div>
						</button>
						<button
							type="button"
							onClick={() => handleQuickDemo('member')}
							className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-2 text-left hover:bg-emerald-400/20 transition-all"
						>
							<div className="text-[11px] font-bold text-emerald-300">⚡ Test as Member</div>
							<div className="text-[9px] text-white/50">Rahul V. (Athlete Pass)</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
