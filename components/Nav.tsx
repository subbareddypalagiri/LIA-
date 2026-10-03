import clsx from 'clsx'

export function Root({ children, className, ...props }: JSX.IntrinsicElements['nav']) {
	return (
		<nav className={clsx(className, 'text-xs font-medium uppercase tracking-widest')} {...props}>
			<ul className="flex items-center gap-6">{children}</ul>
		</nav>
	)
}

export function Item({
	active = false,
	className,
	children,
	onClick,
	...props
}: JSX.IntrinsicElements['button'] & { active?: boolean }) {
	return (
		<li className="group relative">
			<button
				type="button"
				onClick={onClick}
				className={clsx(
					className,
					'cursor-pointer uppercase tracking-widest text-xs font-semibold transition-colors duration-150',
					active ? 'text-amber-400' : 'text-white/75 hover:text-white'
				)}
				{...props}
			>
				{children}
			</button>
			<div
				className={clsx(
					'absolute left-0 top-[140%] h-0.5 w-full transition-all duration-200',
					active
						? 'rounded-full bg-amber-400'
						: 'bg-white/80 [clip-path:inset(0_100%_0_0_round_100px)] group-hover:bg-amber-300 group-hover:[clip-path:inset(0_0_0_0_round_100px)]'
				)}
			/>
		</li>
	)
}
