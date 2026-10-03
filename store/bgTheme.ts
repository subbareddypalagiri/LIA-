'use client'
'use no memo'

import { useEffect, useState } from 'react'
import { setLiaColor } from './liaColor'

export interface BgTheme {
	id: string
	name: string
	description: string
	badge: string
	bodyBg: string
	suggestedLiaColor: string
	rimColor: string
	vignetteDarkness: number
	gradientCenter: [number, number]
	radius: number
	stops: number[]
	colors: string[]
}

const STOPS_13 = [0, 0.1, 0.1907, 0.2744, 0.3526, 0.4272, 0.5, 0.5728, 0.6474, 0.7256, 0.8093, 0.9001, 1]

export const BG_THEMES: BgTheme[] = [
	{
		id: 'obsidian',
		name: 'Obsidian Noir',
		description: 'Minimalist haute couture — pure charcoal carbon with diamond white glow',
		badge: 'linear-gradient(135deg, #3a3b3d, #050505)',
		bodyBg: '#050505',
		suggestedLiaColor: '#ffffff',
		rimColor: '#ffffff',
		vignetteDarkness: 0.75,
		gradientCenter: [814, 400],
		radius: 614,
		stops: STOPS_13,
		colors: [
			'#1f2022',
			'#1f2022',
			'#1e1f21',
			'#1d1d1f',
			'#1b1c1d',
			'#19191b',
			'#161718',
			'#131415',
			'#101112',
			'#0d0d0e',
			'#0a0a0a',
			'#070707',
			'#050505'
		]
	},
	{
		id: 'maroon-green',
		name: 'Maroon & Emerald',
		description: 'Chromatic tension — deep velvet plum maroon with electric neon emerald',
		badge: 'linear-gradient(135deg, #701a35, #00ff7f, #020a06)',
		bodyBg: '#020a06',
		suggestedLiaColor: '#00ff7f',
		rimColor: '#00ff7f',
		vignetteDarkness: 0.45,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#661833',
			'#521328',
			'#3d0e1e',
			'#2b0b16',
			'#1d0c15',
			'#130f17',
			'#0d1416',
			'#081a14',
			'#051b13',
			'#04160f',
			'#03120c',
			'#030f0a',
			'#020a06'
		]
	},
	{
		id: 'imperial-gold',
		name: 'Imperial 24K Gold',
		description: 'Haute horlogerie — deep caviar bronze noir with liquid champagne gold',
		badge: 'linear-gradient(135deg, #ffe082, #a87d1c, #030200)',
		bodyBg: '#030200',
		suggestedLiaColor: '#ffe082',
		rimColor: '#ffb300',
		vignetteDarkness: 0.55,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#3d2b08',
			'#332306',
			'#291c04',
			'#211603',
			'#1a1102',
			'#140d02',
			'#0f0a01',
			'#0c0801',
			'#0a0601',
			'#080501',
			'#060401',
			'#050300',
			'#030200'
		]
	},
	{
		id: 'crimson-eclipse',
		name: 'Crimson Eclipse',
		description: 'Dramatic cinema — nocturnal bordeaux velvet with stark platinum & crimson rim',
		badge: 'linear-gradient(135deg, #ffffff, #d90429, #020000)',
		bodyBg: '#020000',
		suggestedLiaColor: '#ffffff',
		rimColor: '#ff1744',
		vignetteDarkness: 0.55,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#470412',
			'#3b030e',
			'#2e020a',
			'#240107',
			'#1b0105',
			'#140004',
			'#0f0003',
			'#0c0002',
			'#0a0002',
			'#080002',
			'#060001',
			'#040001',
			'#020000'
		]
	},
	{
		id: 'midnight-sapphire',
		name: 'Midnight Sapphire',
		description: 'Cyber oceanic abyss — midnight indigo depths with electric cyber cyan',
		badge: 'linear-gradient(135deg, #00f0ff, #0a3069, #000103)',
		bodyBg: '#000103',
		suggestedLiaColor: '#00f0ff',
		rimColor: '#00b4d8',
		vignetteDarkness: 0.55,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#0c234a',
			'#0a1c3d',
			'#081731',
			'#061226',
			'#050d1c',
			'#040914',
			'#03070f',
			'#02050b',
			'#020409',
			'#010307',
			'#010205',
			'#010204',
			'#000103'
		]
	},
	{
		id: 'cyber-amethyst',
		name: 'Cyber Amethyst',
		description: 'Synthwave luxury — void twilight obsidian with hyper-violet neon aura',
		badge: 'linear-gradient(135deg, #e879f9, #4a0e69, #010002)',
		bodyBg: '#010002',
		suggestedLiaColor: '#e879f9',
		rimColor: '#c026d3',
		vignetteDarkness: 0.55,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#2d0b40',
			'#240833',
			'#1c0627',
			'#15041e',
			'#100316',
			'#0c0211',
			'#09010d',
			'#07010a',
			'#050108',
			'#040006',
			'#030004',
			'#020003',
			'#010002'
		]
	},
	{
		id: 'solar-flare',
		name: 'Solar Flare',
		description: 'Supercar forge — charred volcanic ember with liquid blaze amber & fiery rim',
		badge: 'linear-gradient(135deg, #ff7700, #802b00, #030000)',
		bodyBg: '#030000',
		suggestedLiaColor: '#ff7700',
		rimColor: '#ff4500',
		vignetteDarkness: 0.55,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#451403',
			'#381002',
			'#2c0c02',
			'#220901',
			'#1a0701',
			'#140501',
			'#100400',
			'#0c0300',
			'#0a0200',
			'#080200',
			'#060100',
			'#050100',
			'#030000'
		]
	},
	{
		id: 'glacial-arctic',
		name: 'Glacial Arctic',
		description: 'Cryogenic luxury — sub-zero polar abyss with pure frost & ice blue rim',
		badge: 'linear-gradient(135deg, #e0f7fa, #0284c7, #000102)',
		bodyBg: '#000102',
		suggestedLiaColor: '#e0f7fa',
		rimColor: '#38bdf8',
		vignetteDarkness: 0.55,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#07232e',
			'#051b24',
			'#04151c',
			'#031016',
			'#020c11',
			'#02090d',
			'#01070a',
			'#010508',
			'#010406',
			'#010305',
			'#010204',
			'#000203',
			'#000102'
		]
	},
	{
		id: 'tokyo-sakura',
		name: 'Tokyo Sakura',
		description: 'Neo-Tokyo runway — nocturnal sumi ink with electric cyber pink neon',
		badge: 'linear-gradient(135deg, #ff1493, #6b0537, #020001)',
		bodyBg: '#020001',
		suggestedLiaColor: '#ff1493',
		rimColor: '#ff007f',
		vignetteDarkness: 0.55,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#3d0725',
			'#32051e',
			'#270417',
			'#1e0312',
			'#17020d',
			'#110109',
			'#0d0107',
			'#0a0105',
			'#070004',
			'#050003',
			'#040002',
			'#030001',
			'#020001'
		]
	},
	{
		id: 'dune-spice',
		name: 'Dune Spice',
		description: 'Arrakis aristocracy — nocturnal spice shadow with radiant solar sand gold',
		badge: 'linear-gradient(135deg, #ffaa00, #733c07, #020000)',
		bodyBg: '#020000',
		suggestedLiaColor: '#ffaa00',
		rimColor: '#f59e0b',
		vignetteDarkness: 0.55,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#381d06',
			'#2e1705',
			'#241204',
			'#1c0d03',
			'#150a02',
			'#100701',
			'#0c0501',
			'#090401',
			'#070300',
			'#050200',
			'#040100',
			'#030100',
			'#020000'
		]
	},
	{
		id: 'toxic-matrix',
		name: 'Toxic Matrix',
		description: 'Bio-tech noir — matte carbon void with piercing radioactive acid lime',
		badge: 'linear-gradient(135deg, #a6ff00, #3e6302, #000100)',
		bodyBg: '#000100',
		suggestedLiaColor: '#a6ff00',
		rimColor: '#76ff03',
		vignetteDarkness: 0.55,
		gradientCenter: [512, 460],
		radius: 880,
		stops: STOPS_13,
		colors: [
			'#1b3305',
			'#152804',
			'#101f03',
			'#0c1702',
			'#091101',
			'#060c01',
			'#050901',
			'#030600',
			'#020500',
			'#020300',
			'#010200',
			'#010100',
			'#000100'
		]
	}
]

