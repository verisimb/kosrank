import { cn } from '@/lib/utils';

type Row = {
    code: string;
    name: string;
    score: number;
    rank: number;
};

const decimal = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
});

/**
 * Simple horizontal bar chart of preference scores (Vi). The longest bar (rank
 * 1) is highlighted. Each row shows the alternative label and its numeric value.
 */
export default function PreferenceBarChart({ data }: { data: Row[] }) {
    const maxScore = data.reduce(
        (max, row) => (row.score > max ? row.score : max),
        0,
    );

    return (
        <div className="space-y-3">
            {data.map((row) => {
                const widthPercent =
                    maxScore > 0 ? (row.score / maxScore) * 100 : 0;

                return (
                    <div key={row.code} className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="truncate font-medium">
                                {row.code} - {row.name}
                            </span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                                {decimal.format(row.score)}
                            </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn(
                                    'h-full rounded-full',
                                    row.rank === 1
                                        ? 'bg-emerald-500'
                                        : 'bg-primary',
                                )}
                                style={{ width: `${widthPercent}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
