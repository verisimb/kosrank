import { Head, Link } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts';
import AlternativeValueController from '@/actions/App/Http/Controllers/AlternativeValueController';
import ResultController from '@/actions/App/Http/Controllers/ResultController';
import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from '@/components/ui/chart';
import type {ChartConfig} from '@/components/ui/chart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type RankingRow = {
    rank: number;
    alternative_id: number;
    code: string;
    name: string;
    score: number;
};

type PageProps = {
    validationErrors: string[];
    ranking: RankingRow[];
    best: RankingRow | null;
};

const decimal = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
});

const chartConfig = {
    score: {
        label: 'Nilai Preferensi',
    },
} satisfies ChartConfig;

export default function ResultIndex({
    validationErrors,
    ranking,
    best,
}: PageProps) {
    const chartData = ranking.map((row) => ({
        label: row.code,
        name: row.name,
        score: row.score,
        rank: row.rank,
    }));

    return (
        <>
            <Head title="Hasil & Rekomendasi" />

            <div className="px-4 py-6">
                <Heading
                    title="Hasil & Rekomendasi"
                    description="Peringkat akhir kos berdasarkan metode Simple Additive Weighting."
                />

                {validationErrors.length > 0 && (
                    <div className="space-y-4">
                        <AlertError
                            title="Hasil belum dapat ditampilkan"
                            errors={validationErrors}
                        />
                        <Button asChild variant="outline">
                            <Link href={AlternativeValueController.index.url()}>
                                Lengkapi Nilai Alternatif
                            </Link>
                        </Button>
                    </div>
                )}

                {validationErrors.length === 0 && ranking.length > 0 && (
                    <div className="space-y-6">
                        {/* Rekomendasi utama */}
                        {best && (
                            <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                                <CardHeader>
                                    <CardDescription className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                        <Trophy className="h-4 w-4" />
                                        Rekomendasi Utama
                                    </CardDescription>
                                    <CardTitle className="text-2xl">
                                        {best.name} ({best.code})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {best.name}
                                    </span>{' '}
                                    menempati peringkat pertama dengan nilai
                                    preferensi tertinggi sebesar{' '}
                                    <span className="font-medium text-foreground">
                                        {decimal.format(best.score)}
                                    </span>
                                    , sehingga menjadi pilihan kos terbaik
                                    berdasarkan kriteria dan bobot yang
                                    ditetapkan.
                                </CardContent>
                            </Card>
                        )}

                        {/* Grafik batang nilai preferensi (recharts via shadcn) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Grafik Nilai Preferensi
                                </CardTitle>
                                <CardDescription>
                                    Perbandingan nilai preferensi (Vi) tiap
                                    alternatif. Semakin panjang batang, semakin
                                    tinggi nilainya.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={chartConfig}
                                    className="h-[320px] w-full"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={chartData}
                                        layout="vertical"
                                        margin={{ left: 8, right: 32 }}
                                    >
                                        <XAxis type="number" dataKey="score" hide />
                                        <YAxis
                                            type="category"
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            width={48}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    labelKey="score"
                                                    formatter={(value) => [
                                                        decimal.format(
                                                            Number(value),
                                                        ),
                                                        ' Nilai Preferensi',
                                                    ]}
                                                />
                                            }
                                        />
                                        <Bar dataKey="score" radius={5}>
                                            {chartData.map((entry) => (
                                                <Cell
                                                    key={entry.label}
                                                    fill={
                                                        entry.rank === 1
                                                            ? '#10b981'
                                                            : 'var(--primary)'
                                                    }
                                                />
                                            ))}
                                            <LabelList
                                                dataKey="score"
                                                position="right"
                                                className="fill-foreground"
                                                fontSize={12}
                                                formatter={(value: number) =>
                                                    decimal.format(value)
                                                }
                                            />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Tabel peringkat */}
                        <div className="overflow-x-auto rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">
                                            Peringkat
                                        </TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Nama Kos</TableHead>
                                        <TableHead className="text-right">
                                            Nilai Akhir
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ranking.map((row) => (
                                        <TableRow
                                            key={row.alternative_id}
                                            className={
                                                row.rank === 1
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/10'
                                                    : undefined
                                            }
                                        >
                                            <TableCell className="text-right font-medium">
                                                {row.rank}
                                            </TableCell>
                                            <TableCell>{row.code}</TableCell>
                                            <TableCell className="font-medium">
                                                {row.name}
                                                {row.rank === 1 && (
                                                    <Badge className="ml-2">
                                                        Terbaik
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {decimal.format(row.score)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ResultIndex.layout = {
    breadcrumbs: [
        {
            title: 'Hasil & Rekomendasi',
            href: ResultController.index.url(),
        },
    ],
};
