import {
	Canvas,
	type CanvasProps,
	extend,
	applyProps,
	type ThreeElements,
	useThree,
	useFrame
} from '@react-three/fiber'
import { Mesh, Group, MeshStandardMaterial, TorusGeometry, PointLight, CanvasTexture } from 'three'
import { OrbitControls, Text, useEnvironment, useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Suspense, useRef, useEffect } from 'react'
import { suspend } from 'suspend-react'
const studio = import('@pmndrs/assets/hdri/studio.exr')
import { motion } from 'framer-motion-3d'
import { expoOut, type MotionVector3, type MotionVector3Tuple } from '@/utils/motion'
import { useControls } from 'leva'
import useMergedProgress from '@/hooks/useMergedProgress'
import { useLiaColor } from '@/store/liaColor'
import { useBgTheme } from '@/store/bgTheme'

extend({
	Mesh,
	Group,
	PointLight,
	TorusGeometry,
	CanvasTexture,
	MeshStandardMaterial
})

export default function Scene({
	cameraPosition,
	cameraLookAt,
	floatIntensity,
	floatSpeed,
	...props
}: CameraRigProps & Omit<CanvasProps, 'children'>) {
	// const { control } = useControls({ control: false })
	const liaColor = useLiaColor()
	const bgTheme = useBgTheme()
	const rimColor = liaColor === bgTheme.suggestedLiaColor ? (bgTheme.rimColor ?? liaColor) : liaColor

	return (
		<Canvas
			{...props}
			dpr={[1, typeof window !== 'undefined' && window.innerWidth < 768 ? 1.5 : 2]}
			camera={{ position: [20, 0, -5], fov: 8 }}
		>
			{/* {!control && ( */}
			<CameraRig
				cameraLookAt={cameraLookAt}
				cameraPosition={cameraPosition}
				floatIntensity={floatIntensity}
				floatSpeed={floatSpeed}
			/>
			{/* )} */}
			<RadialGradientTexture
				key={bgTheme.id}
				attach="background"
				stops={bgTheme.stops}
				colors={bgTheme.colors}
				radius={bgTheme.radius}
				gradientCenter={bgTheme.gradientCenter}
				size={1024}
			/>
			<Suspense fallback={null}>
				<Light />
				{/* @ts-expect-error hopefully just an issue with React 19 RC */}
				<motion.group
					initial={{ y: -3 }}
					animate={{ y: 0 }}
					transition={{ type: "spring", duration: 0.9, bounce: 0 }}
				>
					<Bodybuilder position={[0, -0.2, 0]} scale={1.2} rotation-y={0.2} />
					{/* <Box /> */}
					<pointLight position={[0, 0, -2]} decay={0.5} intensity={2.5} color={rimColor} />
					{/* @ts-expect-error " */}
				</motion.group>
			</Suspense>
			<EffectComposer multisampling={0} enableNormalPass={false}>
				{/* <SSR
					temporalResolve={false}
					maxSamples={0}
					STRETCH_MISSED_RAYS
					USE_MRT
					USE_NORMALMAP
					USE_ROUGHNESSMAP
					ENABLE_BLUR
					blurMix={0.2}
					blurKernelSize={8}
					intensity={2.5}
					maxRoughness={1}
					NUM_BINARY_SEARCH_STEPS={6}
					maxDepth={1}
					maxDepthDifference={5}
					thickness={3}
					ior={1.45}
					rayStep={0.5}
					ENABLE_JITTERING
					MAX_STEPS={20}
				/> */}
				{/* <DepthOfField focusDistance={20} focalLength={5} bokehScale={2} height={480} /> */}
				<Bloom mipmapBlur intensity={0.25} />
				<Noise opacity={0.025} />
				<Vignette offset={0} darkness={bgTheme.vignetteDarkness} />
			</EffectComposer>
			{/* {control && (
				<OrbitControls
					// @ts-expect-error weird type issue
					onChange={(event) => {
						console.log(event.target.object)
					}}
				/>
			)} */}
		</Canvas>
	)
}

type CameraRigProps = {
	cameraPosition: MotionVector3Tuple
	cameraLookAt: MotionVector3Tuple
	floatIntensity: MotionVector3Tuple
	floatSpeed?: number
}

function CameraRig({
	cameraPosition,
	cameraLookAt,
	floatIntensity,
	floatSpeed = 0.5
}: CameraRigProps) {
	useFrame(({ camera, clock }) => {
		const t = clock.getElapsedTime()
		camera.position.set(
			cameraPosition[0].get() + Math.sin(t * floatSpeed) * floatIntensity[0].get(),
			cameraPosition[1].get() + Math.sin(t * floatSpeed) * floatIntensity[1].get(),
			cameraPosition[2].get() + Math.sin(t * floatSpeed) * floatIntensity[2].get()
		)
		camera.lookAt(cameraLookAt[0].get(), cameraLookAt[1].get(), cameraLookAt[2].get())
	})

	return null
}

// Glowing "LIA" Typography Light Object
function Light() {
	const liaColor = useLiaColor()

	return (
		<group position={[0, 0.2, -2.5]}>
			<Text
				fontSize={2.5}
				letterSpacing={0.12}
				anchorX="center"
				anchorY="middle"
				color="#ffffff"
			>
				LIA
				<meshStandardMaterial emissive={liaColor} emissiveIntensity={3} toneMapped={false} />
			</Text>
		</group>
	)
}

/**
 * "Venus de Milo" (https://skfb.ly/oDLJZ) by Nancy/Lanzi Luo is licensed under
 * Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
 *
 * Converted with https://github.com/pmndrs/gltfjsx
 */
type GLTFResult = GLTF & {
	nodes: {
		Object_2: Mesh
	}
	materials: {
		['Scene_-_Root']: MeshStandardMaterial
	}
}

function Bodybuilder(props: ThreeElements['group']) {
	const { scene, materials } = useGLTF('/bodybuilder.glb')
	// @ts-expect-error weird suspend types
	const envMap = useEnvironment({ files: suspend(studio).default })

	useEffect(() => {
		scene.traverse((child) => {
			if ('isMesh' in child && child.isMesh) {
				child.castShadow = true
				child.receiveShadow = true
			}
		})
	}, [scene])

	if (materials && materials['Scene_-_Root']) {
		applyProps(materials['Scene_-_Root'], {
			color: '#0a0a0a',
			roughness: 0.32,
			metalness: 0.65,
			envMap
		})
	}

	return (
		<group {...props} dispose={null}>
			<primitive object={scene} />
		</group>
	)
}

useGLTF.preload('/bodybuilder.glb')

type RadialGradientTextureProps = Omit<ThreeElements['canvasTexture'], 'args'> & {
	stops: Array<number>
	colors: Array<string>
	size?: number
	width?: number
	gradientCenter?: [x: number, y: number]
	radius?: number
}

function RadialGradientTexture({
	stops,
	colors,
	size = 1024,
	gradientCenter: [cx, cy] = [512, 512],
	radius = 512,
	...props
}: RadialGradientTextureProps) {
	const gl = useThree((state) => state.gl)

	if (typeof document === 'undefined') return null

	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')!
	canvas.width = canvas.height = size

	const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius)
	stops.forEach((stop, i) => {
		gradient.addColorStop(stop, colors[i])
	})

	context.save()
	context.fillStyle = gradient
	context.fillRect(0, 0, size, size)
	context.restore()

	return <canvasTexture args={[canvas]} colorSpace={gl.outputColorSpace} attach="map" {...props} />
}
