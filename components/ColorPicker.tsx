'use client'

import { useLiaColor, setLiaColor } from '@/store/liaColor'

const PRESET_COLORS = [
	{ name: 'Gold', hex: '#ffe082' },
	{ name: 'White', hex: '#ffffff' },
	{ name: 'Amber', hex: '#ffb700' },
	{ name: 'Cyan', hex: '#00e5ff' },
	{ name: 'Red', hex: '#ff0055' },
	{ name: 'Green', hex: '#00ff66' },
	{ name: 'Purple', hex: '#b537f2' }
]

export default function ColorPicker() {
	const activeColor = useLiaColor()

	return (
		<div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 backdrop-blur-md transition-all hover:border-white/30">
			<span className="hidden text-[10px] font-medium tracking-widest text-white/60 uppercase sm:inline-block">
				LIA
			</span>

			<div className="flex items-center gap-1.5">
				{PRESET_COLORS.map(({ name, hex }) => {
					const isActive = activeColor.toLowerCase() === hex.toLowerCase()
					return (
						<button
							key={hex}
							title={name}
							onClick={() => setLiaColor(hex)}
							className={`relative size-3.5 rounded-full transition-transform hover:scale-125 focus:outline-none ${
								isActive ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-black' : 'opacity-80 hover:opacity-100'
							}`}
							style={{
								backgroundColor: hex,
								boxShadow: isActive ? `0 0 10px ${hex}` : 'none'
							}}
						/>
					)
				})}

				{/* Custom Color Input */}
				<label
					title="Custom Color"
					className="relative ml-0.5 flex size-3.5 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-gradient-to-tr from-pink-500 via-yellow-400 to-cyan-400 transition-transform hover:scale-125"
				>
					<input
						type="color"
						value={activeColor}
						onChange={(e) => setLiaColor(e.target.value)}
						className="absolute inset-0 size-full cursor-pointer opacity-0"
					/>
				</label>
			</div>
		</div>
	)
}
