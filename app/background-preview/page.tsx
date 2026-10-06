'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { BG_THEMES, useBgTheme, setBgTheme, type BgTheme } from '@/store/bgTheme'
import { useLiaColor } from '@/store/liaColor'
import { useMotionVector3 } from '@/utils/motion'

// Dynamically import 3D Scene with SSR disabled
const Scene = dynamic(() => import('@/app/Scene'), { ssr: false })

export default function BackgroundPreviewPage() {
	const currentTheme = useBgTheme()
	const activeColor = useLiaColor()
	const [viewMode, setViewMode] = useState<'3d' | 'ambient'>('3d')
	const [copiedNotice, setCopiedNotice] = useState<string | null>(null)

	// Motion vectors for clean centered camera in 3D mode (matching hero state exactly)
	const cameraPosition = useMotionVector3([0, 0, 20])
	const cameraLookAt = useMotionVector3([-0.15, 0, 0])
	const floatIntensity = useMotionVector3([1, 0, 0])

	const showCopied = (msg: string) => {
		setCopiedNotice(msg)
		setTimeout(() => setCopiedNotice(null), 3000)
	}

	const copyTailwindCode = () => {
		const code = `<!-- Apple-Grade Luxury Ambient Radial Background -->
<div 
  class="relative min-h-screen w-full overflow-hidden bg-[${currentTheme.bodyBg}] flex items-center justify-center"
  style="background: radial-gradient(circle at 50% 40%, ${currentTheme.colors[0]} 0%, ${currentTheme.colors[4]} 35%, ${currentTheme.colors[8]} 65%, ${currentTheme.bodyBg} 100%);"
>
  <!-- Ambient Diffused Glow Core -->
  <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_35%,${activeColor}15,transparent_70%)]" />

  <!-- Vignette Perimeter Shadow -->
  <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.85)_100%)]" />

  <!-- Your Project Content Goes Here -->
  <div class="relative z-10 text-white">
    <!-- Content -->
  </div>
</div>`
		navigator.clipboard.writeText(code)
		showCopied('Copied Tailwind / CSS Code!')
	}

	const copyReactComponent = () => {
		const code = `'use client'

import React from 'react'

export function LuxuryAmbientBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor: '${currentTheme.bodyBg}',
        backgroundImage: 'radial-gradient(circle at 50% 38%, ${currentTheme.colors[0]} 0%, ${currentTheme.colors[4]} 35%, ${currentTheme.colors[8]} 65%, ${currentTheme.bodyBg} 100%)'
      }}
    >
      {/* 1. Atmospheric Diffused Glow */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 38%, ${activeColor}20 0%, transparent 70%)'
        }}
      />

      {/* 2. Haute-Couture Cinematic Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.88)_100%)]" />

      {/* 3. Children Container */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  )
}
`
		navigator.clipboard.writeText(code)
		showCopied('Copied Standalone React Component Code!')
	}

	const copyThreeJsSceneCode = () => {
		const code = `// npm install three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing
import { Canvas, useThree, extend } from '@react-three/fiber'
import { Text, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette, Noise } from '@react-three/postprocessing'
import { Suspense, useRef } from 'react'

export default function Luxury3DBackground({ title = "LIA" }: { title?: string }) {
  return (
    <div className="fixed inset-0 size-full bg-black">
      <Canvas camera={{ position: [0, 0, 20], fov: 8 }}>
        <pointLight position={[0, 0, -2]} intensity={2.5} color="#ffffff" />
        <ambientLight intensity={0.6} />

        <Suspense fallback={null}>
          {/* Glowing 3D Typography */}
          <group position={[0, 0.2, -2.5]}>
            <Text fontSize={2.5} letterSpacing={0.12} anchorX="center" anchorY="middle" color="#ffffff">
              {title}
              <meshStandardMaterial emissive="#ffffff" emissiveIntensity={3.5} toneMapped={false} />
            </Text>
          </group>

          {/* Centered 3D Model */}
          <Model position={[0, -0.2, 0]} scale={1.2} />
        </Suspense>

        {/* Postprocessing Bloom & Film Aesthetics */}
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0.7} />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
          <Noise opacity={0.03} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

function Model(props: any) {
  const { scene } = useGLTF('/bodybuilder.glb')
  return <primitive object={scene} {...props} />
}
`
		navigator.clipboard.writeText(code)
		showCopied('Copied Three.js 3D Scene Code!')
	}

	return (
		<main className="fixed inset-0 z-[60] size-full overflow-hidden bg-black select-none">
			{/* BACKGROUND LAYER */}
			{viewMode === '3d' ? (
				<div className="absolute inset-0 size-full">
					<Scene
						cameraLookAt={cameraLookAt}
						cameraPosition={cameraPosition}
						floatIntensity={floatIntensity}
						className="!fixed !inset-0"
					/>
				</div>
			) : (
				/* Pure Atmospheric Ambient Gradient Canvas */
				<div
					className="absolute inset-0 size-full transition-colors duration-700"
					style={{
						backgroundColor: currentTheme.bodyBg,
						backgroundImage: `radial-gradient(circle at 50% 40%, ${currentTheme.colors[0]} 0%, ${currentTheme.colors[3]} 25%, ${currentTheme.colors[6]} 50%, ${currentTheme.colors[9]} 75%, ${currentTheme.bodyBg} 100%)`
					}}
				>
					{/* Ambient Core Light */}
					<div
						className="pointer-events-none absolute inset-0 transition-opacity duration-500"
						style={{
							background: `radial-gradient(ellipse 65% 65% at 50% 40%, ${activeColor}22 0%, transparent 70%)`
						}}
					/>
					{/* Dark Vignette Overlay */}
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.88)_100%)]" />
				</div>
			)}

			{/* Vertical Architectural Grid Lines (matching Image 2) */}
			<div className="pointer-events-none fixed inset-0 z-10 size-full">
				<div className="grid-guides container relative grid h-full max-guides-4:~px-6/8">
					<div className="border-r border-white/10 max-guides-4:border-l"></div>
					<div className="border-r border-white/10"></div>
					<div className="border-r border-white/10 max-guides-4:hidden"></div>
					<div className="border-r border-white/10 max-guides-5:hidden"></div>
				</div>
			</div>

			{/* TOP LEFT: Quick Back & Status Badge */}
			<div className="fixed top-5 left-5 z-20 flex items-center gap-3">
				<Link
					href="/"
					className="flex items-center gap-2 rounded-full border border-white/15 bg-neutral-950/80 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-xl hover:border-white/30 hover:bg-neutral-900 transition-all shadow-lg active:scale-95"
				>
					<svg className="size-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7l-7-7 7-7" />
					</svg>
					<span>Back to Main Site</span>
				</Link>

				<div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-xl">
					<span className="size-2 rounded-full bg-amber-400 animate-pulse" />
					<span>Pure Background Mode</span>
				</div>
			</div>

			{/* TOAST NOTIFICATION */}
			{copiedNotice && (
				<div className="fixed top-5 right-5 z-30 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-neutral-950/95 px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
					<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
					</svg>
					<span>{copiedNotice}</span>
				</div>
			)}

			{/* BOTTOM DOCK: FLOATING ARCHITECT COCKPIT */}
			<div className="fixed bottom-6 inset-x-0 z-20 mx-auto flex w-fit max-w-[94vw] flex-col sm:flex-row items-center gap-2.5 sm:gap-4 rounded-3xl border border-white/15 bg-neutral-950/85 p-2.5 sm:p-3 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
				{/* Mode Switcher */}
				<div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.04] p-1">
					<button
						type="button"
						onClick={() => setViewMode('3d')}
						className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
							viewMode === '3d'
								? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
								: 'text-neutral-300 hover:text-white'
						}`}
					>
						3D Scene View
					</button>
					<button
						type="button"
						onClick={() => setViewMode('ambient')}
						className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
							viewMode === 'ambient'
								? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
								: 'text-neutral-300 hover:text-white'
						}`}
					>
						Ambient Gradient View
					</button>
				</div>

				{/* Themes Picker Pills */}
				<div className="flex items-center gap-1.5 overflow-x-auto max-w-[320px] sm:max-w-none pr-1">
					{BG_THEMES.slice(0, 5).map((theme: BgTheme) => {
						const isSelected = currentTheme.id === theme.id
						return (
							<button
								key={theme.id}
								type="button"
								onClick={() => setBgTheme(theme.id)}
								title={theme.name}
								className={`group relative flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all ${
									isSelected
										? 'border-amber-400/60 bg-amber-400/15 text-white font-semibold'
										: 'border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/25 hover:text-white'
								}`}
							>
								<span
									className="size-2 rounded-full shrink-0"
									style={{ backgroundColor: theme.colors[0] }}
								/>
								<span className="truncate max-w-[80px] text-[11px]">{theme.name.split(' ')[0]}</span>
							</button>
						)
					})}
				</div>

				{/* 1-Click Code Exporters */}
				<div className="flex items-center gap-1.5 shrink-0">
					<button
						type="button"
						onClick={copyTailwindCode}
						title="Copy CSS snippet for any project"
						className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-neutral-200 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all active:scale-95 shadow-sm"
					>
						<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
							<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
						</svg>
						<span>CSS / Tailwind</span>
					</button>

					<button
						type="button"
						onClick={copyThreeJsSceneCode}
						title="Copy exact 3D Scene Three.js component code"
						className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-md shadow-amber-400/20"
					>
						<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
							<polyline points="16 18 22 12 16 6" />
							<polyline points="8 6 2 12 8 18" />
						</svg>
						<span>Copy 3D Code</span>
					</button>
				</div>
			</div>
		</main>
	)
}
