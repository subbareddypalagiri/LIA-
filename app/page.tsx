'use client'

import useScrubber from '@/hooks/useScrubber'
import './page.css'
import {
	useScroll,
	motion,
	useTransform,
	useAnimate,
	stagger,
	scrollInfo,
	useSpring
} from 'framer-motion'
import {
	type Ref,
	type JSX,
	createRef,
	useRef,
	type ReactNode,
	Suspense,
	useLayoutEffect,
	useImperativeHandle
} from 'react'
import * as TOC from '@/components/TOC'
import clsx from 'clsx'
import SplitText from '@/components/SplitText'
import Scene from './Scene'
import type { Vector3Tuple } from 'three'
import { sharedInView, transformVector3, useMotionVector3, useVector3Spring } from '@/utils/motion'
import { useControls } from 'leva'
import { screens } from '@/theme'
import { useMedia } from 'react-use'

const SPRING = {
	stiffness: 100,
	damping: 40,
	mass: 1
}

const cameraPositions: Array<Vector3Tuple> = [
	[0, 0, 20],
	[20, 0, 0],
	[0, 5, 15],
	[21.775, -4.44, 18.33],
	[8.36, 4.93, 10]
]
const cameraLookAts: Array<Vector3Tuple> = [
	[-0.15, 0, 0],
	[0, 0, 1.25],
	[-0.5, -0.7, -2],
	[-2.35, -0.5, 0],
	[-0.25, -0.1, 0]
]
const narrowCameraLookAts: Array<Vector3Tuple> = [
	[-0.15, 0, 0],
	[0, -0.1, 0.125],
	[-0.2, -0.7, -2],
	[0, -0.75, 0],
	[-0.25, -0.1, 0]
]
const floatIntensities: Array<Vector3Tuple> = [
	[1, 0, 0],
	[0, 0, 1],
	[0.5, 0, 0],
	[1, 0, 0],
	[0.75, 0, 0]
]

const ZERO: Vector3Tuple = [0, 0, 0]

const narrowQuery = `not (min-width: ${screens['guides-4']})`
const narrow: Pick<MediaQueryList, 'matches'> =
	typeof window === 'undefined' ? { matches: false } : window.matchMedia(narrowQuery)

