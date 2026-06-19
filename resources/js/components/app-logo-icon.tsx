import { cn } from '@/lib/utils';

/**
 * KosRank mark (no text), theme-aware. Renders the light variant in light mode
 * and the dark variant in dark mode via CSS so it works during SSR too.
 */
export default function AppLogoIcon({ className }: { className?: string }) {
    return (
        <>
            <img
                src="/logo-no-text-lightmode.svg"
                alt="KosRank"
                className={cn('block dark:hidden', className)}
            />
            <img
                src="/logo-no-text-darkmode.svg"
                alt="KosRank"
                className={cn('hidden dark:block', className)}
            />
        </>
    );
}
