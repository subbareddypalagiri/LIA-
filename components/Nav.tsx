import clsx from 'clsx'

export function Root({ children, className, ...props }: JSX.IntrinsicElements['nav']) {
	return (
		<nav className={clsx(className, 'flex items-center')} {...props}>
			<ul className="flex items-center gap-1 rounded-full border border-white/10 bg-neutral-900/40 p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-xl">
				{children}
			</ul>
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
		<li className="relative">
			<button
				type="button"
				onClick={onClick}
				className={clsx(
					className,
					'cursor-pointer uppercase tracking-wider text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 select-none active:scale-95',
					active
						? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-[0_2px_12px_rgba(245,158,11,0.35)] font-bold'
						: 'text-neutral-300 hover:text-white hover:bg-white/10'
				)}
				{...props}
			>
				{children}
			</button>
		</li>
	)
}
