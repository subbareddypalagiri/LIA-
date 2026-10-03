import * as Nav from '@/components/Nav'
import MemberTrackerModal from '@/components/MemberTrackerModal'
import MobileStudioControls from '@/components/MobileStudioControls'
import type { Metadata } from 'next'
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

export const metadata: Metadata = {
	title: {
		template: '%s | LIA Iron Club',
		default: 'LIA Iron Club | Elite Physique Sanctum'
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
						<Nav.Root className="hidden md:block">
							<Nav.Item active={true}>Sanctum</Nav.Item>
							<Nav.Item>Hypertrophy</Nav.Item>
							<Nav.Item>Biomechanics</Nav.Item>
							<Nav.Item>Anatomy</Nav.Item>
							<Nav.Item>Standard</Nav.Item>
						</Nav.Root>
						<div className="flex items-center gap-1.5 justify-self-end sm:gap-2.5">
							<MemberTrackerModal />
							<MobileStudioControls />
						</div>
					</div>
				</header>
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
