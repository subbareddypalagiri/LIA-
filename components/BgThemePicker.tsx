'use client'

import { useState, useRef, useEffect } from 'react'
import { useBgTheme, setBgTheme, BG_THEMES } from '@/store/bgTheme'

export default function BgThemePicker() {
	const currentTheme = useBgTheme()
	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	// Close menu on click outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div ref={menuRef} className="relative">
			<div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 backdrop-blur-md transition-all hover:border-white/30">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-white/70 uppercase transition-colors hover:text-white"
					title="Click to view themes list"
				>
					<span>BG</span>
					<span className="hidden font-normal text-white/40 md:inline">|</span>
					<span className="hidden max-w-[80px] truncate text-white/90 lg:inline">
						{currentTheme.name}
					</span>
					<svg
						className={`size-2.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{/* Quick Swatches */}
				<div className="flex items-center gap-1 border-l border-white/10 pl-2">
					{BG_THEMES.map((theme) => {
						const isActive = currentTheme.id === theme.id
						return (
							<button
								key={theme.id}
								title={`${theme.name} — ${theme.description}`}
								onClick={() => setBgTheme(theme.id)}
								className={`relative size-3 rounded-full transition-transform hover:scale-125 focus:outline-none ${
									isActive
										? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-black'
										: 'opacity-70 hover:opacity-100'
								}`}
								style={{
									background: theme.badge,
									boxShadow: isActive ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none'
								}}
							/>
						)
					})}
				</div>
			</div>

			{/* Dropdown Menu */}
			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-2 max-h-[440px] w-72 overflow-y-auto rounded-2xl border border-white/20 bg-neutral-950/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
					<div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
						Background Atmosphere
					</div>
					<div className="space-y-1">
						{BG_THEMES.map((theme) => {
							const isActive = currentTheme.id === theme.id
							return (
								<button
									key={theme.id}
									onClick={() => {
										setBgTheme(theme.id)
										setIsOpen(false)
									}}
									className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
										isActive
											? 'bg-white/15 font-medium text-white'
											: 'text-white/70 hover:bg-white/10 hover:text-white'
									}`}
								>
									<span
										className={`size-4 shrink-0 rounded-full border border-white/20 shadow-sm ${
											isActive ? 'ring-2 ring-white ring-offset-1 ring-offset-neutral-950' : ''
										}`}
										style={{ background: theme.badge }}
									/>
									<div className="min-w-0 flex-1">
										<div className="truncate font-medium">{theme.name}</div>
										<div className="truncate text-[10px] text-white/50">{theme.description}</div>
									</div>
									{isActive && (
										<span className="shrink-0 text-white">
											<svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</span>
									)}
								</button>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}
