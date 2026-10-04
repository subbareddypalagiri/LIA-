import DynamicPillHeader from '@/components/DynamicPillHeader'
import GymHubModals from '@/components/GymHubModals'
import PwaInstallPrompt from '@/components/PwaInstallPrompt'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Oswald, Bebas_Neue, Space_Grotesk, Cinzel, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const cera = localFont({
	src: [
		{
			path: './fonts/Cera-Pro-Regular.woff2',
			weight: '400'
		},
		{
			path: './fonts/Cera-Pro-Medium.woff2',
			weight: '500'
		}
	],
	variable: '--font-cera'
})

const jakarta = Plus_Jakarta_Sans({
	subsets: ['latin'],
	variable: '--font-jakarta'
})

const oswald = Oswald({
	subsets: ['latin'],
	variable: '--font-oswald'
})

const bebas = Bebas_Neue({
	weight: '400',
	subsets: ['latin'],
	variable: '--font-bebas'
})

const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	variable: '--font-space'
})

const cinzel = Cinzel({
	subsets: ['latin'],
	variable: '--font-cinzel'
})

export const viewport: Viewport = {
	themeColor: '#0a0a0a',
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5
}

export const metadata: Metadata = {
	title: {
		template: '%s | LIA Iron Club',
		default: 'LIA Iron Club | Elite Physique Sanctum'
	},
	description: 'High-performance gym membership, athlete roster, UPI payments, hypertrophy nutrition, and owner desk.',
	manifest: '/manifest.json',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'LIA Iron Club'
	},
	icons: {
		icon: [
			{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ url: '/icons/icon.svg', type: 'image/svg+xml' }
		],
		apple: '/icons/apple-touch-icon.png'
	}
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			className={`relative scroll-smooth bg-black text-white ${cera.variable} ${jakarta.variable} ${oswald.variable} ${bebas.variable} ${spaceGrotesk.variable} ${cinzel.variable}`}
		>
			<body
				className="~header-py-6/12"
				style={{ '--header-h': 'calc(var(--header-py) * 2 + 1.375rem)' }}
			>
				<Guides />
				<DynamicPillHeader />
				<GymHubModals />
				<PwaInstallPrompt />
				{children}
			</body>
		</html>
	)
}

function Guides() {
	return (
		<div className="pointer-events-none fixed inset-0 z-50 size-full">
			<div className="grid-guides container relative grid h-full max-guides-4:~px-6/8">
				<div className="border-r border-white/10 max-guides-4:border-l"></div>
				<div className="border-r border-white/10"></div>
				<div className="border-r border-white/10 max-guides-4:hidden"></div>
				<div className="border-r border-white/10 max-guides-5:hidden"></div>
			</div>
		</div>
	)
}