const EVENT_NAME = 'bg-theme-change'
const themeStore = { current: BG_THEMES[0] }

function applyDomBackground(color: string) {
	if (typeof document !== 'undefined') {
		document.documentElement.style.backgroundColor = color
		document.body.style.backgroundColor = color
	}
}

export function setBgTheme(themeId: string, syncLia = true) {
	const found = BG_THEMES.find((t) => t.id === themeId)
	if (found) {
		themeStore.current = found
		applyDomBackground(found.bodyBg)
		if (syncLia && found.suggestedLiaColor) {
			setLiaColor(found.suggestedLiaColor)
		}
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent<BgTheme>(EVENT_NAME, { detail: found }))
		}
	}
}

export function useBgTheme(): BgTheme {
	const [theme, setTheme] = useState<BgTheme>(() => themeStore.current)

	useEffect(() => {
		applyDomBackground(theme.bodyBg)

		const handleThemeChange = (e: Event) => {
			const customEvent = e as CustomEvent<BgTheme>
			if (customEvent.detail) {
				setTheme(customEvent.detail)
				applyDomBackground(customEvent.detail.bodyBg)
			}
		}
		window.addEventListener(EVENT_NAME, handleThemeChange)
		return () => {
			window.removeEventListener(EVENT_NAME, handleThemeChange)
		}
	}, [theme.bodyBg])

	return theme
}
