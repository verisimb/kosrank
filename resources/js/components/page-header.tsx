import type { ReactNode } from 'react';

/**
 * Consistent page header for the SPK pages: title + optional description on the
 * left, optional action(s) on the right. Stacks vertically on mobile.
 */
export default function PageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {action && <div className="flex shrink-0 gap-2">{action}</div>}
        </div>
    );
}
