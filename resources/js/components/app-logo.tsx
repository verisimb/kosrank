export default function AppLogo() {
    return (
        <>
            {/* Expanded: logo with text (theme-aware) */}
            <span className="flex items-center group-data-[collapsible=icon]:hidden">
                <img
                    src="/logo-lightmode.svg"
                    alt="KosRank"
                    className="block h-7 w-auto dark:hidden"
                />
                <img
                    src="/logo-darkmode.svg"
                    alt="KosRank"
                    className="hidden h-7 w-auto dark:block"
                />
            </span>

            {/* Collapsed: mark only (theme-aware) */}
            <span className="hidden items-center group-data-[collapsible=icon]:flex">
                <img
                    src="/logo-no-text-lightmode.svg"
                    alt="KosRank"
                    className="block size-7 dark:hidden"
                />
                <img
                    src="/logo-no-text-darkmode.svg"
                    alt="KosRank"
                    className="hidden size-7 dark:block"
                />
            </span>
        </>
    );
}