export default function Home() {
	// We need this to be an array of refs, so we can pass the inner refs to <TOC.Item>
	const sectionRefs = useRef(
		Array(5)
			.fill(null)
			.map(() => createRef<HTMLElement>())
	)

	const spring = SPRING
	// const spring = useControls(SPRING)

	const cameraPosition = useMotionVector3(cameraPositions[0])
	const smoothedCameraPosition = useVector3Spring(cameraPosition, spring)
	const cameraLookAt = useMotionVector3(cameraLookAts[0])
	const smoothedCameraLookAt = useVector3Spring(cameraLookAt, spring)
	const floatIntensity = useMotionVector3(floatIntensities[0])
	const smoothedFloatIntensity = useVector3Spring(floatIntensity, spring)

	const makeOnScrollProgress = (curr: number) => {
		const prev = Math.max(curr - 1, 0)

		const [posX, posY, posZ] = transformVector3(
			[0, 1],
			[cameraPositions[prev], cameraPositions[curr]]
		)
		const [lookX, lookY, lookZ] = transformVector3(
			[0, 1],
			[cameraLookAts[prev], cameraLookAts[curr]]
		)
		const [narrowLookX, narrowLookY, narrowLookZ] = transformVector3(
			[0, 1],
			[narrowCameraLookAts[prev], narrowCameraLookAts[curr]]
		)
		const [floatX, floatY, floatZ] = transformVector3(
			[0, 0.1, 0.9, 1], // stop float mid-transition
			[floatIntensities[prev], ZERO, ZERO, floatIntensities[curr]]
		)
		return (progress: number) => {
			const isNarrow = narrow.matches

			cameraPosition.set(posX(progress), posY(progress), posZ(progress))
			cameraLookAt.set(
				(isNarrow ? narrowLookX : lookX)(progress),
				(isNarrow ? narrowLookY : lookY)(progress),
				(isNarrow ? narrowLookZ : lookZ)(progress)
			)
			floatIntensity.set(floatX(progress), floatY(progress), floatZ(progress))
		}
	}

	return (
		<>
			<Suspense fallback={null}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.75 }}
				>
					<Scene
						cameraLookAt={smoothedCameraLookAt}
						cameraPosition={smoothedCameraPosition}
						floatIntensity={smoothedFloatIntensity}
						className="!fixed !inset-0"
					/>
				</motion.div>
			</Suspense>

			<BottomAlignedSection
				title="LIA Iron Sanctum"
				TitleTag="h1"
				ref={sectionRefs.current[0]}
				onScrollProgress={makeOnScrollProgress(0)}
			>
				Where unwavering discipline meets human biomechanics. Sculpt your legacy with cutting-edge
				training protocols, obsidian-grade heavy iron, and evidence-based progressive overload designed
				for peak athletic hypertrophy.
			</BottomAlignedSection>
			<LeftAlignedSection
				id="hypertrophy-protocol"
				ref={sectionRefs.current[1]}
				onScrollProgress={makeOnScrollProgress(1)}
				items={[
					{
						title: 'Progressive Mechanical Tension',
						content: (
							<>
								Hypertrophy is forged through systematic micro-progressions. Our training regimens
								maximize motor unit recruitment across exact joint force vectors for uncompromising
								muscle fiber stimulation.
							</>
						)
					},
					{
						title: 'Stage-Ready Conditioning',
						content: (
							<>
								Balancing raw dense mass with razor-sharp conditioning. Periodized nutrition,
								metabolic conditioning, and real-time biometric tracking engineered to reveal deep
								muscular striations.
							</>
						)
					},
					{
						title: 'Iron Brotherhood',
						content: (
							<>
								A sacred iron cathedral reserved exclusively for serious lifters, competitors, and
								athletes committed to relentless physical and mental mastery.
							</>
						)
					}
				]}
			/>
			<BottomAlignedSection2
				title="Biomechanical Precision & Heavy Iron"
				id="biomechanical-precision"
				ref={sectionRefs.current[2]}
				onScrollProgress={makeOnScrollProgress(2)}
				content1={
					<>
						Every dumbbell, olympic barbell, and plate-loaded machine is engineered to eliminate joint
						shearing forces, locking your muscles into optimal resistance curves throughout the full
						range of motion.
					</>
				}
				content2={
					<>
						Targeted resistance profiles ensure relentless mechanical tension from explosive concentric
						contractions to deep, controlled eccentric stretches.
					</>
				}
			/>
			<LeftAlignedSection
				id="anatomy-of-champions"
				ref={sectionRefs.current[3]}
				onScrollProgress={makeOnScrollProgress(3)}
				items={[
					{
						title: 'Structural Symmetry & Proportions',
						content: (
							<>
								Sculpting the classic Golden Era aesthetic: broad 3D deltoids, sweeping lat spreads,
								and razor-carved quadriceps anchored by a disciplined, vacuum-tight waistline.
							</>
						)
					},
					{
						title: 'Neuromuscular Mind-Muscle Link',
						content: (
							<>
								True muscular development begins in the central nervous system. Every repetition is
								executed with supreme cadence, controlled tempo, and deep cognitive muscle activation.
							</>
						)
					}
				]}
			/>
			<BottomAlignedSectionWithIntro
				title="The Obsidian Standard"
				id="the-obsidian-standard"
				ref={sectionRefs.current[4]}
				onScrollProgress={makeOnScrollProgress(4)}
			>
				LIA is more than a gym — it is an iron sanctuary where sweat turns into timeless art. Step onto
				the platform, claim your discipline, and transform your body into an enduring monument of
				strength and power.
			</BottomAlignedSectionWithIntro>
		</>
	)
}

type BottomAlignedSectionProps = SectionProps & {
	title: string
	TitleTag?: 'h1' | 'h2'
}

