import HeaderNav from '@/components/HeaderNav'
import GymHubModals from '@/components/GymHubModals'
import MemberTrackerModal from '@/components/MemberTrackerModal'
import MobileStudioControls from '@/components/MobileStudioControls'
import PwaInstallPrompt from '@/components/PwaInstallPrompt'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Oswald, Bebas_Neue, Space_Grotesk, Cinzel } from 'next/font/google'
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
			className={`relative scroll-smooth bg-black text-white ${cera.variable} ${oswald.variable} ${bebas.variable} ${spaceGrotesk.variable} ${cinzel.variable}`}
		>
			<body
				className="~header-py-6/12"
				style={{ '--header-h': 'calc(var(--header-py) * 2 + 1.375rem)' }}
			>
				<Guides />
				<header className="fixed top-0 z-10 w-full py-[--header-py]">
					<div className="container flex items-center justify-between gap-4">
						<div className="flex items-center gap-2.5">
							<span className="font-heading text-2xl font-black tracking-wider text-white">LIA</span>
							<span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-widest text-amber-400 uppercase">
								IRON CLUB
							</span>
						</div>
						<HeaderNav />
						<div className="flex items-center gap-1.5 justify-self-end sm:gap-2.5">
							<MemberTrackerModal />
							<MobileStudioControls />
						</div>
					</div>
				</header>
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
