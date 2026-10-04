'use client'

import { useState, useRef, useEffect } from 'react'
import { useFontTheme, setFontTheme, FONT_OPTIONS } from '@/store/fontTheme'
import { useBgTheme, setBgTheme, BG_THEMES } from '@/store/bgTheme'
import { useLiaColor, setLiaColor } from '@/store/liaColor'
import { usePwa, promptInstall } from '@/store/pwaStore'

const PRESET_COLORS = [
	{ name: 'Gold', hex: '#ffe082' },
	{ name: 'White', hex: '#ffffff' },
	{ name: 'Amber', hex: '#ffb700' },
	{ name: 'Cyan', hex: '#00e5ff' },
	{ name: 'Red', hex: '#ff0055' },
	{ name: 'Green', hex: '#00ff66' },
	{ name: 'Purple', hex: '#b537f2' }
]

export default function DesktopStudioPopover() {
	const [isOpen, setIsOpen] = useState(false)
	const currentFont = useFontTheme()
	const currentTheme = useBgTheme()
	const activeColor = useLiaColor()
	const popoverRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div ref={popoverRef} className="relative">
			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
				className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-xl transition-all duration-200 cursor-pointer ${
					isOpen
						? 'border-amber-400/60 bg-amber-500/15 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
						: 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/25 hover:bg-white/10 hover:text-white'
				}`}
				title="Open 3D Studio Customizer (Lighting, Fonts, Ambience)"
			>
				{/* Glowing Color Dot */}
				<span
					className="size-2 rounded-full transition-transform group-hover:scale-125"
					style={{
						backgroundColor: activeColor,
						boxShadow: `0 0 10px ${activeColor}`
					}}
				/>
				<span className="font-semibold">Studio</span>
				<span className="hidden xl:inline text-[10px] text-neutral-400 font-normal">
					{currentFont.name.split(' ')[0]}
				</span>
				<svg
					className={`size-3 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : 'group-hover:text-white'}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{/* Bento Glass Popover */}
			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-3 w-84 overflow-hidden rounded-2xl border border-white/15 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-3 duration-200">
					{/* Header */}
					<div className="flex items-center justify-between pb-3 border-b border-white/10">
						<div className="flex items-center gap-2">
							<span className="flex size-5 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold">
								✦
							</span>
							<div>
								<h4 className="text-xs font-bold uppercase tracking-wider text-white">3D Studio Controls</h4>
								<p className="text-[10px] text-neutral-400">Atmosphere, lighting & type</p>
							</div>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
						>
							<svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="space-y-4 pt-3.5">
						{/* 1. Model Neon / Gold Accent Lighting */}
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
									3D Accent Lighting
								</span>
								<span className="text-[10px] font-mono text-amber-400 uppercase">{activeColor}</span>
							</div>
							<div className="flex items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-2">
								{PRESET_COLORS.map(({ name, hex }) => {
									const isActive = activeColor.toLowerCase() === hex.toLowerCase()
									return (
										<button
											key={hex}
											title={name}
											onClick={() => setLiaColor(hex)}
											className={`relative size-5 rounded-full transition-all cursor-pointer ${
												isActive
													? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black'
													: 'opacity-70 hover:opacity-100 hover:scale-110'
											}`}
											style={{
												backgroundColor: hex,
												boxShadow: isActive ? `0 0 12px ${hex}` : 'none'
											}}
										/>
									)
								})}
								<label
									title="Custom Hex Color"
									className="relative flex size-5 cursor-pointer items-center justify-center rounded-full border border-dashed border-white/40 text-[9px] text-white/70 hover:border-white transition-colors"
								>
									+
									<input
										type="color"
										value={activeColor}
										onChange={(e) => setLiaColor(e.target.value)}
										className="absolute inset-0 size-full cursor-pointer opacity-0"
									/>
								</label>
							</div>
						</div>

						{/* 2. Typography Styles */}
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
									Typography Style
								</span>
								<span className="text-[10px] text-neutral-400">{currentFont.category}</span>
							</div>
							<div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
								{FONT_OPTIONS.map((font) => {
									const isActive = currentFont.id === font.id
									return (
										<button
											key={font.id}
											onClick={() => setFontTheme(font.id)}
											className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
												isActive
													? 'border border-amber-500/40 bg-amber-500/15 font-semibold text-amber-300'
													: 'border border-transparent bg-white/[0.02] text-neutral-300 hover:bg-white/10 hover:text-white'
											}`}
										>
											<span className="truncate font-medium">{font.name}</span>
											<span className="text-[10px] opacity-75">{font.badge}</span>
										</button>
									)
								})}
							</div>
						</div>

						{/* 3. Atmosphere & Themes */}
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
									Sanctum Ambience
								</span>
								<span className="text-[10px] text-neutral-400 truncate max-w-[120px]">{currentTheme.name}</span>
							</div>
							<div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
								{BG_THEMES.map((theme) => {
									const isActive = currentTheme.id === theme.id
									return (
										<button
											key={theme.id}
											onClick={() => setBgTheme(theme.id)}
											className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-left text-[11px] transition-colors cursor-pointer ${
												isActive
													? 'border border-amber-500/40 bg-amber-500/15 font-semibold text-amber-300'
													: 'border border-transparent bg-white/[0.02] text-neutral-300 hover:bg-white/10 hover:text-white'
											}`}
										>
											<span
												className="size-2.5 rounded-full shrink-0 border border-white/25"
												style={{ background: theme.badge || theme.bodyBg }}
											/>
											<span className="truncate">{theme.name}</span>
										</button>
									)
								})}
							</div>
						</div>

						{/* 4. Native App Installation */}
						<div className="pt-2 border-t border-white/10">
							<div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-2.5">
								<div className="flex items-center gap-2">
									<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
										<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
											<path d="M12 2v8m0 0 3-3m-3 3-3-3M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
										</svg>
									</div>
									<div>
										<p className="text-[11px] font-bold text-white uppercase tracking-wider">LIA Mobile App</p>
										<p className="text-[9px] text-neutral-400">1-Tap pass & offline access</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => {
										promptInstall()
										setIsOpen(false)
									}}
									className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1.5 text-[10px] font-bold text-black shadow-sm shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all cursor-pointer"
								>
									<span>Install</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