function BottomAlignedSection({
	title,
	TitleTag = 'h2',
	className,
	children,
	...props
}: BottomAlignedSectionProps) {
	const innerRef = useRef<HTMLDivElement>(null)

	const { scrollYProgress } = useScroll({
		target: innerRef,
		offset: ['end 55%', 'end 35%']
	})
	const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

	return (
		<Section className={clsx('content-end', className)} {...props}>
			<motion.div style={{ opacity }} ref={innerRef} className="grid-guides grid gap-4">
				<TitleTag className="col-span-2 font-heading uppercase tracking-wide font-black ~text-5xl/8xl guides-4:col-span-2 guides-4:col-start-2 guides-5:col-span-3 guides-5:justify-self-end guides-5:text-right guides-5:~guides-5:~max-w-[20rem]/[28.75rem]">
					{title}
				</TitleTag>
				<p className="col-span-2 max-w-prose justify-self-center text-sm text-white/70 guides-4:col-span-2 guides-4:col-start-2 guides-5:col-span-2 guides-5:~lg:~mt-8/16 guides-5:~lg:~p-4/8 guides-5:lg:col-span-1">
					{children}
				</p>
			</motion.div>
		</Section>
	)
}

function BottomAlignedSectionWithIntro({
	title,
	TitleTag = 'h2',
	className,
	children,
	...props
}: BottomAlignedSectionProps) {
	const [scope, animate] = useAnimate<HTMLDivElement>()

	const characterRefs = useRef<Array<HTMLSpanElement | null>>([])
	const contentRef = useRef<HTMLParagraphElement>(null)

	// Entrance animations
	const { scrollYProgress: _inProgress } = useScroll({
		target: scope,
		offset: ['start end', 'end end']
	})
	const spring = SPRING
	// const spring = useControls(SPRING)
	const inProgress = useSpring(_inProgress, spring)
	useScrubber(
		() =>
			animate([
				[
					characterRefs.current.filter(Boolean),
					{ opacity: [0, 1], y: ['25%', '0'] },
					{ duration: 0.35, delay: stagger(0.035, { startDelay: 0.35 }) }
				],
				[contentRef.current!, { opacity: [0, 1], y: ['75%', '0'] }, { duration: 0.75, at: '-1' }]
			]),
		inProgress,
		{
			once: process.env.NODE_ENV !== 'development'
		}
	)

	const { scrollYProgress: outProgress } = useScroll({
		target: scope,
		offset: ['end 55%', 'end 35%']
	})
	const opacity = useTransform(outProgress, [0, 1], [1, 0])

	return (
		<Section className={clsx('content-end', className)} {...props}>
			<motion.div
				style={{ opacity }}
				ref={scope}
				// TODO: generalize this for any section:
				className="grid-guides mb-[calc(100vh-100svh)] grid gap-4" // env(safe-area-inset-bottom) didn't work for some reason
			>
				<TitleTag className="col-span-2 font-heading uppercase tracking-wide font-black ~text-5xl/8xl guides-4:col-span-2 guides-4:col-start-2 guides-5:col-span-3 guides-5:justify-self-end guides-5:text-right guides-5:~guides-5:~max-w-[20rem]/[28.75rem]">
					<SplitText
						characterRef={(el, index) => {
							characterRefs.current[index] = el
						}}
					>
						{title}
					</SplitText>
				</TitleTag>
				<p
					ref={contentRef}
					className="col-span-2 max-w-prose justify-self-center text-sm text-white/70 guides-4:col-span-2 guides-4:col-start-2 guides-5:col-span-2 guides-5:~lg:~mt-8/16 guides-5:~lg:~p-4/8 guides-5:lg:col-span-1"
				>
					{children}
				</p>
			</motion.div>
		</Section>
	)
}

