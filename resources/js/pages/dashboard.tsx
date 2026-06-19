import { Head, Link } from '@inertiajs/react';
import { Building2, Calculator, SlidersHorizontal, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import CalculationController from '@/actions/App/Http/Controllers/CalculationController';
import ResultController from '@/actions/App/Http/Controllers/ResultController';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

type RankingRow = {
    rank: number;
    alternative_id: number;
    code: string;
    name: string;
    score: number;
};

type Summary = {
    criteriaCount: number;
    alternativesCount: number;
    totalWeight: number;
    method: string;
    isReady: boolean;
    best: RankingRow | null;
};

type PageProps = {
    summary: Summary;
};

const number = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
});

function StatCard({
    title,
    value,
    icon,
    hint,
}: {
    title: string;
    value: ReactNode;
    icon: ReactNode;
    hint?: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardDescription className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            {hint && (
                <CardContent className="text-sm text-muted-foreground">
                    {hint}
                </CardContent>
            )}
        </Card>
    );
}

export default function Dashboard({ summary }: PageProps) {
    return (
        <>
            <Head title="Dasbor" />

            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
                <PageHeader
                    title="Dasbor"
                    description="Ringkasan data dan hasil Sistem Pendukung Keputusan pemilihan kos."
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Jumlah Kriteria"
                        value={summary.criteriaCount}
                        icon={<SlidersHorizontal className="h-4 w-4" />}
                        hint={`Total bobot: ${number.format(summary.totalWeight)}%`}
                    />
                    <StatCard
                        title="Jumlah Alternatif"
                        value={summary.alternativesCount}
                        icon={<Building2 className="h-4 w-4" />}
                        hint="Tempat kos yang dibandingkan"
                    />
                    <StatCard
                        title="Metode"
                        value={<span className="text-base">SAW</span>}
                        icon={<Calculator className="h-4 w-4" />}
                        hint={summary.method}
                    />
                </div>

                <div className="mt-4">
                    {summary.isReady && summary.best ? (
                        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                            <CardHeader>
                                <CardDescription className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                    <Trophy className="h-4 w-4" />
                                    Alternatif Terbaik
                                </CardDescription>
                                <CardTitle className="text-2xl">
                                    {summary.best.name} ({summary.best.code})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                <span>
                                    Nilai tertinggi:{' '}
                                    <span className="font-medium text-foreground">
                                        {decimal.format(summary.best.score)}
                                    </span>
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <Button asChild variant="outline">
                                        <Link
                                            href={CalculationController.index.url()}
                                        >
                                            Lihat Perhitungan
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link
                                            href={ResultController.index.url()}
                                        >
                                            Lihat Hasil & Rekomendasi
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                            </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Data belum siap untuk perhitungan
                                </CardTitle>
                                <CardDescription>
                                    Lengkapi kriteria (total bobot 100%),
                                    alternatif (minimal 5), dan seluruh nilai
                                    alternatif untuk menjalankan perhitungan
                                    SAW.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild>
                                    <Link
                                        href={CalculationController.index.url()}
                                    >
                                        Mulai Perhitungan
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dasbor',
            href: dashboard(),
        },
    ],
};
