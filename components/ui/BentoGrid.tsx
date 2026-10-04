import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    fill="currentColor"
    className={className}
  >
    <path
      d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: any;
  description: string | ReactNode;
  href?: string;
  cta: string;
  onClick?: () => void;
  badge?: string;
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  onClick,
  badge,
}: BentoCardProps) => (
  <div
    key={name}
    onClick={onClick}
    className={cn(
      "group relative col-span-3 md:col-span-1 flex flex-col justify-between overflow-hidden rounded-xl cursor-pointer select-none",
      // light styles
      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      "hover:border-amber-500/40 transition-colors duration-300",
      className,
    )}
  >
    <div className="absolute inset-0 overflow-hidden pointer-events-none">{background}</div>

    {badge && (
      <div className="absolute top-4 right-4 z-20">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-amber-500/10 border border-amber-500/25 text-amber-400 font-semibold backdrop-blur-md">
          {badge}
        </span>
      </div>
    )}

    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 p-6 transition-all duration-300 group-hover:-translate-y-8">
      {Icon && (
        <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-all duration-300 ease-in-out group-hover:scale-75 origin-left">
          <Icon className="h-6 w-6 stroke-[1.75]" />
        </div>
      )}
      <h3 className="text-xl font-bold font-sans tracking-tight text-neutral-800 dark:text-neutral-100 group-hover:text-amber-400 transition-colors duration-200">
        {name}
      </h3>
      <div className="max-w-lg text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
        {description}
      </div>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-20",
      )}
    >
      {href ? (
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30">
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="pointer-events-auto bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 shadow-sm"
        >
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-amber-500/[0.03]" />
  </div>
);

export { BentoCard, BentoGrid, ArrowRightIcon };