type LeftAlignedSectionProps = Omit<SectionProps, 'children'> & {
	items: {
		title: string
		content: ReactNode
	}[]
}
function LeftAlignedSection({ items, ...props }: LeftAlignedSectionProps) {
	const [scope, animate] = useAnimate<HTMLDivElement>()

	const divRefs = useRef(Array<HTMLDivElement | null>(items.length))
	const characterRefs = useRef(
		Array(items.length)
			.fill(null)
			.map(() => Array<HTMLSpanElement | null>())
	)
	const contentRefs = useRef(Array<HTMLElement | null>(items.length))

	// Entrance animations
	const isNarrow = useMedia(narrowQuery)
	const spring = SPRING
	// const spring = useControls(SPRING)
	const { scrollYProgress: _inProgress } = useScroll({
		target: scope,
		offset: isNarrow ? ['start end', 'end end'] : ['start 80%', 'center 55%'] // 55% = compensate for the header
	})
	const inProgress = useSpring(_inProgress, spring)
	useScrubber(
		() =>
			animate(
				items.flatMap((_, i) => [
					[
						characterRefs.current[i].filter(Boolean),
						{ opacity: [0, 1], y: ['25%', '0'] },
						{ duration: 0.35, delay: stagger(0.035), at: i * 0.25 }
					],
					[
						contentRefs.current[i]!,
						{ opacity: [0, 1], y: ['75%', '0'] },
						{ duration: 0.65, delay: 0.15, at: i * 0.15, ease: 'easeOut' }
					]
				])
			),
		inProgress,
		{
			once: process.env.NODE_ENV !== 'development'
		}
	)

	// Exit animations
	const { scrollYProgress: outProgress } = useScroll({
		target: scope,
		offset: ['center', 'end start']
	})
	useScrubber(
		() =>
			// Framer Motion doesn't compute the right duration unless it's in a sequence:
			animate([
				[
					divRefs.current.filter(Boolean),
					{ opacity: [1, 0] },
					{ delay: stagger(0.15, { startDelay: 0.05, ease: 'easeIn' }), duration: 0.5 }
				]
			]),
		outProgress
	)

	return (
		<Section
			{...props}
			className="grid-guides grid content-end items-center gap-4 guides-4:content-center"
		>
			<div ref={scope} className="col-span-2 guides-4:col-start-2">
				<dl className="~space-y-6/12">
					{items.map(({ title, content }, i) => (
						<div
							ref={(el) => {
								divRefs.current[i] = el
							}}
							key={title}
							className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:border-amber-400/40 hover:bg-white/[0.06]"
						>
							<div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-amber-400">
								<span className="rounded bg-amber-400/10 px-1.5 py-0.5">0{i + 1}</span>
								<span className="text-white/20">//</span>
								<span className="text-[10px] uppercase tracking-widest text-white/50">PROTOCOL</span>
							</div>
							<dt className="font-heading uppercase tracking-wide ~text-2xl/4xl font-extrabold text-white">
								<SplitText
									characterRef={(el, index) => {
										characterRefs.current[i][index] = el
									}}
								>
									{title}
								</SplitText>
							</dt>
							<dd
								ref={(el) => {
									contentRefs.current[i] = el
								}}
								className="mt-3 max-w-prose text-xs leading-relaxed text-white/70"
							>
								{content}
							</dd>
						</div>
					))}
				</dl>
			</div>
		</Section>
	)
}

