'use client'

import { useState, useRef, useEffect } from 'react'
import { useFontTheme, setFontTheme, FONT_OPTIONS } from '@/store/fontTheme'

export default function FontPicker() {
	const currentFont = useFontTheme()
	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

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
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[10px] font-medium tracking-wider text-white/70 uppercase backdrop-blur-md transition-all hover:border-white/30 hover:text-white"
				title="Change Typography Style"
			>
				<span>Aa</span>
				<span className="hidden text-white/40 sm:inline">|</span>
				<span className="hidden max-w-[70px] truncate text-white/90 sm:inline">
					{currentFont.name.split(' ')[0]}
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

			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/20 bg-neutral-950/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
					<div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
						Typography Style
					</div>
					<div className="space-y-1">
						{FONT_OPTIONS.map((font) => {
							const isActive = currentFont.id === font.id
							return (
								<button
									key={font.id}
									onClick={() => {
										setFontTheme(font.id)
										setIsOpen(false)
									}}
									className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
										isActive
											? 'bg-white/15 font-semibold text-white'
											: 'text-white/70 hover:bg-white/10 hover:text-white'
									}`}
								>
									<div className="min-w-0 flex-1">
										<div className="truncate font-medium text-white">{font.name}</div>
										<div className="truncate text-[10px] text-white/50">{font.category}</div>
									</div>
									<span className="shrink-0 text-xs">{font.badge}</span>
								</button>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}
