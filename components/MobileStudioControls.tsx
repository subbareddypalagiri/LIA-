'use client'

import { useState } from 'react'
import FontPicker from './FontPicker'
import BgThemePicker from './BgThemePicker'
import ColorPicker from './ColorPicker'
import { FONT_OPTIONS, useFontTheme, setFontTheme, type FontOption } from '@/store/fontTheme'
import { BG_THEMES, useBgTheme, setBgTheme, type BgTheme } from '@/store/bgTheme'
import { useLiaColor, setLiaColor } from '@/store/liaColor'

const PRESET_COLORS = [
	{ name: 'White', hex: '#ffffff' },
	{ name: 'Gold', hex: '#ffb700' },
	{ name: 'Cyan', hex: '#00e5ff' },
	{ name: 'Red', hex: '#ff0055' },
	{ name: 'Green', hex: '#00ff66' },
	{ name: 'Purple', hex: '#b537f2' }
]

export default function MobileStudioControls() {
	const [isOpen, setIsOpen] = useState(false)
	const currentFont = useFontTheme()
	const currentTheme = useBgTheme()
	const currentColor = useLiaColor()

	return (
		<>
			{/* DESKTOP VIEW (>= 768px): Exact original horizontal controls untouched */}
			<div className="hidden md:flex items-center gap-2 sm:gap-2.5">
				<FontPicker />
				<BgThemePicker />
				<ColorPicker />
				<button className="cursor-not-allowed">
					<svg
						width="22"
						height="22"
						viewBox="0 0 22 22"
						fill="none"
						className="size-[1.375rem]"
						xmlns="http://www.w3.org/2000/svg"
					>
						<rect width="4" height="4" fill="#D9D9D9" />
						<rect x="9" width="4" height="4" fill="#D9D9D9" />
						<rect x="18" width="4" height="4" fill="#D9D9D9" />
						<rect y="9" width="4" height="4" fill="#D9D9D9" />
						<rect x="9" y="9" width="4" height="4" fill="#D9D9D9" />
						<rect x="18" y="9" width="4" height="4" fill="#D9D9D9" />
						<rect y="18" width="4" height="4" fill="#D9D9D9" />
						<rect x="9" y="18" width="4" height="4" fill="#D9D9D9" />
						<rect x="18" y="18" width="4" height="4" fill="#D9D9D9" />
					</svg>
				</button>
			</div>

			{/* MOBILE VIEW (< 768px): Compact Pill Trigger Button */}
			<div className="flex md:hidden items-center">
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/10 active:scale-95"
				>
					<svg
						className="size-3.5 text-amber-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
						/>
					</svg>
					<span>Studio</span>
				</button>
			</div>

			{/* MOBILE BOTTOM SHEET DRAWER */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
						onClick={() => setIsOpen(false)}
					/>

					{/* Drawer Card */}
					<div className="relative w-full max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-white/20 bg-neutral-950/98 p-5 pb-8 shadow-2xl backdrop-blur-2xl">
						{/* Pull handle */}
						<div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />

						{/* Header */}
						<div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
							<div className="flex items-center gap-2">
								<h3 className="font-heading text-lg font-bold tracking-wide uppercase text-white">
									Studio Customizer
								</h3>
								<span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 uppercase">
									Live 3D
								</span>
							</div>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="rounded-full border border-white/10 p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
							>
								<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Section 1: Typography */}
						<div className="mb-5">
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[11px] font-semibold tracking-wider uppercase text-white/50">
									Typography Style
								</span>
								<span className="text-xs font-bold text-amber-400">{currentFont.name}</span>
							</div>
							<div className="grid grid-cols-2 gap-2">
								{FONT_OPTIONS.map((font: FontOption) => (
									<button
										key={font.id}
										type="button"
										onClick={() => setFontTheme(font.id)}
										className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
											currentFont.id === font.id
												? 'border-amber-400 bg-amber-400/15 text-white'
												: 'border-white/10 bg-white/5 text-white/70 hover:border-white/25'
										}`}
									>
										<span className="text-sm font-bold text-white">{font.name}</span>
										<span className="text-[10px] text-white/50">{font.category}</span>
									</button>
								))}
							</div>
						</div>

						{/* Section 2: Lighting & BG Themes */}
						<div className="mb-5">
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[11px] font-semibold tracking-wider uppercase text-white/50">
									Lighting & Ambience ({BG_THEMES.length})
								</span>
								<span className="text-xs font-bold text-amber-400">{currentTheme.name}</span>
							</div>
							<div className="grid grid-cols-3 gap-2">
								{BG_THEMES.map((theme: BgTheme) => {
									const isSelected = currentTheme.id === theme.id
									return (
										<button
											key={theme.id}
											type="button"
											onClick={() => setBgTheme(theme.id)}
											className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all ${
												isSelected
													? 'border-amber-400 bg-amber-400/15 ring-1 ring-amber-400'
													: 'border-white/10 bg-white/5 hover:border-white/25'
											}`}
										>
											<div className="flex size-6 items-center justify-center rounded-full border border-white/20 p-0.5">
												<div
													className="size-full rounded-full"
													style={{
														background: `radial-gradient(circle, ${theme.colors[0]}, ${theme.colors[1]})`
													}}
												/>
											</div>
											<span className="line-clamp-1 text-[10px] font-medium text-white/80">
												{theme.name.split(' ')[0]}
											</span>
										</button>
									)
								})}
							</div>
						</div>

						{/* Section 3: 3D "LIA" Glow Color */}
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="text-[11px] font-semibold tracking-wider uppercase text-white/50">
									3D LIA Neon Accent
								</span>
								<span className="font-mono text-xs text-amber-400">{currentColor}</span>
							</div>
							<div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
								{PRESET_COLORS.map((color) => {
									const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase()
									return (
										<button
											key={color.name}
											type="button"
											onClick={() => setLiaColor(color.hex)}
											className={`size-7 rounded-full border-2 transition-all ${
												isSelected ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-80'
											}`}
											style={{ backgroundColor: color.hex }}
											title={color.name}
										/>
									)
								})}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