type BottomAlignedSection2Props = Omit<SectionProps, 'ref' | 'children'> & {
	title: string
	ref: Ref<HTMLElement>
	content1: ReactNode
	content2?: ReactNode
}
function BottomAlignedSection2({
	title,
	content1,
	content2,
	...props
}: BottomAlignedSection2Props) {
	const [scope, animate] = useAnimate<HTMLDivElement>()

	const titleWrapperRef = useRef<HTMLDivElement>(null)
	const characterRefs = useRef<Array<HTMLSpanElement | null>>([])
	const content1WrapperRef = useRef<HTMLDivElement>(null)
	const content1Ref = useRef<HTMLParagraphElement>(null)
	const content2WrapperRef = useRef<HTMLDivElement>(null)
	const content2Ref = useRef<HTMLParagraphElement>(null)

	// Entrance animations
	const { scrollYProgress: _inProgress } = useScroll({
		target: scope,
		offset: ['start end', 'end end']
	})
	const spring = SPRING
	// const spring = useControls(SPRING)
	const inProgress = useSpring(_inProgress, spring)
	useScrubber(
		() =>
			animate([
				[
					characterRefs.current.filter(Boolean),
					{ opacity: [0, 1], y: ['25%', '0'] },
					{ duration: 0.35, delay: stagger(0.035, { startDelay: 0.35 }) }
				],
				[content2Ref.current!, { opacity: [0, 1], y: ['75%', '0'] }, { duration: 0.75, at: '-1' }]
			]),
		inProgress,
		{
			once: process.env.NODE_ENV !== 'development'
		}
	)

	// Exit animations
	const { scrollYProgress: outProgress } = useScroll({
		target: scope,
		offset: ['center', 'end start']
	})
	useScrubber(
		() =>
			// Framer Motion doesn't compute the right duration unless it's in a sequence:
			animate([
				[titleWrapperRef.current!, { opacity: [1, 0] }, { duration: 0.5 }],
				[
					[content1WrapperRef.current!, content2WrapperRef.current!],
					{ opacity: [1, 0] },
					{ duration: 0.5, at: 0.15 }
				]
			]),
		outProgress,
		{}
	)

	return (
		<Section {...props} className="content-end">
			<div ref={scope} className="grid-guides grid gap-4">
				<div
					ref={titleWrapperRef}
					className="col-span-2 guides-4:col-start-2 guides-5:max-lg:col-span-3 guides-5:max-lg:col-start-2"
				>
					<h2 className="font-heading uppercase tracking-wide font-black ~text-4xl/7xl">
						<SplitText
							characterRef={(el, i) => {
								characterRefs.current[i] = el
							}}
						>
							{title}
						</SplitText>
					</h2>
				</div>
				<div
					ref={content1WrapperRef}
					className="guides-4:col-start-2 guides-4:row-start-2 guides-5:col-span-1 guides-5:max-lg:col-span-2 guides-5:max-lg:col-start-2 guides-5:lg:col-start-4"
				>
					<p ref={content1Ref} className="max-w-prose text-xs text-white/70">
						{content1}
					</p>
				</div>
				<div
					ref={content2WrapperRef}
					className="guides-4:col-start-3 guides-4:row-start-2 guides-5:col-span-1 guides-5:max-lg:col-span-2 guides-5:max-lg:col-start-4 guides-5:lg:col-start-5"
				>
					<p ref={content2Ref} className="max-w-prose text-xs text-white/70">
						{content2}
					</p>
				</div>
			</div>
		</Section>
	)
}

type SectionProps = JSX.IntrinsicElements['section'] & {
	ref?: Ref<HTMLElement>
	onScrollProgress?: (progress: number) => void
}

function Section({ children, ref, onScrollProgress, className, ...props }: SectionProps) {
	const innerRef = useRef<HTMLElement>(null)
	useImperativeHandle(ref, () => innerRef.current!, [])

	// const { control } = useControls({ control: false })

	// Track scroll progress while in view
	useLayoutEffect(() => {
		if (!onScrollProgress) return
		return sharedInView(
			innerRef.current!,
			() => {
				// Return a cleanup function that gets called when no longer in view
				return scrollInfo(({ y: { progress } }) => onScrollProgress(progress), {
					target: innerRef.current!,
					offset: ['start end', 'start start']
				})
			},
			{ rootMargin: '-100% 0px 0px 0px' } // small sliver at the bottom
		)
	}, [onScrollProgress])

	return (
		<section
			{...props}
			ref={innerRef}
			className={clsx(
				// control && 'pointer-events-none',
				'container min-h-safe-screen relative snap-start pt-[calc(var(--header-h)+var(--section-pt))] ~pb-8/16 ~section-pt-2/4',
				className
			)}
		>
			{children}
		</section>
	)
}
