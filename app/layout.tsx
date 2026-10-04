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
				<header className="fixed top-3.5 inset-x-0 z-40 mx-auto w-[95%] max-w-7xl transition-all duration-300">
					<div className="relative flex items-center justify-between gap-2 sm:gap-4 rounded-2xl lg:rounded-full border border-white/12 bg-neutral-950/80 px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl">
						{/* BRAND ANCHOR */}
						<div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
							<span className="relative flex size-2 shrink-0">
								<span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-60"></span>
								<span className="relative inline-flex size-2 rounded-full bg-amber-400"></span>
							</span>
							<a href="/" className="flex items-center gap-2 group cursor-pointer">
								<span className="font-heading text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent group-hover:to-amber-300 transition-colors">
									LIA
								</span>
								<span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold tracking-widest text-amber-300 uppercase shadow-sm">
									IRON CLUB
								</span>
							</a>
						</div>

						{/* CENTER NAVIGATION DOCK */}
						<HeaderNav />

						{/* RIGHT ACTION CLUSTER */}
						<div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
